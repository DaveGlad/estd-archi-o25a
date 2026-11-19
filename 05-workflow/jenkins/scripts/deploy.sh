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

# Environment files live on the HOST, not in the checkout.
#
# The pipeline runs this script from a build workspace, which is a fresh clone on a
# throw-away agent: an env file there would either be absent -- the failure this
# replaces -- or, far worse, committed. These files hold the database password, the
# session secret and the till API keys.
#
# /etc/theetiptop/env is root-owned and 0700. The fallback to the compose directory keeps
# a developer's local `docker compose --env-file` habit working unchanged.
readonly HOST_ENV_DIR="${THEETIPTOP_ENV_DIR:-/etc/theetiptop/env}"
if [[ -f "${HOST_ENV_DIR}/.env.${ENVIRONMENT}" ]]; then
  readonly ENV_FILE="${HOST_ENV_DIR}/.env.${ENVIRONMENT}"
else
  readonly ENV_FILE="${COMPOSE_DIR}/.env.${ENVIRONMENT}"
fi
[[ -f "$ENV_FILE" ]] || die "no env file for '${ENVIRONMENT}': looked in ${HOST_ENV_DIR} then ${COMPOSE_DIR}"

readonly PROJECT="theetiptop-${ENVIRONMENT}"

# Only production is published. One hostname resolves today, and compose.prod.yml names
# its Traefik routers literally -- two environments from the same file would declare the
# same router twice, and Traefik keeps whichever container started last. dev and preprod
# therefore run unrouted, reachable from the host and from nothing else.
COMPOSE_FILES=(-f "$COMPOSE_FILE")
if [[ "$ENVIRONMENT" == "prod" ]]; then
  COMPOSE_FILES+=(-f "${COMPOSE_DIR}/compose.singlehost.yml")
else
  COMPOSE_FILES+=(-f "${COMPOSE_DIR}/compose.norouting.yml")
fi

echo "==> ${ENVIRONMENT}: deploying ${TAG}"

# What is running right now, so a failure has something to roll back to. Read before
# anything is touched: once `up` has started, the previous tag is no longer observable.
PREVIOUS_TAG="$(docker compose "${COMPOSE_FILES[@]}" --env-file "$ENV_FILE" -p "$PROJECT" \
  ps --format '{{.Image}}' 2>/dev/null | grep -o '/api:[^ ]*' | head -1 | cut -d: -f2 || true)"
echo "    currently running: ${PREVIOUS_TAG:-nothing}"

# IMAGE_TAG is exported, not written into the env file.
#
# Writing it there was the first shape, so an operator could read which tag was deployed.
# It is wrong twice over: the file holds secrets and is mounted READ-ONLY into the build
# agents -- the deployment failed with a bare `exit 4` from sed, three stages after the
# images were pushed -- and a deployment tag is an input, not state that belongs in a
# credentials file.
#
# Compose gives shell variables precedence over --env-file, so this simply wins. Which tag
# is running is answered by `docker compose ps`, which cannot drift from reality.
export IMAGE_TAG="$TAG"

# The front images are built per environment, so their tag carries it. See the comment on
# the `web` service in compose.prod.yml.
export FRONT_IMAGE_TAG="${TAG}-${ENVIRONMENT}"

# The registry requires authentication, and the push stage logs out when it is done --
# deliberately, so a build does not leave a credential lying on a shared agent. The pull
# therefore needs its own login, or compose stops on "no basic auth credentials" with the
# images sitting right there in the registry.
#
# Optional: an operator running this by hand against a local registry needs no login, and
# `docker pull` will say so clearly if one was required.
if [[ -n "${REGISTRY_USER:-}" && -n "${REGISTRY_PASSWORD:-}" && -n "${REGISTRY:-}" ]]; then
  echo "==> authenticating to ${REGISTRY}"
  printf '%s' "$REGISTRY_PASSWORD" | docker login "$REGISTRY" -u "$REGISTRY_USER" --password-stdin
  # Logged out on every exit path, success or failure.
  trap 'docker logout "$REGISTRY" >/dev/null 2>&1 || true' EXIT
fi

echo "==> pulling images"
docker compose "${COMPOSE_FILES[@]}" --env-file "$ENV_FILE" -p "$PROJECT" pull --quiet

# The migration job runs on its own, before the applications, and the compose file makes
# the three services wait on `service_completed_successfully`. A container that comes up
# against a schema it does not match is a far worse failure than a deployment that stops
# here: it serves wrong answers instead of refusing to start.
echo "==> migrating the database"
docker compose "${COMPOSE_FILES[@]}" --env-file "$ENV_FILE" -p "$PROJECT" run --rm migrate

echo "==> starting the applications"
# `--wait` blocks on the healthchecks declared in each image, so this script does not
# report success while a container is still crash-looping.
if ! docker compose "${COMPOSE_FILES[@]}" --env-file "$ENV_FILE" -p "$PROJECT" up -d --wait --remove-orphans; then
  echo "deploy: ${TAG} did not become healthy" >&2

  if [[ -n "$PREVIOUS_TAG" ]]; then
    # Roll the IMAGES back, never the database. The migration that just ran may already
    # have rewritten data, and `migrate deploy` has no down step by design — a reversed
    # migration on live data is how you turn an outage into data loss. Recovering a schema
    # is a restore from backup, a human decision, not something a deploy script takes.
    echo "deploy: rolling images back to ${PREVIOUS_TAG}" >&2
    export IMAGE_TAG="$PREVIOUS_TAG"
    docker compose "${COMPOSE_FILES[@]}" --env-file "$ENV_FILE" -p "$PROJECT" up -d --wait --remove-orphans
    echo "deploy: rolled back. The schema was NOT reverted — check it against ${PREVIOUS_TAG}." >&2
  fi

  exit 1
fi

echo "==> ${ENVIRONMENT} is running ${TAG}"
docker compose "${COMPOSE_FILES[@]}" --env-file "$ENV_FILE" -p "$PROJECT" ps

# Images pile up fast at three deployments a day. Pruning only what is dangling leaves the
# previous tags in place, which is what makes the rollback above possible.
docker image prune -f --filter 'dangling=true' > /dev/null
