# Architecture applicative du site jeu-concours Thé Tip Top

> Stack retenue : **conventions `deal-israel`** (`/Users/daveglad/Documents/work/deal-israel`, + `.agent/conventions/`).
> Toutes les décisions sont consignées dans `01-pilotage/DECISIONS.md` § 3.

## Vue d'ensemble

```
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Caisses magasin │   │ Futur e-commerce │   │  apps/web        │
│  (10 boutiques)  │   │ (autre agence)   │   │  Next.js public  │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │  API key             │  API key             │  session
         └──────────────┬───────┴──────────────────────┘
                        ▼                        ┌──────────────────┐
                 ┌─────────────┐                 │  apps/admin      │
                 │  apps/api   │◄────────────────┤  Next.js         │
                 │  NestJS 11  │   session admin │  back-office     │
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

| App / package | Rôle dans le projet | Public |
|---|---|---|
| `apps/api` | **API REST v1** NestJS documentée avec Swagger, seule à parler à la base | webApp, admin, **caisses**, **futur e-commerce** |
| `apps/web` | Site public du jeu-concours : présentation, lots, inscription, saisie de code, historique des gains | Visiteurs et clients |
| `apps/admin` | Back-office : statistiques, export emailing, **vue employé boutique** (remise des lots) | Admin, employés |
| `packages/shared` | Types, DTO, constantes (répartition des lots, regex du code) partagés API ↔ front | interne |
| `prisma/schema/*.prisma` | Schéma splitté par domaine → sert de base au **MLD** du cahier des charges | interne |

> `apps/mobile` (Expo) n'est **pas** un livrable, mais sert de **projet de démonstration n°3** du workflow CI/CD (« app mobile hybride » exigée par le sujet).

## Couches (convention `deal-israel`)

```
module → controller (v1/…, Swagger) → service (DomainException + events) → repository (Prisma)
```

Modules NestJS prévus : `auth` · `user` · `contest` · `prize` · `ticket-code` · `participation` · `store` · `redemption` · `draw` · `stats` · `export` · `pos` (caisses).

## Modèle de données, base du MLD du cahier des charges

Schémas écrits et validés dans `06-app/db/schema/`, un fichier par domaine. Les identifiants sont en anglais, le tableau de correspondance avec le MCD français figure dans `02-cahier-des-charges/sections/E5-mcd-mld.md`.

| Fichier | Modèles | Points clés |
|---|---|---|
| `base.prisma` | énumérations | `Role`, `Gender`, `CodeStatus`, `PrizeStatus`, `RedemptionChannel`, `PrizeType` |
| `user.prisma` | `User`, `AuditLog` | rôle `CUSTOMER \| EMPLOYEE \| ADMIN`, genre et date de naissance (**exigés pour les stats admin**), consentements RGPD horodatés |
| `auth.prisma` | `Session`, `Account`, `Verification` | Better Auth, `providerId` couvrant formulaire, Google et Facebook |
| `contest.prisma` | `Contest` | dates du jeu, seuil de 4900 centimes, volume de codes, huissier |
| `prize.prisma` | `Prize` | libellé, valeur en centimes, **pourcentage cible** (60/20/10/6/4) |
| `ticket-code.prisma` | `TicketCode` | `code CHAR(10) @unique`, `prizeId`, `status`, `usedAt`, soit **500 000 lignes** |
| `participation.prisma` | `Participation` | `userId`, `ticketCodeId @unique`, `claimDeadline`, `ipHash` |
| `store.prisma` | `Store`, `PrizeRedemption` | les 10 points de vente dont **Nice**, et la remise des lots |
| `draw.prisma` | `Draw` | tirage du gros lot, `seed` et empreinte des participants pour l'huissier |

## Les deux algorithmes critiques

### 1. Génération des 500 000 codes, dans `06-app/scripts/`

Contrainte du sujet : les codes existent **en base dès l'ouverture du jeu, gain déjà associé**, pour que les pourcentages soient garantis.

```
1. Construire le vecteur de lots exact : [infuseur ×300000, détox ×100000,
   signature ×50000, coffret39 ×30000, coffret69 ×20000]   → 500 000
2. Mélanger (Fisher-Yates, PRNG seedé et tracé pour l'huissier)
3. Générer 500 000 codes uniques de 10 caractères alphanumériques
4. Insérer par batch (COPY ou createMany), surtout pas 500 000 INSERT unitaires
5. Test automatisé : recompter la répartition en base == 60/20/10/6/4 %
```

Points à justifier en soutenance : taille de l'espace de codes vs 500 000 tirages (probabilité de collision), pourquoi l'unicité est garantie en base et pas seulement en mémoire, temps d'insertion mesuré.

### 2. Tirage au sort du gros lot (1 an de thé, 360 €)

Règle du sujet : **le nombre de participations n'augmente pas les chances**.

```
SELECT DISTINCT "userId" FROM "Participation"   ->  tirage sur les PARTICIPANTS, pas les participations
```

Exécuté **côté serveur**, à la clôture, journalisé et reproductible (seed conservée) pour le contrôle de Maître Arnaud Rick.

## Exigences transverses

| Exigence | Comment on la tient |
|---|---|
| **SEO** | Next.js SSR/SSG, métadonnées, `sitemap.xml`, `robots.txt`, HTTPS. Page d'accueil et page « concept » rédigées dans le CDC |
| **Accessibilité** | shadcn/ui (Radix) + `.agent/conventions/accessibility.md`, contrastes validés dans la charte graphique |
| **RGPD** | Consentement, bandeau cookies, export et suppression des données, base emailing opt-in |
| **Éco-conception (RSE)** | `nx affected` (builds courts), images optimisées Next, pas de dépendance inutile (Elasticsearch et Stripe retirés) |
| **Sécurité** | Rate-limiting Redis sur la saisie de code (anti-brute-force sur 10 caractères), clés d'API distinctes pour les caisses |

## Design

Le design system « liquid glass » de `deal-israel` (`apps/web/DESIGN.md`) est le point de départ, **mais la charte est imposée par l'identité visuelle de Thé Tip Top** que nous devons créer (partie G du CDC) : thé bio, haut de gamme, handmade. Les patterns et le niveau de finition sont repris ; les couleurs et typographies viennent de la nouvelle charte.

## Conteneurisation (lien avec le workflow)

Le sujet impose du **100 % Docker**. À produire dans `05-workflow/docker/` :

- `Dockerfile` multi-stage pour `apps/api`, `apps/web`, `apps/admin`
- `docker-compose` par environnement (dev, preprod-QA, prod), en s'inspirant de `docker-compose.staging.yml` et `docker-compose.prod.yml` de `deal-israel`
- Migrations Prisma jouées par le pipeline avant le déploiement
- ⚠️ `.dockerignore` racine **obligatoire**. Il est absent de `deal-israel`, or sans lui `COPY . .` embarque `node_modules` dans le contexte de build

### Organisation des dépôts

Le monorepo n'est **pas** le seul dépôt du SCM. Le sujet exige que le workflow sache déployer 3 types de projets : deux dépôts de démonstration l'accompagnent (`demo-static-site`, `demo-mobile-app`). Détail et justification dans `01-pilotage/DECISIONS.md` § 4 bis.
