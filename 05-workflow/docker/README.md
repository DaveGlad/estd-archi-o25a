# Conteneurisation du site jeu-concours

Le sujet impose du **100 % Docker**. Ce dossier contient tout ce qui est nécessaire :
trois images applicatives, un compose de développement, un compose de déploiement.

## Fichiers

| Fichier | Rôle |
|---|---|
| `compose.dev.yml` | Développement local : **uniquement** PostgreSQL 17 et Redis 8. Les applications tournent en direct via `nx dev`, pour garder le rechargement à chaud |
| `Dockerfile.api` | API v1, NestJS 11 — 4 étages |
| `Dockerfile.web` | Site public, Next.js 16 — 3 étages |
| `Dockerfile.admin` | Back-office, Next.js 16 — 3 étages |
| `compose.prod.yml` | Environnements déployés : dev, préprod-QA, prod. **Un seul fichier**, trois `.env` |
| `.env.deploy.example` | Modèle de configuration d'un environnement déployé |

Le script `tools/pin-runtime-deps.mjs` du monorepo est appelé par `Dockerfile.api` ; son
en-tête documente les trois approches d'installation mesurées puis écartées.

## Construire les images

Le **contexte de build est la racine du monorepo**, `06-app/theetiptop-contest`, et non ce
dossier. C'est ce qui permet au `.dockerignore` de la racine de s'appliquer.

```bash
cd 06-app/theetiptop-contest

docker build -f ../../05-workflow/docker/Dockerfile.api \
  -t theetiptop/api:$TAG .

docker build -f ../../05-workflow/docker/Dockerfile.web \
  --build-arg NEXT_PUBLIC_API_URL=https://api.dsp5-archi-o25a-15m-g1.fr \
  --build-arg NEXT_PUBLIC_SITE_URL=https://dsp5-archi-o25a-15m-g1.fr \
  -t theetiptop/web:$TAG .

docker build -f ../../05-workflow/docker/Dockerfile.admin \
  --build-arg NEXT_PUBLIC_API_URL=https://api.dsp5-archi-o25a-15m-g1.fr \
  -t theetiptop/admin:$TAG .
```

### ⚠️ Une image front par environnement

Les variables `NEXT_PUBLIC_*` sont des **arguments de build**, pas de la configuration
d'exécution. Next.js les inscrit dans le bundle navigateur à la compilation : une image
construite avec l'URL de préprod appellera la préprod, quoi que dise le `compose` de
production.

Le pipeline construit donc une image `web` et une image `admin` **par environnement**.
L'image `api`, elle, est unique : toute sa configuration est lue à l'exécution.

## Tailles mesurées

Mesures réelles du 11 novembre 2026, `node:24-alpine` comme base.

| Image | Taille | Ce qu'elle contient |
|---|---|---|
| `theetiptop/api` | **471 Mo** | Le bundle webpack + les 20 paquets que le bundle laisse externes |
| `theetiptop/web` | **322 Mo** | La sortie `standalone` de Next, sans `node_modules` |
| `theetiptop/admin` | **319 Mo** | Idem |

Aucune ne contient de compilateur, de `node_modules` de développement, de `.env` ni
d'historique Git. Toutes tournent en utilisateur non privilégié (`USER node`) et déclarent
un `HEALTHCHECK`.

### Comment on est passé de 1,46 Go à 471 Mo pour l'API

Point à savoir défendre en soutenance : dans un workspace npm, **réduire l'installation aux
dépendances d'une seule application n'est pas trivial**. Trois approches ont été mesurées.

| Approche | Résultat mesuré |
|---|---|
| `npm ci --omit=dev -w @theetiptop-contest/api --include-workspace-root` | ❌ **936 Mo** de `node_modules`. Le filtre de workspace de npm ne restreint pas `ci` : TypeScript, Next et Playwright sont installés |
| `npm prune --omit=dev --include-workspace-root` | ❌ Même résultat, pour la même raison |
| `nx prune`, qui produit un `package.json` et un `package-lock.json` élagués | ❌ Le lockfile élagué est incohérent avec son propre manifeste : `npm ci` s'arrête sur `Missing: content-type@1.0.5 from lock file`. Express 5 atteint `content-type` par deux chemins, le pruner n'en enregistre qu'un |
| ✅ **`generatePackageJson` + épinglage aux versions exactes** | **471 Mo.** Webpack émet la liste exacte de ses externes, `tools/pin-runtime-deps.mjs` remplace chaque intervalle par la version que l'étage de build a réellement résolue, puis `npm install --no-package-lock` installe exactement celles-là |

