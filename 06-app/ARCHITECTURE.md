# Architecture applicative du site jeu-concours Thé Tip Top

> **État : implémenté et vérifié à l'exécution.** Les tâches A1 à A18 du backlog sont
> livrées. Les mesures sont dans `BENCHMARK.md`, les commandes dans
> `theetiptop-contest/README.md`.
>
> Conventions reprises de `deal-israel` (`/Users/daveglad/Documents/work/deal-israel`).
> Les décisions sont consignées dans `01-pilotage/DECISIONS.md` § 3.

## Vue d'ensemble

```
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Caisses magasin │   │ Futur e-commerce │   │  apps/web        │
│  (10 boutiques)  │   │ (autre agence)   │   │  Next.js public  │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │  clé d'API           │  clé d'API           │  session
         └──────────────┬───────┴──────────────────────┘
                        ▼                        ┌──────────────────┐
                 ┌─────────────┐                 │  apps/admin      │
                 │  apps/api   │◄────────────────┤  Next.js         │
                 │  NestJS 11  │   session       │  back-office     │
                 │  REST /v1   │                 └──────────────────┘
                 │  + Swagger  │
                 └──────┬──────┘
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
   ┌────────────┐ ┌──────────┐ ┌─────────────┐
   │ PostgreSQL │ │  Redis   │ │ Better Auth │
   │  Prisma 7  │ │ cache /  │ │ form+Google │
   │ 500k codes │ │ throttle │ │ +Facebook   │
   └────────────┘ └──────────┘ └─────────────┘
```

## Mapping monorepo Nx

| App / package | Rôle | Public | État |
|---|---|---|---|
| `apps/api` | **API REST v1** NestJS 11 documentée Swagger, seule à parler à la base. 25 routes | web, admin, **caisses**, **futur e-commerce** | ✅ |
| `apps/web` | Site public : présentation, lots, règlement, boutiques, inscription, saisie de code, mes gains, droits RGPD. 24 routes | Visiteurs et clients | ✅ |
| `apps/admin` | Back-office : tableau de bord, statistiques, participants, export emailing, paramétrage, tirage, **espace boutique employé**. 12 routes | Admin, employés | ✅ |
| `packages/shared` | Types, contrats et constantes métier. **Aucune dépendance d'exécution**, donc importable par l'API, un composant serveur et un composant client | interne | ✅ |
| `packages/ui` | Design system : tokens, 12 primitives, 5 graphiques, logo et ornements. Partagé web ↔ admin | interne | ✅ |
| `packages/api-client` | Client typé de l'API v1, avec une frontière serveur / navigateur stricte | interne | ✅ |
| `prisma/schema/*.prisma` | Schéma splitté par domaine → base du **MLD** du cahier des charges | interne | ✅ |

> `apps/mobile` (Expo) n'est **pas** un livrable : il sert de **projet de démonstration
> n° 3** du workflow CI/CD (« app mobile hybride » exigée par le sujet), dans un dépôt
> distinct. Voir `DECISIONS.md` § 4 bis.

### Pourquoi `packages/ui` et `packages/api-client` sont apparus

Non prévus initialement. Ils sont la conséquence directe de la séparation
`web` / `admin` tranchée au § 3 des décisions :

- **`packages/ui`** : deux applications distinctes qui doivent ressembler à un seul
  produit. Les tokens, les primitives et les graphiques y vivent une seule fois, donc un
  changement de charte atteint les deux. Les imports se font par **sous-chemin**
  (`@theetiptop-contest/ui/card`) et non par le barrel, pour ne pas tirer `recharts` dans
  le bundle de la moindre page qui affiche un bouton.
- **`packages/api-client`** : deux points d'entrée séparés par une frontière dure.
  `/server` importe `next/headers`, ce qui le rend server-only par construction et garde
  l'adresse interne Docker hors du bundle navigateur ; `/auth` est un module `'use client'`
  qui doit tourner dans le navigateur, parce que les flux OAuth se terminent par une
  redirection pleine page.

## Couches, convention `deal-israel`

```
module → controller (v1/…, Swagger) → service (DomainException) → PrismaService
```

12 modules NestJS : `auth` · `users` · `catalogue` · `participations` · `employee` ·
`stats` · `export` · `draw` · `pos` · `health` · `maintenance` · plus l'infrastructure
(`prisma`, `redis`, `audit`, `config`).

