# Mesures sur les 500 000 codes

> Mesures réelles, reproductibles avec `npm run codes:generate` puis `npm run codes:verify`.
> Elles alimentent le **CST partie I** (coûts et rentabilité), le **CDC partie F** (clauses
> techniques) et la tâche **A18** du backlog. Aucune valeur de ce document n'est estimée.

## Environnement de mesure

| Élément | Valeur |
|---|---|
| Machine | Apple Silicon arm64, macOS 25.4 |
| Node.js | 24.14.1 |
| PostgreSQL | 17-alpine, conteneur Docker |
| Paramètres PostgreSQL | `shared_buffers=256MB`, `work_mem=16MB`, `maintenance_work_mem=256MB`, `synchronous_commit=off` |
| Prisma | 7.10.1, adaptateur `@prisma/adapter-pg` |
| Date de la mesure | 11 novembre 2026 |

⚠️ `synchronous_commit=off` est un réglage de **développement**. Il accélère l'insertion en
masse en n'attendant pas le `fsync` du journal, au prix de la perte des dernières
transactions en cas de coupure brutale. En production la valeur reste `on` : il faudra
donc compter une insertion plus lente que les 45 s mesurées ici, ce qui reste sans
conséquence puisque la génération est une opération unique, menée avant l'ouverture du jeu.

## 1. Espace de codes et risque de collision

Format imposé par le sujet : **10 caractères alphanumériques**. Alphabet retenu : 26 lettres
majuscules + 10 chiffres, soit 36 symboles.

```
N = 36^10 = 3 656 158 440 062 976          ≈ 3,656 × 10^15 codes possibles
n = 500 000                                 tirages
```

Nombre attendu de collisions, approximation du paradoxe des anniversaires :

```
E[collisions] ≈ n² / 2N = (5 × 10^5)² / (2 × 3,656 × 10^15)
                        = 2,5 × 10^11 / 7,312 × 10^15
                        ≈ 3,42 × 10^-5
```

Soit environ **1 chance sur 29 000** d'observer ne serait-ce qu'une seule collision sur
l'ensemble de la génération. Taux d'occupation de l'espace : `n/N ≈ 1,4 × 10^-10`, autrement
dit un code tiré au hasard par un attaquant a **1 chance sur 7,3 milliards** d'exister.

**Ce calcul n'est pas la garantie d'unicité.** La garantie est l'index unique PostgreSQL sur
`TicketCode.code`. C'est la seule protection qui tienne si le générateur pseudo-aléatoire
collisionne, et c'est aussi elle qui empêche une seconde exécution du script de dupliquer
le pool. Le script tient en plus un `Set` en mémoire, qui rend la liste provablement unique
avant la première insertion.

**Mesure observée** : 0 collision sur l'exécution du 11 novembre 2026, conforme à l'attente.

## 2. Génération et insertion

| Étape | Durée mesurée | Détail |
|---|---|---|
| Construction + mélange du vecteur de lots | **25 ms** | 500 000 entrées, Fisher-Yates descendant, PRNG xoshiro128** seedé |
| Tirage des 500 000 codes distincts | **1,02 s** | 5 000 000 d'appels au PRNG, échantillonnage par rejet |
| Insertion en base | **44,68 s** | 100 lots de 5 000 lignes, soit **11 190 lignes/s** |
| **Total** | **45,73 s** | |

### Pourquoi 5 000 lignes par lot

PostgreSQL plafonne un ordre SQL à **65 535 paramètres liés**. `createMany` de Prisma produit
un seul `INSERT` multi-lignes à 4 paramètres par ligne (`id`, `code`, `prizeId`, `contestId`),
soit 20 000 paramètres pour 5 000 lignes : confortablement sous le plafond, et assez gros
pour que les 100 allers-retours réseau ne dominent plus le temps d'exécution.

### Alternative écartée : `COPY`

`COPY FROM STDIN` est plus rapide que des `INSERT` multi-lignes, d'un facteur généralement
compris entre 2 et 5. Elle a été écartée pour trois raisons :

1. **45 s suffisent.** L'opération est unique et se déroule avant l'ouverture du jeu, hors
   fenêtre de service. Optimiser une opération unique n'a pas de valeur.