La chaîne reste reproductible de bout en bout : lockfile versionné → étage de build →
manifeste épinglé → installation d'exécution.

**Limite assumée** : seules les dépendances directes sont épinglées. Leurs dépendances
transitives se résolvent à la construction de l'image, donc deux builds espacés d'un mois
peuvent différer d'un correctif en profondeur d'arbre. La refermer suppose un lockfile
élagué correct, c'est-à-dire corriger `@nx/js:prune-lockfile` en amont. C'est écrit ici
plutôt que laissé en surprise.

## Déployer un environnement

```bash
cd 05-workflow/docker

cp .env.deploy.example .env.prod   # puis compléter
docker compose -f compose.prod.yml --env-file .env.prod -p theetiptop-prod up -d
```

Les images sont **tirées du registry**, jamais construites sur l'hôte cible : sinon
l'artefact qui tourne n'est pas celui que le pipeline a testé.

### Les migrations

Le service `migrate` est un **travail à usage unique**, pas un service permanent. Il exécute
`prisma migrate deploy` depuis l'image de l'API — le même artefact que celui qui servira le
trafic — puis se termine. Les trois applications attendent sa réussite
(`condition: service_completed_successfully`), ce qui empêche un conteneur de démarrer
contre un schéma qui ne correspond pas au sien.

`migrate deploy` et non `migrate dev` : la première applique les migrations versionnées et
n'en génère jamais, elle ne peut donc pas inventer un changement de schéma sur une base de
production.

### Réseaux

| Réseau | Nature | Qui y est |
|---|---|---|
| `backend` | `internal: true` | api, web, admin, postgres, redis |
| `edge` | externe, partagé | api, web, admin, et le reverse proxy |

PostgreSQL et Redis n'ont **aucun port publié** et aucune route depuis l'hôte : ils ne sont
joignables que depuis le réseau interne. L'API elle-même n'expose pas de port — le reverse
proxy du réseau `edge` est la seule entrée.

## Le partage de session entre les trois sous-domaines

Une fois déployé, l'API, le site et le back-office vivent sur trois sous-domaines. Un cookie
posé par `api.exemple.fr` sans attribut `Domain` est **lié à cet hôte uniquement** :
`exemple.fr` ne le renverrait jamais, et chaque appel authentifié depuis le site
reviendrait en 401.

D'où la variable `COOKIE_DOMAIN`, qui vaut le domaine parent avec un point initial
(`.dsp5-archi-o25a-15m-g1.fr`). Elle est **vide en développement**, et c'est correct : tout
tourne sur `localhost`, et un cookie est lié à l'hôte sans tenir compte du port — les trois
ports se le partagent déjà.

## Ce que `compose.dev.yml` ne fait pas

Il ne contient **pas** les applications. En développement elles tournent via `nx dev`, pour
garder le rechargement à chaud. Les images multi-étages ci-dessus servent aux trois
environnements déployés par Jenkins.

Ports décalés en local — 5434 pour PostgreSQL, 6381 pour Redis — pour ne pas entrer en
conflit avec une autre instance déjà installée sur la machine du développeur.

## Reste à produire dans ce dossier

| Élément | Tâche du backlog |
|---|---|
| `Jenkinsfile` du monorepo | W7, W16 |
| `Jenkinsfile` des deux dépôts de démonstration | W15 |
| Sauvegarde automatisée de PostgreSQL + test de restauration | W12 |
| Prometheus, Grafana, et l'exposition des métriques de l'API | W13 |
| Reverse proxy et certificats TLS du réseau `edge` | W5 |
