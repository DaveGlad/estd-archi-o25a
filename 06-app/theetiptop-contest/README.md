# Site jeu-concours Thé Tip Top

Monorepo Nx du livrable applicatif : **API REST versionnée**, **site public**,
**back-office**. Développé pour l'ouverture de la dixième boutique Thé Tip Top, à Nice.

> Le contexte, les exigences et les décisions sont dans `01-pilotage/DECISIONS.md` et
> `06-app/ARCHITECTURE.md`. Les mesures de performance sont dans `06-app/BENCHMARK.md`.

## Démarrage

```bash
# 1. Secrets et configuration
cp .env.example .env
# puis renseigner BETTER_AUTH_SECRET et IP_HASH_SALT :
#   openssl rand -base64 32   → BETTER_AUTH_SECRET
#   openssl rand -hex 32      → IP_HASH_SALT

# 2. PostgreSQL 17 + Redis 8
npm run dev:infra

# 3. Schéma, données de référence, puis les 500 000 codes
npm run db:migrate
npm run db:seed
npm run codes:generate     # ~45 s
npm run codes:verify       # contrôle de la répartition 60/20/10/6/4 %

# 4. Jeu de données de démonstration, pour que les écrans aient quelque chose à montrer
npm run db:seed:demo       # ~3 s : 1 200 clients, 2 000 participations

# 5. Les trois applications, dans trois terminaux
npm run dev:api            # http://localhost:3333  — Swagger sur /docs
npm run dev:web            # http://localhost:3000
npm run dev:admin          # http://localhost:3001
```

Comptes de démonstration, insérés par `db:seed` et **uniquement hors production**. Mot de
passe commun : `MotDePasse2026!`

| Compte | Rôle | Ce qu'il permet de voir |
|---|---|---|
| `camille.rousseau@example.fr` | client | Saisie de code, historique des gains, droits RGPD |
| `theo.marchand@example.fr` | client | Second client, pour les tests de cloisonnement |
| `sofia.legrand@theetiptop.fr` | employé, boutique de Nice | Recherche client, remise des lots |
| `admin@theetiptop.fr` | administrateur | Statistiques, export emailing, tirage au sort |

## Structure

```
apps/
  api/        API REST v1, NestJS 11 + Swagger. Seule à parler à la base
  web/        Site public : présentation, lots, inscription, saisie de code, mes gains
  admin/      Back-office : statistiques, export, tirage, et l'espace boutique employé
packages/
  shared/     Types, contrats et constantes métier. Aucune dépendance d'exécution
  ui/         Design system : tokens, primitives, graphiques. Partagé web ↔ admin
  api-client/ Client typé de l'API v1, avec une frontière serveur / navigateur stricte
prisma/
  schema/     Schéma splitté par domaine, base du MLD du cahier des charges
  migrations/ Migrations versionnées, jouées par le pipeline
  seed.ts generate-codes.ts verify-codes.ts reset-codes.ts
tests/        Tests d'intégration et de performance
e2e/          Tests fonctionnels Playwright
tools/        Outillage de build
```

### Pourquoi trois applications et non une

| | Raison |
|---|---|
| `api` séparée des fronts | Elle sert **trois consommateurs**, dont deux que nous n'écrivons pas : les caisses des 10 boutiques et le futur site e-commerce. D'où une API REST versionnée et documentée, et non un back-end privé |
| `admin` séparée de `web` | Le site public est la surface exposée — indexée, ouverte aux anonymes ; le back-office ne l'est pas. Séparées, les écrans d'administration ne sont même pas joignables sur l'hôte public, et les deux se déploient avec des règles d'entrée distinctes |

## Les commandes

