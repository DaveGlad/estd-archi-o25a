# Décisions structurantes (ADR light)

> À trancher **le 16 août au plus tard**. Tant qu'une ligne est vide, le travail qui en dépend est bloqué.
> Chaque décision devra être **défendue individuellement** en soutenance : la colonne « Pourquoi » n'est pas décorative.

## 1. Identité du groupe

| Élément | Valeur | Statut |
|---|---|---|
| Numéro de classe | `à remplir` | ⬜ |
| Numéro de groupe (Teams) | `à remplir` | ⬜ |
| Effectif | **4 personnes** | ✅ |
| Domaine workflow | `wk-archi-o25a-15M-G{n}.fr` | ⬜ |
| Domaine site | `dsp5-archi-o25a-15M-G{n}.fr` | ⬜ |

### Répartition des rôles

Les 4 membres du groupe constituent la maîtrise d'œuvre du comité de pilotage exigé par le cahier des charges (partie A.4). Les postes ci-dessous sont donc à la fois la répartition réelle du travail et les rôles à présenter au client.

| Rôle | Poste au comité de pilotage | Dossiers | Périmètre technique (phase 2) |
|---|---|---|---|
| R1 | Chef de projet | CDC parties A, I, J. Pilotage Trello, comptes rendus | Coordination, recette |
| R2 | Chargé de communication digitale | CDC parties B, C, D | Google Analytics, réseaux sociaux, emailing |
| R3 | Développeur / DevOps | CDC parties E, F. **Tout le CST** | Workflow CI/CD, API, base de données |
| R4 | Graphiste / UX | CDC parties G, H | Identité visuelle, front, accessibilité |

| Nom | Prénom | Rôle | Poste, mail, téléphone | Statut |
|---|---|---|---|---|
| | | R1 | | ⬜ |
| | | R2 | | ⬜ |
| | | R3 | | ⬜ |
| | | R4 | | ⬜ |

> Ces informations sont obligatoires dans le comité de pilotage du CDC : nom, prénom, poste occupé, adresse postale, mail, téléphone, plus les jours et horaires de travail, les congés éventuels et la personne à contacter en cas d'absence.

**Charge de travail jusqu'au 31 août** : environ 380 heures-personne estimées pour les deux dossiers, soit à peu près 6 heures par jour et par personne sur les 16 jours restants. C'est tenable mais sans marge, d'où le découpage jour par jour de `SPRINT-01-DOSSIERS.md`.

**Règle de fonctionnement** : R3 est le seul à porter deux dossiers, le CST étant entièrement technique. Les autres compensent en reprenant à leur compte la relecture croisée du 29 août.

## 2. L'agence : **Furious Ducks**, imposée par le sujet

⚠️ Le nom n'est **pas** au choix. Le sujet nous place « en tant que nouveaux employés au sein de la société Furious Ducks », dirigée par Mr Guido Brasletti. C'est ce nom qui figure sur la couverture du CST et dans la partie « présentation de votre agence » du CDC.

Données **fournies** par le sujet : webagency spécialisée dans les technologies open source · créée en **2007** · **45 employés** · directeur **Guido Brasletti** · travaille actuellement en cycle en V · désorganisation progressive constatée.

Données **à construire**, que le sujet ne donne pas. Toutes fictives, à garder cohérentes entre elles :

| Élément | Valeur | Statut |
|---|---|---|
| Forme juridique / capital | *(SAS ? cohérent avec 45 salariés)* | ⬜ |
| Siège social | | ⬜ |
| SIREN / SIRET / RCS / APE-NAF / TVA intracom | *(APE 6201Z « programmation informatique » ; RCS cohérent avec le siège)* | ⬜ |
| Storytelling + valeurs | *(matière première possible : le positionnement de Nextilabs)* | ⬜ |
| Organigramme / pôles | *(comment 45 personnes se répartissent)* | ⬜ |

## 3. Stack du site jeu-concours : ✅ **décidé, conventions `deal-israel`**

Référence : `/Users/daveglad/Documents/work/deal-israel` (+ `.agent/conventions/`). Voir `06-app/ARCHITECTURE.md`.