**Écart assumé par rapport à la convention** : pas de couche `repository` distincte. Le
client Prisma **est** la couche d'accès aux données — une classe de plus qui ne ferait que
réexporter ses méthodes n'ajouterait rien. Les services convertissent en revanche
systématiquement les lignes Prisma en DTO du paquet partagé, via un `*.mapper.ts` par
module : une ligne Prisma porte des colonnes qu'aucun client ne doit voir (`password`,
`ipHash`, `anonymizedAt`).

## Modèle de données

Schémas dans `theetiptop-contest/prisma/schema/`, un fichier par domaine. Identifiants en
anglais, correspondance avec le MCD français dans
`02-cahier-des-charges/sections/E5-mcd-mld.md`.

| Fichier | Modèles | Points clés |
|---|---|---|
| `base.prisma` | énumérations | `Role`, `Gender`, `CodeStatus`, `PrizeStatus`, `RedemptionChannel`, `PrizeType` |
| `user.prisma` | `User`, `AuditLog` | rôle, genre et date de naissance (**exigés pour les stats**), consentements horodatés, `name` et `image` pour Better Auth |
| `auth.prisma` | `Session`, `Account`, `Verification` | Better Auth, `providerId` couvrant formulaire, Google et Facebook |
| `contest.prisma` | `Contest` | dates, seuil de 4900 centimes, volume de codes, huissier, **auditabilité de la génération** |
| `prize.prisma` | `Prize` | libellé, valeur en centimes, **pourcentage cible** (60/20/10/6/4) |
| `ticket-code.prisma` | `TicketCode` | `code CHAR(10) @unique`, `prizeId`, `status`, **distribution en caisse**, soit **500 000 lignes** |
| `participation.prisma` | `Participation` | `userId`, `ticketCodeId @unique`, `claimDeadline`, `ipHash` |
| `store.prisma` | `Store`, `PrizeRedemption` | les 10 points de vente dont **Nice**, et la remise des lots |
| `draw.prisma` | `Draw` | tirage du gros lot, `seed` et empreinte des participants |

### ⚠️ Deux corrections de schéma apportées en cours de développement

Le schéma initial ne permettait pas de tenir deux exigences du sujet. Les deux corrections
sont à connaître, parce qu'elles sont visibles dans le MLD du cahier des charges.

**1. Suivi de la distribution des codes.** `CodeStatus` ne connaissait que
`AVAILABLE | USED | VOIDED`, et `TicketCode` n'avait aucun lien vers une boutique. Il était
donc impossible de savoir qu'un code avait été imprimé sur un ticket, ni par quelle
boutique — ce qui rendait l'exigence n° 8 (API pour les caisses) incomplète et la
statistique « codes joués par boutique » **non calculable**. Ajoutés :

- `CodeStatus.DISPENSED`, entre `AVAILABLE` et `USED` ;
- `dispensedAt`, `storeId`, `purchaseAmountCents`, `dispenseReference`, `voidedReason`.

Règle métier qui en découle : un code est jouable s'il est `AVAILABLE` **ou** `DISPENSED`.
Refuser un code `AVAILABLE` serait refuser un client dont la caisse est tombée en panne
sans appeler l'API.

**2. Auditabilité de la génération.** Ajoutés sur `Contest` : `codesGeneratedAt`,
`codeGenerationSeedHash`, `codePoolFingerprint`. La graine elle-même n'est
**volontairement pas stockée** — voir ci-dessous.

## Les deux algorithmes critiques

### 1. Génération des 500 000 codes — `prisma/generate-codes.ts`

```
1. Vérifier que la répartition totalise exactement 500 000 (échec avant toute écriture)
2. Construire le vecteur de lots EXACT : [infuseur ×300000, détox ×100000,
   signature ×50000, coffret39 ×30000, coffret69 ×20000]
3. Mélanger (Fisher-Yates descendant, xoshiro128** seedé)
4. Tirer 500 000 codes distincts de 10 caractères (Set en mémoire + index unique en base)
5. Insérer par lots de 5 000 (createMany)
6. Enregistrer l'empreinte, puis recompter la répartition en base
```