| Commande | Ce qu'elle fait |
|---|---|
| `npm run dev:infra` / `dev:infra:down` | PostgreSQL + Redis en Docker |
| `npm run db:migrate` | Crée et applique une migration (développement) |
| `npm run db:deploy` | Applique les migrations existantes (déploiement) |
| `npm run db:seed` | Jeu, lots, 10 boutiques, comptes de démonstration. Idempotent |
| `npm run db:seed:demo` | Jeu de données réaliste : 1 200 clients, 2 000 participations réparties sur les jours du jeu et les 10 boutiques. Rejouable, remet ses codes dans le pool |
| `npm run codes:generate` | Les 500 000 codes. **Opération unique**, refusée si le pool existe |
| `npm run codes:verify` | Recompte la répartition en base. Sort en erreur à la moindre divergence |
| `npm run codes:reset` | Vide le pool. Développement uniquement |
| `npm run test` | Tests unitaires |
| `npm run test:integration` | Tests d'intégration, contre la vraie base |
| `npm run test:e2e` | Tests fonctionnels Playwright, sur les trois applications |
| `npm run test:perf` | Tests de performance k6 |
| `npm run typecheck` / `lint` / `build` | Sur l'ensemble du monorepo |

## Les tests

Les quatre familles exigées par le sujet, avec export des rapports vers Jenkins.

| Famille | Outil | Volume | Rapport |
|---|---|---|---|
| Unitaires | Vitest | 54 tests | `reports/junit/vitest.xml` |
| Intégration | Vitest + PostgreSQL | 32 tests | `reports/junit/vitest.xml` |
| Fonctionnels | Playwright, 3 projets | 46 tests | `reports/junit/playwright.xml` |
| Performance | k6 | 3 scénarios | `reports/junit/k6.xml` |

Les trois tests qui portent réellement les exigences du sujet :

- **`tests/code-distribution.integration.spec.ts`** recompte la répartition 60/20/10/6/4 %
  **en base**, pas dans un mock. C'est la seule preuve que le pool contient ce que le
  règlement déposé chez l'huissier promet.
- **`tests/draw-fairness.integration.spec.ts`** vérifie qu'un client ayant joué quarante
  codes a exactement la même chance qu'un client en ayant joué un. Un tirage sur les
  participations passerait tous les autres tests et échouerait sur celui-là.
- **`tests/participation-concurrency.integration.spec.ts`** fait courir dix transactions
  sur un même code et exige qu'une seule gagne.

## Points techniques à savoir défendre

| Sujet | Où c'est documenté |
|---|---|
| Pourquoi la répartition est **exacte** et non statistique | `prisma/generate-codes.ts`, en-tête |
| Pourquoi la graine de génération n'est **pas** stockée, alors que celle du tirage l'est | `prisma/schema/contest.prisma` et `apps/api/src/modules/draw/draw.service.ts` |
| Pourquoi le lot est **lu** et jamais tiré à la saisie | `apps/api/src/modules/participations/participations.service.ts` |
| Comment un code ne peut être joué qu'une fois sous concurrence | la même, méthode `claimCode` |
| Pourquoi `pg_trgm` et non Elasticsearch | migration `20261111070019_add_trgm_customer_search_indexes` |
| Pourquoi la caisse n'apprend jamais le lot qu'elle imprime | `apps/api/src/modules/pos/pos.service.ts` |
| Pourquoi l'effacement RGPD est une **anonymisation** | `apps/api/src/modules/users/users.service.ts`, méthode `anonymize` |
| Pourquoi l'export CSV neutralise les champs commençant par `=` | `apps/api/src/modules/export/export.service.ts` |
| Comment l'image de l'API est passée de 1,46 Go à 471 Mo | `05-workflow/docker/README.md` et `tools/pin-runtime-deps.mjs` |
| Pourquoi `COOKIE_DOMAIN` est vide en local et obligatoire en production | `apps/api/src/config/env.ts` |

## Conventions

- **Commentaires de code en anglais.** La prose du projet — dossiers, README, textes
  affichés à l'utilisateur — reste en français.
- **TypeScript partout**, y compris les fichiers de configuration : `prisma.config.ts`,
  `next.config.ts`, `playwright.config.ts`, `vitest.config.mts`.
- **`.env` jamais versionné**, jamais embarqué dans une image Docker. Les secrets sont
  injectés à l'exécution par Jenkins.

## Conteneurisation

Trois images multi-étages dans `05-workflow/docker/`, construites depuis **la racine de ce
monorepo** comme contexte. Voir le README de ce dossier pour les commandes, les tailles
mesurées et le déploiement par environnement.