| Poste | Choix | Pourquoi (à écrire dans le CDC) | Statut |
|---|---|---|---|
| Monorepo | **Nx 23.1** (npm workspaces) | Un seul dépôt pour API + webApp + admin ⇒ un seul pipeline Jenkins, cache de build Nx, `nx affected` = builds courts (argument **RSE / éco-conception**) | ✅ |
| Front webApp | **Next.js 16** + React 19 + **Tailwind v4** + shadcn/ui | SSR/SSG ⇒ **SEO** (exigence du sujet), accessibilité native de Radix (shadcn), images optimisées ⇒ Green IT | ✅ |
| Back-office admin | **Next.js** (`apps/admin`) | Sépare le back-office admin/employé du front public : surface d'attaque réduite, droits distincts | ✅ |
| API | **NestJS 11.2.9** + Swagger, routes `v1/…` | REST versionnée et documentée, indispensable puisque l'API sert **3 consommateurs** : webApp, **caisses magasin**, **futur e-commerce**. 25 routes livrées | ✅ |
| ORM | **Prisma 7.10** (schémas splittés par domaine) | Migrations versionnées ⇒ rejouables par la CI sur dev/preprod/prod. Le schéma Prisma sert de base au **MLD** du CDC. ⚠️ Prisma 7 **impose un driver adapter** : `@prisma/adapter-pg`, le moteur Rust a disparu | ✅ |
| BDD | **PostgreSQL 17** | **Open source** (licence PostgreSQL, OSI) ⇒ conforme à l'exigence du sujet, plus permissive que la GPL de MariaDB. Requis pour insérer et indexer **500 000 codes** (`COPY`, index B-tree unique) | ✅ |
| Cache / file | **Redis** | Rate-limiting de la saisie de codes (anti-brute-force), sessions, file du batch de génération | ✅ |
| Auth | **Better Auth** | Couvre en une brique les 3 modes exigés : **formulaire classique + OAuth Google + OAuth Facebook**, avec rôles `client / employé / admin` | ✅ |
| Tests | **Vitest 5** (unitaires + intégration) · **Playwright 1.65** (fonctionnels/E2E) · **k6** (performance) | Le sujet exige les 4 familles + l'**export des rapports** vers Jenkins (JUnit XML). 132 tests livrés et verts ; k6 écrit mais non exécuté, le binaire reste à installer | ✅ |
| Mobile *(hors périmètre livrable)* | Expo / React Native | Sert de **projet de démonstration n°3** du workflow (« app mobile hybride ») | ⬜ |

### Décisions prises pendant l'implémentation

Six choix n'apparaissaient pas dans le tableau ci-dessus parce qu'ils ne se posent qu'une
fois le code écrit. Tous sont documentés à l'endroit où ils s'appliquent ; ils sont listés
ici parce qu'ils sont **défendables individuellement en soutenance**.

| Décision | Pourquoi | Où c'est argumenté |
|---|---|---|
| **`pg_trgm` à la place d'Elasticsearch** | La recherche client de l'employé est une sous-chaîne non ancrée, qu'un index B-tree ne peut pas servir. `pg_trgm` est un module contrib de PostgreSQL, sous la même licence OSI, et suffit sur une table de quelques dizaines de milliers de lignes. Elasticsearch était de toute façon écarté (licence SSPL depuis 7.11) | migration `20261111070019` |
| **`@nestjs/config` et `@nestjs/throttler` retirés** | Le premier doublonnait la validation `zod` du fichier `env.ts` pour le seul bénéfice de lire un `.env`. Le second ne stocke ses compteurs qu'en mémoire : avec trois conteneurs, trois compteurs indépendants, donc une limite qui ne limite rien. La limitation réelle passe par Redis. Argument RSE : aucune dépendance qui n'apporte rien | `apps/api/src/config/load-env.ts` |
| **Pas de couche `repository` distincte** | Écart assumé par rapport à la convention `deal-israel`. Le client Prisma **est** la couche d'accès. Une classe de plus qui réexporterait ses méthodes n'ajouterait rien ; en revanche chaque module convertit systématiquement les lignes en DTO via un `*.mapper.ts`, parce qu'une ligne Prisma porte des colonnes qu'aucun client ne doit voir | `06-app/ARCHITECTURE.md` |
| **Les 6 issues de la saisie de code répondent 200** | « Dis-moi ce que vaut mon code » a six réponses normales, toutes affichées par un écran. Les mapper sur 400/404/409/429 obligerait le front à brancher sur le statut, à reparser des corps d'erreur, et à maintenir cette correspondance à la main. Le front avait été maquetté contre cette union discriminée avant que l'API existe | `participations.controller.ts` |
| **Graine de génération non stockée, graine de tirage stockée** | Asymétrie volontaire. La première permet de dériver 500 000 codes non joués et leurs lots : la base n'en garde que le SHA-256. La seconde décrit une opération terminée : la connaître ne permet que de recalculer un résultat déjà public, et c'est ce qui rend le tirage vérifiable | `contest.prisma`, `draw.service.ts` |
| **Image API : manifeste épinglé plutôt que lockfile élagué** | Dans un workspace npm, ni `npm ci -w <app>` ni `npm prune --omit=dev` ne restreignent l'installation à une application : les deux installent l'arbre entier, 936 Mo mesurés. Et le lockfile élagué par `nx prune` est incohérent avec son propre manifeste sous Express 5. Le manifeste généré par webpack est donc épinglé aux versions exactes résolues par l'étage de build : **1,46 Go → 471 Mo** | `05-workflow/docker/README.md` |

