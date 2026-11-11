# Avancement des deux dossiers

> Mis à jour le 11 novembre 2026. La répartition nominative des tâches par rendu figure dans `REPARTITION.md`. À tenir à jour à chaque session de travail, et à reporter dans le Trello.

## Cahier des spécifications techniques, Furious Ducks

| Partie | Statut | Responsable | Volume |
|---|---|---|---|
| A. État des lieux | ✅ Rédigée | R3 | 1 400 mots |
| B. Méthodologie à venir | ✅ Rédigée | R3 | 1 190 mots |
| C. DevOps et DevSecOps | ✅ Rédigée | R3 | 1 265 mots |
| D. Analyse du workflow CI/CD | ✅ Rédigée | R3 | 2 550 mots |
| E. Diagramme d'infrastructure | ✅ Rédigée | R3 | 1 640 mots |
| F. Ressources humaines | ✅ Rédigée | R3 | 1 820 mots |
| G. Procédures BPMN | ✅ Rédigée | R3 | 2 380 mots |
| H. Diagramme de Gantt | ✅ Structure rédigée, à saisir sous GanttProject | R1 | 1 400 mots |
| I. Coûts et rentabilité | ✅ Rédigée | R1 et R3 | 1 430 mots |
| Couverture et sommaire | ✅ Rédigés | R1 | 550 mots |
| Annexe questionnaire et interviews | 🟡 Questionnaire prêt, entretiens à mener | R2 | 1 290 mots |

## Cahier des charges, Thé Tip Top

| Partie | Statut | Responsable | Volume |
|---|---|---|---|
| A. Descriptifs | 🟡 Rédigée, données à compléter | R1 | 2 884 mots |
| B. Plan de veille | ✅ Rédigée | R2 | 1 812 mots |
| C.1 Étude de marché | ✅ Rédigée, sources réelles | R2 | 1 120 mots |
| C.2 Benchmark, 3 concurrents | ✅ Rédigée, audits mesurés | R2 | 2 439 mots |
| C.3 Analyse de stratégie | ✅ Rédigée | R2 | 1 914 mots |
| D.0 Mix marketing | ✅ Rédigée | R2 | 700 mots |
| D. Objectifs, SMART, ROI, RSE, éditorial, e-réputation | ✅ Rédigée | R2 | 1 978 mots |
| D.3 Référencement, avec les 2 contenus rédigés | ✅ Rédigée | R2 | 1 654 mots |
| D.4 Réseaux sociaux et influence | ✅ Rédigée | R2 | 1 763 mots |
| D.5 Emailing | ✅ Rédigée | R2 | 1 351 mots |
| D.6 Analyse de performance | ✅ Rédigée | R2 | 1 131 mots |
| E. Cahier des charges fonctionnel | ✅ Rédigée | R3 | 4 275 mots |
| F. Clauses techniques | ✅ Rédigée | R3 | 2 120 mots |
| G. Identité visuelle et charte | 🟡 Rédigée, planches visuelles à produire | R4 | 2 779 mots |
| H. Cahier de légalité | ✅ Rédigée | R4 | 2 400 mots |
| I. Matrices et Gantt | ✅ Rédigée, Gantt à saisir sous GanttProject | R1 | 3 000 mots |
| J. Devis | ✅ Rédigée | R1 | 1 570 mots |
| Couverture et sommaire | ✅ Rédigés | R1 | 550 mots |
| Annexe questionnaire et interviews | 🟡 Questionnaire prêt, entretiens à mener | R2 | 1 290 mots |

## Développement applicatif, site jeu-concours

> Monorepo `06-app/theetiptop-contest`. État vérifié à l'exécution le 11 novembre 2026 :
> les trois applications démarrent, les 500 000 codes sont en base, 132 tests passent.
> Détail dans `06-app/ARCHITECTURE.md`, mesures dans `06-app/BENCHMARK.md`.

| Tâche | Intitulé | Statut | Preuve |
|---|---|---|---|
| A1 | Schéma BDD + migrations | ✅ | 4 migrations appliquées, 12 tables |
| A2 | Squelette API + squelette webApp | ✅ | 25 routes API, Swagger sur `/docs` |
| A3 | **Génération des 500 000 codes** | ✅ | 45,7 s, 11 190 lignes/s, 0 collision |
| A4 | Test automatisé de la répartition | ✅ | `codes:verify` + 13 tests d'intégration |
| A5 | Auth formulaire + Google + Facebook | ✅ | Better Auth ; OAuth câblé, identifiants à fournir |
| A6 | Rôles et permissions | ✅ | 3 gardes globales, cloisonnement testé en E2E |
| A7 | Page de présentation du jeu et des lots | ✅ | `/jeu-concours`, `/jeu-concours/lots` |
| A8 | Participation par numéro de ticket | ✅ | 6 issues UC-01, compare-and-swap concurrent |
| A9 | Historique des gains côté client | ✅ | `/mon-compte`, `/mon-compte/gains/[id]` |
| A10 | Back-office statistiques | ✅ | 12 agrégats, cache Redis 2 min |
| A11 | Export des données pour l'emailing | ✅ | CSV et JSON, opt-in seul, injection de formule neutralisée |
| A12 | Vue employé boutique | ✅ | Recherche `pg_trgm`, remise tracée au journal d'audit |
| A13 | **Tirage du gros lot côté serveur** | ✅ | 1 chance par participant, rejouable et vérifiable |
| A14 | Endpoints API pour les caisses | ✅ | 3 routes, clé d'API, `FOR UPDATE SKIP LOCKED` |
| A15 | RGPD | ✅ | Consentements horodatés serveur, export art. 20, anonymisation art. 17 |
| A16 | Accessibilité + responsive | ✅ | `jsx-a11y` au lint, projet Playwright mobile |
| A17 | SEO on-page | ✅ | SSR, métadonnées, sitemap généré, Schema.org |
| A18 | Tests de performance | 🟡 | Scénarios k6 écrits ; **k6 à installer pour les exécuter** |