2. `COPY` contourne Prisma et impose d'écrire du SQL brut, donc de dupliquer la connaissance
   du schéma hors des migrations versionnées.
3. `COPY` ne renvoie pas le nombre de lignes insérées par lot, ce qui prive le script du
   contrôle de progression qui permet aujourd'hui de détecter un lot partiellement appliqué.

À défendre en soutenance : le choix n'est pas « on ne savait pas faire plus vite », c'est
« le gain ne compense pas la perte de lisibilité et de contrôle sur une opération unique ».

## 3. Occupation disque

| Mesure | Valeur |
|---|---|
| Table `TicketCode`, total | **129 Mo** |
| Dont données (heap) | **67 Mo** |
| Dont index | **62 Mo** |
| Par ligne, tout compris | **≈ 270 octets** |

Six index sur la table : l'unique sur `code`, plus `status`, `(prizeId, status)`,
`(contestId, status)`, `usedAt`, `(storeId, status)` et `dispensedAt`. Les index pèsent
presque autant que les données, ce qui est le coût assumé des agrégations du back-office :
sans eux, chaque chargement du tableau de bord déclencherait un parcours séquentiel de
500 000 lignes.

**Choix de `CHAR(10)` plutôt que `TEXT`** : longueur fixe et connue, donc index B-tree plus
compact et pas d'en-tête de longueur variable par ligne. Sur 500 000 lignes l'écart est
modeste en absolu, mais il porte sur l'index le plus sollicité du système.

## 4. Latence de lecture, la requête la plus chaude du site

Chaque participation d'un client est une recherche par `code`. C'est la requête la plus
fréquente de l'application.

| Mesure | Valeur |
|---|---|
| Recherche par `code` (`findUnique`) | **529 µs** en moyenne sur 200 lectures |

Mesurée sur une table de 500 000 lignes, index unique B-tree, via le pool de l'adaptateur
`node-postgres`. La valeur inclut l'aller-retour réseau vers le conteneur, la planification
et l'exécution.

**Conséquence de dimensionnement** : à 529 µs par lecture, un seul conteneur d'API absorbe
théoriquement environ 1 890 vérifications de code par seconde sur cette seule requête. Le
sujet annonce 500 000 codes distribués sur 30 jours ; même en concentrant la moitié des
participations sur une seule journée, on reste trois ordres de grandeur sous cette limite.
La base n'est donc pas le facteur limitant, ce qui justifie de dimensionner les conteneurs
sur la mémoire plutôt que sur le débit SQL — voir `DECISIONS.md` § 4 bis, risque n° 5.

## 5. Conformité de la répartition

Vérifiée **en base**, après insertion, par `npm run codes:verify`. Le script sort en code
d'erreur non nul à la moindre divergence, ce qui fait échouer le pipeline Jenkins au lieu de
déployer un jeu dont la répartition ne correspond pas au règlement déposé.

| Contrôle | Attendu | Mesuré |
|---|---|---|
| Nombre total de codes | 500 000 | ✅ 500 000 |
| Infuseur à thé | 300 000 — 60,00 % | ✅ 300 000 — 60,00 % |
| Thé détox ou infusion | 100 000 — 20,00 % | ✅ 100 000 — 20,00 % |
| Thé signature | 50 000 — 10,00 % | ✅ 50 000 — 10,00 % |
| Coffret 39 € | 30 000 — 6,00 % | ✅ 30 000 — 6,00 % |
| Coffret 69 € | 20 000 — 4,00 % | ✅ 20 000 — 4,00 % |
| Codes attachés au gros lot | 0 | ✅ 0 |
| Codes distincts | 500 000 | ✅ 500 000 |
| Codes malformés | 0 | ✅ 0 |
| Empreinte du pool | celle du tirage | ✅ identique |

Empreinte SHA-256 du pool au 11 novembre 2026 :
`feb09752b1393583bfa6ae7fe66c5b58e0ef32aba09d9f15248325d382679586`

### Pourquoi la répartition est exacte et non statistique

Le script ne tire pas un lot par code contre une probabilité. Il **construit le vecteur
exact** — 300 000 entrées pour l'infuseur, pas une de plus — puis il le mélange. Un tirage
par code tomberait près de 60 % mais pratiquement jamais sur exactement 60 %, alors que le
règlement déposé chez l'huissier dit 60 %. C'est le point à défendre en soutenance.

