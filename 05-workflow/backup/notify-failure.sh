#!/usr/bin/env bash
#
# Notifies the on-call rota that a scheduled backup job failed.
#
#   ./notify-failure.sh <unit-name>
#
# Invoked by `OnFailure=` in the systemd units, never by hand. It is deliberately the
# simplest thing that works: this script runs at the moment something else is already
# broken, so it must not depend on Docker, on the database, or on anything else that may
# be the cause of the failure.

set -uo pipefail   # no -e: a failing notification must still try the other channel

readonly UNIT="${1:-unité inconnue}"
readonly HOST="$(hostname)"
readonly WHEN="$(date -u '+%Y-%m-%d %H:%M UTC')"

# The last lines of the failing unit's journal, which is what the person woken up actually
# needs. A notification that only says "it failed" costs a round trip to the server before
# anyone can even judge the urgency.
EXTRACT="$(journalctl -u "$UNIT" -n 20 --no-pager 2>/dev/null || echo '(journal illisible)')"

read -r -d '' MESSAGE <<MSG || true
🔴 Sauvegarde en échec, ${HOST}

Unité  : ${UNIT}
Heure  : ${WHEN}

${EXTRACT}

Procédure : 05-workflow/backup/README.md
MSG

# Two independent channels, because the first thing an incident takes down is often the
# way you find out about incidents.
if [[ -n "${ALERT_WEBHOOK:-}" ]]; then
  curl -fsS --max-time 10 -X POST "$ALERT_WEBHOOK" \
    -H 'Content-Type: application/json' \
    -d "$(jq -Rn --arg t "$MESSAGE" '{text: $t}')" >/dev/null \
    || logger -t backup-alert "webhook unreachable"
fi

if [[ -n "${ALERT_EMAIL:-}" ]]; then
  printf '%s\n' "$MESSAGE" | mail -s "🔴 Sauvegarde en échec, ${HOST}, ${UNIT}" "$ALERT_EMAIL" \
    || logger -t backup-alert "mail command failed"
fi

# Always, whatever the channels did. The journal is the one place the trace survives even
# if both notifications fail.
logger -t backup-alert -p user.err "FAILED ${UNIT} on ${HOST}"

# Zeroes the freshness gauge, so Grafana shows the backup as stale within a scrape rather
# than waiting for the 26-hour alert rule to fire.
if [[ -d /var/lib/node_exporter/textfile ]]; then
  echo 'backup_last_run_failed 1' > /var/lib/node_exporter/textfile/backup-failure.prom
fi