### Tests livrés

| Famille | Outil | Volume | Statut |
|---|---|---|---|
| Unitaires | Vitest | 54 | ✅ passent |
| Intégration | Vitest + PostgreSQL | 32 | ✅ passent |
| Fonctionnels | Playwright, 3 projets | 46 | ✅ passent |
| Performance | k6 | 3 scénarios | 🟡 écrits, non exécutés |

Rapports JUnit écrits dans `reports/junit/`, prêts pour l'étape `junit` de Jenkins.

### Jeu de données de démonstration

`npm run db:seed:demo` peuple le jeu comme l'aurait fait un mois de trafic réel, en
environ 3 secondes. Indispensable pour la soutenance : avec les 5 comptes du seed de
référence, le tableau de bord affiche une seule barre et la courbe quotidienne est plate.

| Mesure | Valeur |
|---|---|
| Clients | 1 200, répartis sur les 6 tranches d'âge |
| Participations | 2 042, réparties sur les 11 jours ouverts du jeu |
| Lots remis | 1 246 |
| Base emailing opt-in | 673 |
| Boutique la plus active | Nice, 348 codes joués |

Il ne fabrique **ni code ni lot** : chaque participation consomme un vrai code `AVAILABLE`
du pool et le fait passer par les états `DISPENSED` puis `USED`, comme le feraient la
caisse et le site. `codes:verify` passe donc toujours après.

Propriété qui en découle : les lots réellement gagnés sortent à
**59,6 / 20,7 / 9,4 / 6,1 / 4,2 %** sans que le script connaisse la répartition. C'est la
garantie de la génération qui se vérifie d'elle-même.

### Conteneurisation

| Image | Taille mesurée | Vérifiée à l'exécution |
|---|---|---|
| `theetiptop/api` | 471 Mo | ✅ healthy, sert le catalogue et les routes caisse |
| `theetiptop/web` | 322 Mo | ✅ healthy, rend les pages avec les données réelles |
| `theetiptop/admin` | 319 Mo | ✅ healthy |

### Ce qui bloque encore, côté applicatif

| Blocage | Ce qu'il empêche | Qui doit agir |
|---|---|---|
| Identifiants OAuth Google et Facebook | Les deux connexions sociales. Le code est câblé et se désactive proprement sans eux | R3, après création des applications tierces |
| k6 non installé | L'exécution des tests de performance, donc les chiffres de débit du CST partie I | R3 |
| Numéro de classe et de groupe | Les noms de domaine réels dans les `.env` de déploiement | Le groupe |

## Ce qui bloque

| Blocage | Ce qu'il empêche | Qui doit trancher |
|---|---|---|
| Numéro de classe et numéro de groupe | Nommage des fichiers de rendu, noms de domaine | Le groupe |
| Grille de salaires, charges, marge, TJM | ✅ Hypothèses posées dans l'annexe TJM, à valider par le groupe | R1 |
| Identité juridique de Furious Ducks | CST partie A.1, CDC partie A.3, couvertures, mentions de bas de page | Le groupe |
| Identité juridique de Thé Tip Top, fictive | CDC partie A.1 et mentions légales | R1 |
| Noms et coordonnées des 4 membres | Comité de pilotage du CDC, rédacteurs sur les couvertures | Le groupe |
| Benchmark des 3 concurrents | CDC parties C et D, et le SWOT de la partie A | R2 |

## Données à sourcer avant l'export

Le sujet exige que les chiffres soient sourcés et datés de moins de cinq ans. Ces éléments portent aujourd'hui la mention « à confirmer ».

| Donnée | Section | Source à trouver |
|---|---|---|
| Grille de salaire d'un ingénieur DevOps | CST F.1 | Étude de rémunération sectorielle ou convention Syntec |
| Versions minimales de navigateurs | CDC F.1 | Statistiques de parts de marché et tables de support |
| Coûts d'hébergement et de nom de domaine | CDC F.4 et CST D.3 | Tarifs publics des prestataires retenus |
| Marché du thé, bio, saisonnalité | CDC C.1 | Sources publiques, moins de 5 ans |
| Taux de charges patronales | Annexes TJM | Barème en vigueur |

## Travaux de mise en forme restants

| Tâche | Détail |
|---|---|
| Redessiner les diagrammes | 6 BPMN du CST partie G et les diagrammes UML du CDC partie E, dans un outil dédié. Compter une demi-journée |
| Diagramme des cas d'utilisation | Le rendre en notation UML plutôt qu'en schéma texte |
| Pagination 1/100 | Sur les deux dossiers, en A4 portrait |
| Sommaires | Complets, avec numéros de page, dans l'ordre du plan imposé |
| Relecture croisée | Contre les checklists `PLAN.md`, le 29 août |
