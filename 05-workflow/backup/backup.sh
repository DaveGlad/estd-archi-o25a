#!/usr/bin/env bash
#
# Daily backup of the whole workflow and of every project it manages.
#
# Requirement n° 8: "Vous devrez automatiser le backup de l'intégralité de votre workflow
# et des projets gérés avec ce dernier." Both halves matter. Backing up the client
# databases and losing Jenkins would leave the agency with data it cannot deploy; backing
# up Jenkins and losing the databases would leave it with a pipeline and nothing to ship.
#
#   ./backup.sh [daily|monthly]
#
# Scheduled by the systemd timer in this directory. Run by hand it behaves identically,
# which is deliberate: a backup procedure nobody can execute manually is a procedure nobody
# can verify.

set -Eeuo pipefail

readonly KIND="${1:-daily}"
readonly STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
readonly STAGING="/var/backups/theetiptop/${KIND}/${STAMP}"
readonly REMOTE="${BACKUP_REMOTE:?BACKUP_REMOTE is required, e.g. s3:backups-dsp5}"
readonly LOG_TAG="backup-${KIND}"

log() { logger -t "$LOG_TAG" -s "$*"; }
die() { log "FAILED: $*"; exit 1; }

# Any failure must be loud. A backup job that fails quietly is indistinguishable from one
# that works, right up until the restore, which is dysfunction n° 2 of the état des lieux
# in a slightly more modern costume.
trap 'die "aborted at line $LINENO"' ERR

mkdir -p "$STAGING"
log "starting ${KIND} backup into ${STAGING}"


# Resolve a container by the name compose actually gave it.
#
# The services are `gitea`, `jenkins` and `registry`, but compose prefixes them with the
# project and suffixes them with an index: `furious-ducks-workflow-gitea-1`. The first
# version of this script guarded with `docker ps | grep -q gitea`, which matched, and then
# called `docker exec gitea`, which did not. The guard passed and the command failed, which
# is the worst possible ordering.
container_named() {
  docker ps --format '{{.Names}}' | grep -m1 -E "(^|-)${1}(-[0-9]+)?$" || true
}

# ---------------------------------------------------------------- 1. the project data
#
# Three environments, three databases. Production is the one that matters, but dev and
# preprod are backed up too: losing preprod the week before a client review costs a sprint.
for environment in prod preprod dev; do
  container="theetiptop-${environment}-postgres-1"

  if ! docker ps --format '{{.Names}}' | grep -qx "$container"; then
    log "skipping ${environment}: ${container} is not running"
    continue
  fi

  # The database name is read from the environment's OWN file, not assumed.
  #
  # The three environments do not share one name: production holds `theetiptop`, dev holds
  # `theetiptop_dev`. A single default would have dumped a database that does not exist on
  # two of the three, and `pg_dump` says so on stderr while the script carries on and ships
  # an archive that looks the right shape. That is the worst failure a backup can have: it
  # only shows up on the day it is restored.
  env_file="/etc/theetiptop/env/.env.${environment}"
  db="theetiptop"
  user="theetiptop"
  if [[ -r "$env_file" ]]; then
    db="$(sed -n 's/^POSTGRES_DB=//p' "$env_file" | head -1)"
    user="$(sed -n 's/^POSTGRES_USER=//p' "$env_file" | head -1)"
  fi
  db="${POSTGRES_DB:-${db:-theetiptop}}"
  user="${POSTGRES_USER:-${user:-theetiptop}}"

  # Checked before dumping rather than discovered afterwards.
  if ! docker exec "$container" psql -U "$user" -lqt | cut -d'|' -f1 | grep -qw "$db"; then
    log "FAILED ${environment}: database '${db}' not found in ${container}"
    exit 1
  fi

  # `pg_dump -Fc`, not plain SQL. The custom format is compressed, and it can be restored
  # table by table, which is what you actually want at 3am when one table was truncated by
  # a bad migration and the rest of the database is fine.
  #
  # Run INSIDE the container, so the client version always matches the server version.
  docker exec "$container" pg_dump \
    -U "$user" -d "$db" \
    --format=custom --compress=9 --no-owner --no-privileges \
    > "${STAGING}/postgres-${environment}.dump"

  # The number that makes a restore verifiable without reading the whole dump. 500,000 is
  # the contest's entire reason for existing; a backup with 4 of them is not a backup.
  docker exec "$container" psql -U "$user" -d "$db" \
    -tAc 'SELECT count(*) FROM "TicketCode"' > "${STAGING}/postgres-${environment}.codecount"

  log "${environment}: $(wc -c < "${STAGING}/postgres-${environment}.dump") bytes, \
$(cat "${STAGING}/postgres-${environment}.codecount") codes"
done

# ------------------------------------------------------------- 2. the workflow itself
#
# Gitea holds the source of every project. It is the one loss the agency could not work
# around: images can be rebuilt, pipelines rewritten, but code that exists nowhere else is
# simply gone.
gitea_container="$(container_named gitea)"
if [[ -n "$gitea_container" ]]; then
  # Gitea's own dump: repositories, database, LFS, avatars, configuration, in one archive
  # that `gitea restore` understands. A tar of the data directory would miss the database.
  docker exec -u git "$gitea_container" /usr/local/bin/gitea dump -c /data/gitea/conf/app.ini \
    --file - --type tar.gz > "${STAGING}/gitea.tar.gz"
  log "gitea: $(wc -c < "${STAGING}/gitea.tar.gz") bytes"