**Mesuré** : 51,6 s au total, 9 908 lignes/s à l'insertion, 0 collision. Table de 129 Mo
dont 62 Mo d'index. Recherche par code : **540 µs**. Détail dans `BENCHMARK.md`.

**Ce qu'il faut savoir défendre** : la répartition est exacte parce que le **vecteur est
construit puis mélangé**, et non tiré lot par lot contre une probabilité. Un tirage par
code tomberait près de 60 % mais pratiquement jamais sur exactement 60 %, alors que le
règlement déposé dit 60 %.

**La graine n'est pas stockée en base.** Quiconque la détient peut rejouer la génération et
dériver les 500 000 codes avec le lot de chacun. À la place : la graine est affichée une
fois et remise à l'huissier, la base conserve son SHA-256 (pour prouver qu'une graine
présentée est *la* graine) et l'empreinte du pool (pour prouver qu'aucun code n'a bougé).

### 2. Tirage du gros lot — `modules/draw/draw.service.ts`

```sql
SELECT DISTINCT p."userId" FROM "Participation" p ... ORDER BY p."userId" ASC
```

L'assiette est l'ensemble des **participants**, pas des participations : un client ayant
joué quarante codes a une chance, exactement comme celui qui en a joué un. La différence
tient à un `DISTINCT`, et c'est l'exigence la plus facile à manquer du sujet —
`tests/draw-fairness.integration.spec.ts` ne teste rien d'autre.

Contrairement à la graine de génération, **celle du tirage est conservée en clair** : elle
décrit une opération terminée, et la connaître ne permet que de recalculer un résultat déjà
public. `GET /v1/admin/draw/:id/verify` rejoue le tirage et compare — c'est le bouton que
presse l'huissier.

## Exigences transverses

| Exigence | Comment elle est tenue | Vérifiée par |
|---|---|---|
| **SEO** | SSR Next.js, métadonnées par page, `sitemap.xml` généré depuis le code, `robots.txt`, données structurées Schema.org | `e2e/public/catalogue.spec.ts` |
| **Accessibilité** | Lien d'évitement, un seul `h1` par page, libellés liés par `id`, régions `aria-live`, focus visible, `prefers-reduced-motion`, contrastes validés, `jsx-a11y` au lint | `e2e/public/catalogue.spec.ts`, lint |
| **RGPD** | Consentements horodatés **côté serveur**, retrait aussi simple que l'octroi, export article 20, effacement article 17 par anonymisation, IP hachée salée, export emailing minimisé | `e2e/public/participation.spec.ts` |
| **Éco-conception** | `nx affected`, cache Redis sur le catalogue et les agrégats, images Next optimisées, dépendances inutiles retirées (`@nestjs/config`, `@nestjs/throttler`, Elasticsearch, Stripe) | — |
| **Sécurité** | Limitation de débit Redis sur la saisie, clés d'API distinctes comparées en temps constant, `role` non modifiable par le client, Helmet, CORS explicite, pas de fuite de pile | `smoke` + `e2e/back-office/roles.spec.ts` |
| **Responsive** | Parcours client rejoué sur viewport mobile | projet Playwright `public-site-mobile` |

## Conteneurisation

`05-workflow/docker/` : trois Dockerfile multi-étages, un compose de développement, un
compose de déploiement couvrant les trois environnements. Images mesurées : **api 471 Mo**,
**web 322 Mo**, **admin 319 Mo**, toutes vérifiées à l'exécution.

Le `.dockerignore` racine — correctif n° 2 des décisions § 4 bis — est en place.

## Design

Le design system part des patterns `liquid glass` de `deal-israel`, mais la charte vient de
l'identité visuelle de Thé Tip Top (CDC partie G). Tokens en `oklch`, thème clair et sombre,
palette de data-viz à ordre fixe, feuille d'impression — un client imprime sa page de gain
pour la présenter en boutique, un administrateur imprime ses statistiques.

## Ce qui reste à faire, et qui n'est pas applicatif

| Élément | Tâche |
|---|---|
| `Jenkinsfile` du monorepo et des 2 dépôts de démonstration | W7, W15, W16 |
| Registry d'images, reverse proxy, TLS | W5, W9 |
| Prometheus + Grafana, exposition des métriques de l'API | W13 |
| Sauvegardes automatisées et test de restauration | W12 |
| Identifiants OAuth Google et Facebook réels | — |
