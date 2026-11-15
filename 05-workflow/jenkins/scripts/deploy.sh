#!/usr/bin/env bash
#
# Deploys one environment of the contest site from images already in the registry.
#
#   ./deploy.sh <dev|preprod|prod> <tag>
#
# Called by the Jenkinsfile. Written as a script rather than inline pipeline steps so that
# an operator can run exactly what the CI runs when the CI is the thing that is broken —
# which is the moment a deployment procedure is actually needed.
#
# It PULLS, it never builds. An image built on the target host is not the artefact the
# pipeline tested: different base layer cache, different clock, possibly different source.
# Requirement 4c exists so that what runs is what was tested.

set -Eeuo pipefail

ENVIRONMENT="${1:-}"
TAG="${2:-}"

readonly COMPOSE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../docker" && pwd)"
readonly COMPOSE_FILE="${COMPOSE_DIR}/compose.prod.yml"

die() { echo "deploy: $*" >&2; exit 1; }

case "$ENVIRONMENT" in
  dev|preprod|prod) ;;
  *) die "usage: deploy.sh <dev|preprod|prod> <tag>" ;;
esac

[[ -n "$TAG" ]] || die "a tag is required — 'latest' is not deployable, see CST D.2"
[[ "$TAG" != "latest" ]] || die "refusing to deploy 'latest': a deployed artefact must be identifiable and reversible"

readonly ENV_FILE="${COMPOSE_DIR}/.env.${ENVIRONMENT}"
[[ -f "$ENV_FILE" ]] || die "missing ${ENV_FILE} — copy .env.deploy.example and fill it in"

readonly PROJECT="theetiptop-${ENVIRONMENT}"

echo "==> ${ENVIRONMENT}: deploying ${TAG}"

# What is running right now, so a failure has something to roll back to. Read before
# anything is touched: once `up` has started, the previous tag is no longer observable.
PREVIOUS_TAG="$(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" -p "$PROJECT" \
  ps --format '{{.Image}}' 2>/dev/null | grep -o '/api:[^ ]*' | head -1 | cut -d: -f2 || true)"
echo "    currently running: ${PREVIOUS_TAG:-nothing}"

# IMAGE_TAG is read by compose.prod.yml. Appended rather than exported so the value is
# visible to an operator reading the env file afterwards, and so a rollback can reuse it.
sed -i.bak '/^IMAGE_TAG=/d' "$ENV_FILE"
echo "IMAGE_TAG=${TAG}" >> "$ENV_FILE"
rm -f "${ENV_FILE}.bak"

echo "==> pulling images"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" -p "$PROJECT" pull --quiet

# The migration job runs on its own, before the applications, and the compose file makes
# the three services wait on `service_completed_successfully`. A container that comes up
# against a schema it does not match is a far worse failure than a deployment that stops
# here: it serves wrong answers instead of refusing to start.
echo "==> migrating the database"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" -p "$PROJECT" run --rm migrate

echo "==> starting the applications"
# `--wait` blocks on the healthchecks declared in each image, so this script does not
# report success while a container is still crash-looping.
if ! docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" -p "$PROJECT" up -d --wait --remove-orphans; then
  echo "deploy: ${TAG} did not become healthy" >&2

  if [[ -n "$PREVIOUS_TAG" ]]; then
    # Roll the IMAGES back, never the database. The migration that just ran may already
    # have rewritten data, and `migrate deploy` has no down step by design — a reversed
    # migration on live data is how you turn an outage into data loss. Recovering a schema
    # is a restore from backup, a human decision, not something a deploy script takes.
    echo "deploy: rolling images back to ${PREVIOUS_TAG}" >&2
    sed -i.bak '/^IMAGE_TAG=/d' "$ENV_FILE"
    echo "IMAGE_TAG=${PREVIOUS_TAG}" >> "$ENV_FILE"
    rm -f "${ENV_FILE}.bak"
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" -p "$PROJECT" up -d --wait --remove-orphans
    echo "deploy: rolled back. The schema was NOT reverted — check it against ${PREVIOUS_TAG}." >&2
  fi

  exit 1
fi

echo "==> ${ENVIRONMENT} is running ${TAG}"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" -p "$PROJECT" ps

# Images pile up fast at three deployments a day. Pruning only what is dangling leaves the
# previous tags in place, which is what makes the rollback above possible.
docker image prune -f --filter 'dangling=true' > /dev/null