### Deux corrections de schéma, à répercuter dans le MLD du CDC

Le schéma initial ne permettait pas de tenir deux exigences du sujet.

1. **Distribution des codes.** `CodeStatus` ignorait l'état « imprimé sur un ticket », et
   `TicketCode` n'avait aucun lien vers une boutique. L'exigence n° 8 (API pour les caisses)
   était donc incomplète, et la statistique « codes joués par boutique » **non calculable**.
   Ajoutés : `CodeStatus.DISPENSED`, `dispensedAt`, `storeId`, `purchaseAmountCents`,
   `dispenseReference`, `voidedReason`.
2. **Auditabilité de la génération.** Ajoutés sur `Contest` : `codesGeneratedAt`,
   `codeGenerationSeedHash`, `codePoolFingerprint`.

⚠️ `02-cahier-des-charges/sections/E5-mcd-mld.md` doit être mis à jour en conséquence.

### ⚠️ Écarts à traiter par rapport à `deal-israel`

| Point | Décision |
|---|---|
| **Elasticsearch** | ❌ **À retirer.** Sous licence Elastic v2 / SSPL depuis 7.11 = **non open source** ⇒ viole la contrainte du sujet. Et inutile ici. Si un besoin de recherche apparaît (recherche client par l'employé boutique), utiliser l'index `pg_trgm` de Postgres. |
| **Stripe** | ❌ Retirer, aucun paiement dans un jeu-concours. |
| **MinIO** | 🟡 Optionnel (assets, visuels du jeu). AGPL = open source, donc conforme si conservé. |
| **Better Auth** | ✅ Les trois modes sont câblés. Les deux fournisseurs ne sont enregistrés que si leur paire d'identifiants est complète, donc l'API démarre sans eux avec le seul formulaire. **Identifiants Google et Facebook à créer.** |
| **Notifications push / chat / Expo** | ❌ Hors périmètre du site jeu-concours. |

## 4. Briques du workflow CI/CD

| Poste | Choix | Contrainte du sujet | Statut |
|---|---|---|---|
| Hébergeur / offre | | Serveur dédié ou cloud, **au choix mais justifié** | ⬜ |
| Distribution | | **Linux** obligatoire | ⬜ |
| Conteneurisation | **Docker** | **100 % Docker**, imposé | ⬜ |
| Reverse proxy | | Sous-domaine par outil + TLS | ⬜ |
| SCM | **Gitea** *(recommandé)* | **Git imposé** + standard **GitFlow**. Gitea plutôt que GitLab CE : quelques centaines de Mo de RAM contre environ 4 Go. Voir § 4 bis, risque n° 5 | ⬜ |
| CI | **Jenkins** | **Imposé**. Configuration par **Jenkinsfile**, les devs n'ont pas accès au CI | ⬜ |
| Registry d'images | | « Stocker les images Docker construites par la CI » | ⬜ |
| Tests / QA | | « Une ou plusieurs solutions de tests applicatifs » | ⬜ |
| Métriques | Prometheus + Grafana (+ Loki/Kibana) | « Une ou plusieurs solutions de métriques » | ⬜ |
| Backups | | **Automatisés**, workflow **et** projets, restauration testée | ⬜ |
| Environnements | dev / preprod-QA / prod | Dev + preprod **auto**, prod : niveau d'automatisation à justifier | ⬜ |

⚠️ Toutes les applis doivent être **open source**, ou au pire **libres**. Justifier chaque exception.

---

## 4 bis. Points de friction monorepo Nx ↔ workflow

> Analyse menée le 15/08/2026 sur le précédent `deal-israel` (Dockerfile multi-stage par app,
> images taguées poussées vers un registry, compose par environnement, soit la forme attendue par le sujet).
> **Verdict : aucun blocage.** 5 frictions identifiées, 4 correctifs triviaux, 1 décision d'organisation.

### 🔴 1. Le monorepo ne démontre pas la généricité du workflow

Le sujet exige que le workflow sache déployer **3 types de projets** (vitrine HTML/CSS, site administrable, app mobile hybride). Le monorepo est **un seul projet** : un correcteur qui ne voit qu'un dépôt Nx conclura que le workflow n'est pas générique.

**Décision : 3 dépôts dans le SCM, 3 Jenkinsfile, un seul workflow.**

| Dépôt | Type couvert | Pipeline |
|---|---|---|
| `theetiptop-contest` (Nx) | Site administrable Node/Next | Le livrable client |
| `demo-static-site` | Vitrine HTML/CSS | Minification + compression → Nginx |
| `demo-mobile-app` | App mobile hybride (Expo) | Build hybride → artefact stocké |

→ Répercuté sur la tâche **W15** du backlog.

### 🟠 2. `.dockerignore` absent

Vérifié : aucun `.dockerignore` dans `deal-israel`, ni à la racine ni dans les apps. Avec `COPY . .`, **`node_modules` part dans le contexte de build**, soit plusieurs centaines de Mo envoyés au démon Docker, pour 3 apps et 3 environnements.

**Correctif dès le scaffolding** : `.dockerignore` racine avec `node_modules`, `.nx`, `dist`, `.git`, `.env*`.

### 🟠 3. Le cache Nx s'évapore en CI

Le Dockerfile de référence utilise `--skip-nx-cache`, et les agents Jenkins conteneurisés sont éphémères : chaque build recompile tout.

**Correctif** : volume persistant monté sur `.nx/cache` chez l'agent Jenkins. Option avancée : cache distant auto-hébergé vers **MinIO** (S3-compatible, déjà dans la stack).

⚠️ **Ne pas utiliser Nx Cloud** : SaaS propriétaire, contraire à l'exigence « applications open source » du sujet. Point piège probable en soutenance.

### 🟠 4. `nx affected` casse avec un clone superficiel

`nx affected` compare deux refs Git. Si Jenkins fait un *shallow clone* (défaut fréquent), la comparaison échoue ou rebuild tout, et on perd l'argument d'éco-conception.

**Correctif** : désactiver le shallow clone dans le job, fixer explicitement `--base=origin/develop --head=HEAD`.

### 🟠 5. Le vrai risque est la RAM, pas Nx

À faire tourner simultanément : SCM + Jenkins + agents + registry + Prometheus + Grafana + reverse proxy + **3 environnements × (api + web + admin + Postgres + Redis)**. Les builds Next.js sont eux-mêmes gourmands.

**Décisions** :
- **Gitea** plutôt que GitLab CE (quelques centaines de Mo contre environ 4 Go), les deux étant open source
- Dimensionner à **16 Go de RAM minimum**, ou répartir sur 2 VPS (« workflow » / « environnements gérés »)
- À chiffrer dans le **CST partie D.3** (CPU, RAM, disques, bande passante, SLA, GTR), qui est une section notée

### Justification du monorepo à tenir en soutenance

Types partagés entre l'API et ses **3 consommateurs** (webApp, admin, caisses) · changements atomiques front/back · un seul pipeline · `nx affected` = builds courts, argument **RSE mesurable**. Le sujet ne récompense pas la simplicité du dépôt mais la **généricité du workflow**, que les 3 dépôts de démonstration apportent.

## 5. Méthodologie et organisation

| Élément | Choix | Statut |
|---|---|---|
| Méthodologie préconisée | Scrum / Kanban / XP | ⬜ |
| Cérémonies et cadence | | ⬜ |
| Topologies DevOps retenues | | ⬜ |
| Outil de suivi (accès **public**) | Trello / Notion | ⬜ |
| Outil de Gantt | **GanttProject** ou MS Project, imposé | ⬜ |

## 6. Économie du projet

Hypothèses retenues et documentées dans `02-cahier-des-charges/annexes/calcul-tjm.md`. À valider par le groupe, et à confirmer par une source citée avant l'export.

| Élément | Valeur retenue | Statut |
|---|---|---|
| Charges patronales | 42 % | 🟡 hypothèse |
| Frais généraux | 25 % du coût employeur | 🟡 hypothèse |
| Marge de l'agence | 20 % | 🟡 hypothèse |
| Jours facturables par an | 169, soit 225 jours à 75 % d'occupation | 🟡 hypothèse |
| TJM chef de projet | 565 € | 🟡 |
| TJM ingénieur DevOps | 565 € | 🟡 |
| TJM développeur confirmé | 530 € | 🟡 |
| TJM graphiste et UX | 455 € | 🟡 |
| TJM chargé de communication | 430 € | 🟡 |
| Budget projet client | 162 j, 82 315 € HT | ✅ calculé |
| Budget workflow | 74 j, 41 565 € HT | ✅ calculé |
| Budget réel engagé par le groupe (VPS, domaines) | *(échéance postérieure à mars 2027)* | ⬜ |

## 7. Modèle des 500 000 codes, décisions techniques à documenter

| Question | Réponse retenue | Statut |
|---|---|---|
| Format du code | 10 caractères alphanumériques | ⬜ |
| Espace de codes / risque de collision | *(à calculer et justifier)* | ⬜ |
| Génération | Pré-générée en batch, gain associé **dès l'insertion** | ⬜ |
| Garantie des pourcentages 60/20/10/6/4 | *(algorithme + test automatisé de la répartition)* | ⬜ |
| Indexation / perfs | | ⬜ |
| Tirage du gros lot | **Côté serveur**, 1 chance par participant quel que soit son nombre de tickets | ⬜ |
| Fenêtre de réclamation | 30 j de jeu + 30 j après clôture | ⬜ |