### Auditabilité par l'huissier

La graine de génération n'est **pas** stockée en base : quiconque la détient peut rejouer la
génération et dériver les 500 000 codes avec le lot associé à chacun. À la place :

| Élément | Où | À quoi ça sert |
|---|---|---|
| Graine | affichée une fois, remise à l'huissier et au coffre à secrets | rejouer la génération |
| `Contest.codeGenerationSeedHash` | en base | prouver qu'une graine présentée est *la* graine, sans que la base la contienne |
| `Contest.codePoolFingerprint` | en base | prouver qu'aucun code n'a été ajouté, retiré ou réécrit depuis |

## 6. Tailles des images Docker

Mesures du 11 novembre 2026, base `node:24-alpine`, images vérifiées à l'exécution.

| Image | Taille | Contenu |
|---|---|---|
| `theetiptop/api` | **471 Mo** | Bundle webpack + les 20 paquets laissés externes |
| `theetiptop/web` | **322 Mo** | Sortie `standalone` de Next, sans `node_modules` |
| `theetiptop/admin` | **319 Mo** | Idem |

### De 1,46 Go à 471 Mo pour l'API

Dans un workspace npm, réduire l'installation aux dépendances d'une seule application n'est
pas trivial. Trois approches mesurées avant d'arriver à la bonne.

| Approche | `node_modules` mesuré | Verdict |
|---|---|---|
| `npm ci --omit=dev -w @theetiptop-contest/api --include-workspace-root` | **936 Mo** | ❌ Le filtre de workspace ne restreint pas `ci` : TypeScript, Next et Playwright sont installés |
| `npm prune --omit=dev --include-workspace-root` | **936 Mo** | ❌ Même résultat, même raison |
| `nx prune`, qui produit un manifeste **et** un lockfile élagués | — | ❌ Lockfile incohérent avec son propre manifeste : `npm ci` s'arrête sur `Missing: content-type@1.0.5`. Express 5 atteint `content-type` par deux chemins, le pruner n'en enregistre qu'un |
| ✅ **`generatePackageJson` + épinglage aux versions exactes** | **~380 Mo** | Webpack émet la liste exacte de ses externes ; `tools/pin-runtime-deps.mjs` remplace chaque intervalle par la version résolue par l'étage de build |

La chaîne reste reproductible : lockfile versionné → étage de build → manifeste épinglé →
installation d'exécution. **Limite assumée** : seules les dépendances directes sont
épinglées, leurs transitives se résolvent à la construction de l'image.

## 7. Résultats des tests

Exécutions du 11 novembre 2026.

| Famille | Outil | Volume | Durée | Résultat |
|---|---|---|---|---|
| Unitaires | Vitest 5 | 54 tests | 0,5 s | ✅ |
| Intégration | Vitest + PostgreSQL | 32 tests | 2,9 s | ✅ |
| Fonctionnels | Playwright, 3 projets | 46 tests | 2,5 h ⚠️ | ✅ |
| Performance | k6 | 3 scénarios | — | 🟡 écrits, k6 non installé |

⚠️ **Les 2,5 heures du suite fonctionnelle sont un artefact du serveur de développement** :
`next dev` compile chaque route à sa première visite, et la suite en parcourt une vingtaine
sur trois projets de navigateur. En CI, `playwright.config.ts` démarre les **builds de
production** (`next start`), ce qui supprime l'essentiel de ce temps — et teste au passage
l'artefact qui est réellement déployé.

## 8. Ce qui reste à mesurer

| Mesure | Outil prévu | Pourquoi ce n'est pas fait | Tâche |
|---|---|---|---|
| Débit de participations concurrentes | k6 | Le binaire k6 n'est pas installé. Les scénarios sont écrits dans `tests/performance/participation.k6.ts`, exécutables aussi via l'image `grafana/k6` | A18 |
| Latence du tableau de bord sous charge | k6 | Idem | A18 |
| Temps du tirage sur 40 000 participants | script dédié | Demande un jeu de données de 40 000 participants, qui n'existe pas encore | A13 |
| Insertion avec `synchronous_commit=on` | `codes:generate` en préprod | Demande l'environnement de préprod, qui dépend du workflow | A18 |
