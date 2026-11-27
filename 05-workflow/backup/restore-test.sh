#!/usr/bin/env bash
#
# Restores the latest backup into a throw-away database and checks that what comes back is
# the contest, not a file of the right size.
#
#   ./restore-test.sh [daily|monthly] [stamp]
#
# Task W14, and the reason it is a separate task from W13: a backup that has never been
# restored is a hypothesis. This script is what turns it into a fact, and it runs on a
# schedule, monthly, weekly during the 30 days of the contest, as written in CDC part F.
#
# It restores into a container created for the occasion and destroyed afterwards. It never
# touches a live database: a restore drill that can damage production is a drill nobody
# runs, which defeats the purpose.

set -Eeuo pipefail

KIND="${1:-daily}"
readonly REMOTE="${BACKUP_REMOTE:?BACKUP_REMOTE is required}"
readonly WORK="$(mktemp -d /tmp/restore-test.XXXXXX)"
readonly CONTAINER="restore-test-$$"
readonly REPORT="/var/log/theetiptop/restore-test-$(date -u +%Y-%m-%d).md"

# Every exit path cleans up, including the failures, otherwise the first failed drill
# leaves a container and a few gigabytes behind, and the second one fails on disk space
# for reasons that have nothing to do with the backup.
cleanup() {
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

log()  { echo "[$(date -u +%H:%M:%S)] $*" | tee -a "$REPORT"; }
fail() { log "❌ $*"; FAILURES=$((FAILURES + 1)); }
pass() { log "✅ $*"; }

FAILURES=0
mkdir -p "$(dirname "$REPORT")"

log "# Test de restauration, $(date -u +%Y-%m-%d\ %H:%M) UTC"
log ""

# --------------------------------------------------------------- 1. fetch and decrypt
# Fall back to the other set rather than cry wolf on day one.
#
# The timer asks for the monthly archive, and the first monthly one is made at the start
# of the following month. A fresh installation would therefore alert on its very first
# run, for a backup that is not late but not yet due, and an alert that fires when nothing
# is wrong is an alert the on-call learns to ignore.
#
# Falling back is said out loud. Finding NOTHING at all is still a failure, because that
# one means the backups are not running.
#
# `|| true` on both listings, and it is not decoration. rclone answers exit code 3 for a
# directory that does not exist, and a failed command substitution inside an assignment
# carries its status to `set -e`, so the script died on the very line that was supposed to
# detect the missing directory. The fallback below had become unreachable: the first run
# aborted with status 3 and no message at all, which reads like a broken script rather
# than a backup set that is simply one month young.
latest_in() { rclone lsf "${REMOTE}/${1}/" 2>/dev/null | sort | tail -1 || true; }

STAMP="${2:-$(latest_in "$KIND" || true)}"
if [[ -z "$STAMP" ]]; then
  for fallback in daily monthly; do
    [[ "$fallback" == "$KIND" ]] && continue
    STAMP="$(latest_in "$fallback" || true)"
    if [[ -n "$STAMP" ]]; then
      log "no ${KIND} archive yet, falling back to the latest ${fallback} one"
      KIND="$fallback"
      break
    fi
  done
fi
[[ -n "$STAMP" ]] || { fail "no backup found at all in ${REMOTE}"; exit 1; }

log "Sauvegarde testée : \`${STAMP}\`"

START_FETCH=$SECONDS
rclone copy "${REMOTE}/${KIND}/${STAMP}" "$WORK/"
age -d -i "${BACKUP_AGE_KEY:?BACKUP_AGE_KEY is required}" "${WORK}/${STAMP}" \
  | tar xzf - -C "$WORK"
FETCH_SECONDS=$((SECONDS - START_FETCH))

DUMP_DIR="$(find "$WORK" -name 'postgres-prod.dump' -exec dirname {} \; | head -1)"
[[ -n "$DUMP_DIR" ]] || { fail "no production dump inside the archive"; exit 1; }
pass "Archive récupérée et déchiffrée en ${FETCH_SECONDS} s"

# --------------------------------------------------------------- 2. checksums first
#
# Before restoring anything. A dump truncated in transfer will fail somewhere in the
# middle of a long restore with a confusing error; comparing the hash first tells you in
# two seconds that the problem is the transfer, not the database.
if (cd "$DUMP_DIR" && sha256sum --quiet -c <(grep -A100 '^files:' MANIFEST | tail -n +2 | sed 's/^  //')); then
  pass "Empreintes conformes au manifeste"
else
  fail "Empreinte divergente : l'archive est corrompue"
  exit 1
fi

# --------------------------------------------------------------- 3. restore for real
log ""
log "## Restauration"

docker run -d --name "$CONTAINER" \
  -e POSTGRES_USER=theetiptop \
  -e POSTGRES_PASSWORD=restore-test \
  -e POSTGRES_DB=theetiptop \
  -e POSTGRES_INITDB_ARGS='--locale=C --encoding=UTF8' \
  postgres:17-alpine >/dev/null

until docker exec "$CONTAINER" pg_isready -U theetiptop >/dev/null 2>&1; do sleep 1; done

START_RESTORE=$SECONDS
docker exec -i "$CONTAINER" pg_restore -U theetiptop -d theetiptop --no-owner --no-privileges \
  < "${DUMP_DIR}/postgres-prod.dump"
RESTORE_SECONDS=$((SECONDS - START_RESTORE))

pass "Base restaurée en ${RESTORE_SECONDS} s"

# ------------------------------------------------------- 4. is it actually the contest
#
# The part that distinguishes this from "the file exists". Four properties, each of which
# a plausible corruption would break while leaving the dump a valid PostgreSQL archive.
log ""
log "## Contrôles métier"

query() { docker exec "$CONTAINER" psql -U theetiptop -d theetiptop -tAc "$1"; }

# a) The pool is whole. The count was recorded at backup time, so this compares the
#    restore against what was actually there, not against a constant that could drift.
EXPECTED_CODES="$(cat "${DUMP_DIR}/postgres-prod.codecount" 2>/dev/null || echo 500000)"
ACTUAL_CODES="$(query 'SELECT count(*) FROM "TicketCode"')"
if [[ "$ACTUAL_CODES" == "${EXPECTED_CODES// /}" ]]; then
  pass "Codes : ${ACTUAL_CODES} (attendu ${EXPECTED_CODES// /})"
else
  fail "Codes : ${ACTUAL_CODES}, attendu ${EXPECTED_CODES// /}"
fi

# b) The split the bailiff holds a copy of. A restore that lost rows unevenly would still
#    produce a database that opens and queries fine, and a contest that no longer matches
#    its filed rules.
#
# Two details in this one query, both of which had to be got wrong once to be seen.
#
# The separator is dollar-quoted, `$sep$, $sep$`. It is a STRING, so double quotes are not
# an option, Postgres reads those as a column name and answers `column ", " does not
# exist`; and a single quote cannot appear inside the single-quoted shell argument the
# query travels in. Dollar quoting is the one form that needs neither.
#
# And the sort runs on the number, with the formatting applied afterwards. Ordering the
# text would have put `6.00` ahead of `20.00`, since `.` sorts before `0`, so the check
# would have failed on a perfectly correct restore.
SPLIT="$(query '
  SELECT string_agg(to_char(share, $fmt$FM990.00$fmt$), $sep$, $sep$ ORDER BY share DESC)
  FROM (
    SELECT round(count(*) * 100.0 / sum(count(*)) OVER (), 2) AS share
    FROM "TicketCode" GROUP BY "prizeId"
  ) s')"
if [[ "$SPLIT" == "60.00, 20.00, 10.00, 6.00, 4.00" ]]; then
  pass "Répartition : ${SPLIT} %"
else
  fail "Répartition : ${SPLIT} %, attendu 60.00, 20.00, 10.00, 6.00, 4.00"
fi

# c) Participations and their users came back together. A dump restored without its
#    foreign keys satisfied would mean prizes nobody can claim.
ORPHANS="$(query '
  SELECT count(*) FROM "Participation" p
  LEFT JOIN "User" u ON u.id = p."userId"
  WHERE u.id IS NULL')"
[[ "$ORPHANS" == "0" ]] && pass "Aucune participation orpheline" || fail "${ORPHANS} participations sans client"

# d) The indexes, not just the data. pg_restore rebuilds them, and a restore that
#    "succeeded" without the unique index on `code` would let the same code be played
#    twice, the one guarantee the whole application rests on.
#
#    Both comparisons are against STRINGS here, the table's name as a value in a catalogue
#    column and a pattern, so both are dollar-quoted like the separator above. They were
#    written `\"TicketCode\"`, which inside a single-quoted shell argument keeps its
#    backslashes and reaches Postgres as nonsense; and the `2>/dev/null || echo 0` that
#    followed turned the resulting error into a count of zero. The check then reported the
#    index as missing on a database that had it, which is the one answer worse than no
#    check at all: a red light that says nothing about the thing it is watching. The
#    silencer is gone with it, so a broken query fails as a broken query.
UNIQUE_INDEX="$(query '
  SELECT count(*) FROM pg_indexes
  WHERE tablename = $t$TicketCode$t$ AND indexdef LIKE $p$%UNIQUE%(code)%$p$')"
[[ "$UNIQUE_INDEX" -ge 1 ]] && pass "Index unique sur le code présent" || fail "Index unique sur le code ABSENT"

# --------------------------------------------------------------------- 5. verdict
log ""
log "## Résultat"
log ""
log "| Mesure | Valeur |"
log "|---|---|"
log "| Récupération et déchiffrement | ${FETCH_SECONDS} s |"
log "| Restauration PostgreSQL | ${RESTORE_SECONDS} s |"
log "| **RTO constaté** | **$((FETCH_SECONDS + RESTORE_SECONDS)) s** |"
log "| Contrôles en échec | ${FAILURES} |"

# The RTO is measured here and nowhere else. A recovery time objective written in a
# specification is an intention; this is the only place the project learns the real number.
cat > /var/lib/node_exporter/textfile/restore-test.prom <<EOF
# HELP restore_test_last_success_timestamp_seconds Unix time of the last successful restore drill.
# TYPE restore_test_last_success_timestamp_seconds gauge
restore_test_last_success_timestamp_seconds $([[ $FAILURES -eq 0 ]] && date +%s || echo 0)
# HELP restore_test_duration_seconds Measured recovery time.
# TYPE restore_test_duration_seconds gauge
restore_test_duration_seconds $((FETCH_SECONDS + RESTORE_SECONDS))
# HELP restore_test_failed_checks Number of business checks that failed.
# TYPE restore_test_failed_checks gauge
restore_test_failed_checks ${FAILURES}
EOF

if [[ $FAILURES -gt 0 ]]; then
  log ""
  log "**La sauvegarde \`${STAMP}\` n'est pas restaurable en l'état.**"
  exit 1
fi

log ""
log "**Sauvegarde \`${STAMP}\` restaurable et conforme.** Rapport : \`${REPORT}\`"
