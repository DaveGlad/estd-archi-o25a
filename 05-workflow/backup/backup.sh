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
# that works, right up until the restore — which is dysfunction n° 2 of the état des lieux
# in a slightly more modern costume.
trap 'die "aborted at line $LINENO"' ERR

mkdir -p "$STAGING"
log "starting ${KIND} backup into ${STAGING}"

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

  # `pg_dump -Fc`, not plain SQL. The custom format is compressed, and it can be restored
  # table by table — which is what you actually want at 3am when one table was truncated by
  # a bad migration and the rest of the database is fine.
  #
  # Run INSIDE the container, so the client version always matches the server version.
  docker exec "$container" pg_dump \
    -U "${POSTGRES_USER:-theetiptop}" \
    -d "${POSTGRES_DB:-theetiptop}" \
    --format=custom --compress=9 --no-owner --no-privileges \
    > "${STAGING}/postgres-${environment}.dump"

  # The number that makes a restore verifiable without reading the whole dump. 500,000 is
  # the contest's entire reason for existing; a backup with 4 of them is not a backup.
  docker exec "$container" psql -U "${POSTGRES_USER:-theetiptop}" -d "${POSTGRES_DB:-theetiptop}" \
    -tAc 'SELECT count(*) FROM "TicketCode"' > "${STAGING}/postgres-${environment}.codecount"

  log "${environment}: $(wc -c < "${STAGING}/postgres-${environment}.dump") bytes, \
$(cat "${STAGING}/postgres-${environment}.codecount") codes"
done

# ------------------------------------------------------------- 2. the workflow itself
#
# Gitea holds the source of every project. It is the one loss the agency could not work
# around: images can be rebuilt, pipelines rewritten, but code that exists nowhere else is
# simply gone.
if docker ps --format '{{.Names}}' | grep -q gitea; then
  # Gitea's own dump: repositories, database, LFS, avatars, configuration, in one archive
  # that `gitea restore` understands. A tar of the data directory would miss the database.
  docker exec -u git gitea /usr/local/bin/gitea dump -c /data/gitea/conf/app.ini \
    --file - --type tar.gz > "${STAGING}/gitea.tar.gz"
  log "gitea: $(wc -c < "${STAGING}/gitea.tar.gz") bytes"
fi

# Jenkins: jobs, credentials store, plugin list. Not the build history — hundreds of
# gigabytes of logs for artefacts that are already in the registry, and restoring them
# would slow the restore down for no operational value.
if docker ps --format '{{.Names}}' | grep -q jenkins; then
  docker run --rm --volumes-from jenkins -v "${STAGING}:/out" alpine:3 \
    tar czf /out/jenkins-home.tar.gz \
      --exclude='jobs/*/builds' \
      --exclude='workspace' \
      --exclude='caches' \
      -C /var/jenkins_home .
  log "jenkins: $(wc -c < "${STAGING}/jenkins-home.tar.gz") bytes"
fi

# The registry. Arguably redundant — every image can be rebuilt from a tag — but only if
# Gitea and Jenkins are both back first. Keeping the images shortens an outage from hours
# to minutes, and they compress to very little since the layers are already compressed.
if docker ps --format '{{.Names}}' | grep -q registry; then
  docker run --rm --volumes-from registry -v "${STAGING}:/out" alpine:3 \
    tar czf /out/registry.tar.gz -C /var/lib/registry .
fi

# Grafana dashboards and Prometheus alert rules: small, and tedious to rebuild from memory
# at exactly the moment you need visibility.
docker run --rm -v monitoring-data:/data -v "${STAGING}:/out" alpine:3 \
  tar czf /out/monitoring.tar.gz -C /data . 2>/dev/null || log "monitoring: nothing to back up"

# ------------------------------------------------------------- 3. a readable manifest
{
  echo "stamp=${STAMP}"
  echo "kind=${KIND}"
  echo "host=$(hostname)"
  echo "docker=$(docker --version)"
  echo "files:"
  (cd "$STAGING" && sha256sum ./* | sed 's/^/  /')
} > "${STAGING}/MANIFEST"

# ------------------------------------------------------- 4. encrypt, then send offsite
#
# Encrypted BEFORE it leaves the host. The backups contain the customer table of a contest
# with 1,200 participants — names, emails, birth dates — so an unencrypted copy at a
# storage provider would be a GDPR breach waiting for a misconfigured bucket.
#
# age rather than GPG: one key file, no keyring, no agent, and a restore procedure a tired
# person can follow correctly.
tar czf - -C "$(dirname "$STAGING")" "$(basename "$STAGING")" \
  | age -r "${BACKUP_AGE_RECIPIENT:?BACKUP_AGE_RECIPIENT is required}" \
  > "${STAGING}.tar.gz.age"

# Offsite, because a backup on the same machine protects against a bad migration and
# against nothing else — not a disk, not a fire, not a provider account suspension.
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