fi

# Jenkins: jobs, credentials store, plugin list. Not the build history, hundreds of
# gigabytes of logs for artefacts that are already in the registry, and restoring them
# would slow the restore down for no operational value.
jenkins_container="$(container_named jenkins)"
if [[ -n "$jenkins_container" ]]; then
  docker run --rm --volumes-from "$jenkins_container" -v "${STAGING}:/out" alpine:3 \
    tar czf /out/jenkins-home.tar.gz \
      --exclude='jobs/*/builds' \
      --exclude='workspace' \
      --exclude='caches' \
      -C /var/jenkins_home .
  log "jenkins: $(wc -c < "${STAGING}/jenkins-home.tar.gz") bytes"
fi

# The registry. Arguably redundant, every image can be rebuilt from a tag, but only if
# Gitea and Jenkins are both back first. Keeping the images shortens an outage from hours
# to minutes, and they compress to very little since the layers are already compressed.
registry_container="$(container_named registry)"
if [[ -n "$registry_container" ]]; then
  docker run --rm --volumes-from "$registry_container" -v "${STAGING}:/out" alpine:3 \
    tar czf /out/registry.tar.gz -C /var/lib/registry .
fi

# Grafana dashboards and Prometheus alert rules: small, and tedious to rebuild from memory
# at exactly the moment you need visibility.
docker run --rm -v monitoring-data:/data -v "${STAGING}:/out" alpine:3 \
  tar czf /out/monitoring.tar.gz -C /data . 2>/dev/null || log "monitoring: nothing to back up"

# ------------------------------------------------------------- 3. a readable manifest
#
# The manifest lists every file EXCEPT itself.
#
# `{ ... } > MANIFEST` creates the file, empty, before the block runs, so a plain
# `sha256sum ./*` picked up `./MANIFEST` and recorded the hash of nothing. The file then
# received its content and no longer matched the line it had just written about itself.
# Every restore test failed on it, reporting a corrupt archive, while the dumps were
# perfectly intact: a false alarm on the one control whose whole job is to be trusted.
{
  echo "stamp=${STAMP}"
  echo "kind=${KIND}"
  echo "host=$(hostname)"
  echo "docker=$(docker --version)"
  echo "files:"
  (cd "$STAGING" \
    && find . -maxdepth 1 -type f ! -name MANIFEST -print0 \
    | sort -z \
    | xargs -0 sha256sum \
    | sed 's/^/  /')
} > "${STAGING}/MANIFEST"

# ------------------------------------------------------- 4. encrypt, then send offsite
#
# Encrypted BEFORE it leaves the host. The backups contain the customer table of a contest
# with 1,200 participants, names, emails, birth dates, so an unencrypted copy at a
# storage provider would be a GDPR breach waiting for a misconfigured bucket.
#
# age rather than GPG: one key file, no keyring, no agent, and a restore procedure a tired
# person can follow correctly.
tar czf - -C "$(dirname "$STAGING")" "$(basename "$STAGING")" \
  | age -r "${BACKUP_AGE_RECIPIENT:?BACKUP_AGE_RECIPIENT is required}" \
  > "${STAGING}.tar.gz.age"

# Offsite, because a backup on the same machine protects against a bad migration and
# against nothing else, not a disk, not a fire, not a provider account suspension.
rclone copy "${STAGING}.tar.gz.age" "${REMOTE}/${KIND}/" --s3-no-check-bucket

# ------------------------------------------------------------------- 5. retention
#
# 30 days of dailies plus 12 monthlies, as written in CDC part F. The monthly set is what
# covers slow corruption: a defect noticed in March may have started in January, and 30
# days of history would only hold copies of the damage.
find "/var/backups/theetiptop/${KIND}" -maxdepth 1 -type d -mtime +2 -exec rm -rf {} + 2>/dev/null || true
find "/var/backups/theetiptop/${KIND}" -maxdepth 1 -name '*.age' -mtime +2 -delete 2>/dev/null || true

case "$KIND" in
  daily)   rclone delete "${REMOTE}/daily/"   --min-age 30d ;;
  monthly) rclone delete "${REMOTE}/monthly/" --min-age 365d ;;
esac

log "completed: ${STAMP} ($(wc -c < "${STAGING}.tar.gz.age") bytes encrypted, sent to ${REMOTE})"

# Written where Prometheus' node_exporter textfile collector picks it up, so a backup that
# stops running raises an alert instead of being noticed during an incident. The rule is in
# ../monitoring/alerts.yml.
cat > /var/lib/node_exporter/textfile/backup.prom <<EOF
# HELP backup_last_success_timestamp_seconds Unix time of the last successful backup.
# TYPE backup_last_success_timestamp_seconds gauge
backup_last_success_timestamp_seconds{kind="${KIND}"} $(date +%s)
# HELP backup_size_bytes Size of the last encrypted archive.
# TYPE backup_size_bytes gauge
backup_size_bytes{kind="${KIND}"} $(wc -c < "${STAGING}.tar.gz.age")
EOF
