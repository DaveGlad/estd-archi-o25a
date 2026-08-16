# Planning macro, du 15 août au 18 décembre 2026

## Où on en est vraiment

| Échéance | Date | Statut au 16/08/2026 |
|---|---|---|
| Compréhension projet | 26 mai 2026 | ⚠️ **Dépassée**. À vérifier avec le formateur, des pénalités ont peut-être déjà été appliquées |
| Vérification avancée projet | 29 juin 2026 | ⚠️ **Dépassée**, même remarque |
| CDC et CST définitifs | **31 août 2026, 9h** | 🔴 **J-15**. Non rendu, pas de soutenance |
| Évaluation des dossiers et entretien | semaine du 19 oct. 2026 | ⏳ |
| Site et workflow en ligne | **16 nov. 2026, 9h** | 🔴 Non rendu, pas de soutenance |
| Évaluation du site et du workflow | semaine du 16 nov. 2026 | ⏳ |
| Archive projet | **14 déc. 2026, 9h** | ⏳ |
| Soutenance | semaine du 14 déc. 2026 | ⏳ 15 à 20 min en groupe, puis environ 15 min individuelles |

Première action, sans délai : contacter le formateur au sujet des deux rendus dépassés, et les déposer quand même. Des pénalités valent toujours mieux qu'un zéro, et ça montre que le groupe reprend la main. Le détail est en tête de `SPRINT-01-DOSSIERS.md`.

## Les cinq phases

```
AOÛT          SEPTEMBRE      OCTOBRE        NOVEMBRE       DÉCEMBRE
15 ────── 31 │ 1 ─────── 30 │ 1 ─────── 31 │ 1 ─────── 30 │ 1 ─────── 18
[  PHASE 1   ]
  DOSSIERS    [        PHASE 2, BUILD            ]
  (16 jours)   workflow CI/CD + site jeu-concours
                              [éval]           [PHASE 3]
                                                mise en ligne
                                                              [PHASE 4]
                                                               V2 + archive
                                                               + soutenance
```

## Phase 1, les deux dossiers, 15 au 31 août

L'objectif est simple : déposer le 31 août à 9h le cahier des charges pour Thé Tip Top et le cahier des spécifications techniques pour Furious Ducks, tous deux conformes au plan imposé.

Livrables attendus :

- `ESTD ARCHI {classe} – G{n} – Cahier des charges.pdf`
- `ESTD ARCHI {classe} – G{n} – Cahier des spécifications techniques.pdf`
- `ESTD ARCHI {classe} – G{n} – Accès organisation projet.pdf`
- En option mais recommandé, le diagramme de Gantt et l'archive `Prototypage et maquettage.zip`

La charge est estimée à environ 380 heures-personne. À quatre sur seize jours, cela représente à peu près 6 heures par jour et par personne. C'est tenable, sans marge. Le découpage jour par jour de `SPRINT-01-DOSSIERS.md` est donc à suivre à la lettre.

Quatre verrous doivent être levés dès le 16 août, faute de quoi tout le reste glisse : la stack technique du site, les briques du workflow, l'identité juridique de l'agence avec le TJM des ressources, et la répartition des rôles. Tout se consigne dans `DECISIONS.md`.

## Phase 2, le build, 1er septembre au 18 octobre

Deux chantiers avancent en parallèle et finissent par converger, puisque le site jeu-concours doit être déployé par le workflow. C'est cette convergence qui constitue la démonstration attendue.

### Chantier A, le workflow CI/CD

| Semaine | Objectif |
|---|---|
| 1er au 6 sept. | Commande du VPS et des domaines. Socle Docker, réseaux, Traefik avec TLS, DNS des sous-domaines |
| 7 au 13 sept. | SCM en place, GitFlow appliqué, comptes de l'équipe créés |
| 14 au 20 sept. | Jenkins et ses agents Docker, premier pipeline, registry d'images |
| 21 au 27 sept. | Pipeline complet, du build au déploiement automatique en dev |
| 28 sept. au 4 oct. | Environnements preprod et prod conteneurisés, preprod automatique, prod sur validation |
| 5 au 11 oct. | Métriques Prometheus et Grafana, tableaux de bord, alertes |
| 12 au 18 oct. | Backups automatisés, test de restauration réel, publication des rapports de tests |

Les exigences du sujet à cocher une par une : tout en Docker, sous Linux, applications open source, configuration par Jenkinsfile sans accès au CI, et la capacité à déployer trois types de projets, ce qui suppose trois dépôts de démonstration.

### Chantier B, le site jeu-concours

| Semaine | Objectif |
|---|---|
| 1er au 6 sept. | Schéma de base, init du dépôt, squelettes de l'API et de la webApp |
| 7 au 13 sept. | Génération des 500 000 codes avec la répartition exacte, et son test automatisé |
| 14 au 20 sept. | Authentification par formulaire et par OAuth Google et Facebook, gestion des rôles |
| 21 au 27 sept. | Parcours client, saisie du code, attribution du gain, historique |
| 28 sept. au 4 oct. | Back-office administrateur, statistiques, export pour l'emailing |
| 5 au 11 oct. | Vue employé boutique, remise des lots, tirage au sort côté serveur |
| 12 au 18 oct. | RGPD, accessibilité, SEO, responsive, performances |

### Chantier C, le marketing opérationnel

Ces éléments sont des rendus concrets, souvent oubliés parce qu'ils ne ressemblent pas à du travail de dossier. Ils doivent être en place avant le 16 novembre, et idéalement dès septembre pour avoir de l'historique.

- Compte Google Analytics lié au site, avec les 4 événements demandés et un rapport personnalisé
- Au moins un réseau social créé en privé, avec plusieurs publications conformes à la ligne éditoriale
- Compte Hootsuite gratuit relié aux réseaux créés
- Compte chez un prestataire d'emailing, avec un template respectant la charte et le RGPD
- Trello ou Notion public, tenu à jour depuis le début, avec les comptes rendus de réunion

## Phase 3, mise en ligne et durcissement, 19 octobre au 16 novembre

| Semaine | Objectif |
|---|---|
| 19 au 25 oct. | Semaine prépa, évaluation des dossiers et entretien. Noter tous les points à corriger pour la V2 |
| 26 oct. au 1er nov. | Correctifs. Tests unitaires, d'intégration, fonctionnels et de performance sur les 500 000 codes |
| 2 au 8 nov. | Déploiement en production sur les domaines imposés, sous-domaines des outils, HTTPS partout |
| 9 au 15 nov. | Recette complète, accessibilité, SEO, vérification des backups, rédaction du document d'accès |
| 16 nov. 9h | Rendu du document `Accès site internet et comptes divers.pdf` |
| 16 au 22 nov. | Évaluation du site et du workflow, puis liste des correctifs pour l'archive |

Le document du 16 novembre doit contenir l'URL du site, les identifiants administrateur du back-office, ceux des autres comptes créés, le login et le mot de passe du compte Git, les URL et identifiants de chaque service du workflow, le compte Google Analytics et l'outil de gestion de projet.

## Phase 4, V2, archive et soutenance, 17 novembre au 18 décembre

| Semaine | Objectif |
|---|---|
| 23 au 29 nov. | CDC V2 et CST V2 intégrant les remarques des deux évaluations |
| 30 nov. au 6 déc. | Support de présentation de 15 à 20 minutes, puis répétitions chronométrées |
| 7 au 13 déc. | Export de la base, archive du code, vérification du nommage de chaque fichier, dry-run complet |
| 14 déc. 9h | Dépôt de l'archive `Archive projet de fin d'année` |
| 14 au 18 déc. | Soutenance, avec préparation spécifique des entretiens individuels |

L'archive doit contenir les deux dossiers en v1, les deux en V2, le support de présentation, le code source du site, l'export de la base, les accès au site et au workflow, et les accès à l'outil de gestion de projet.

## Jalons de contrôle

À vérifier en réunion d'équipe, avec un critère de passage clair pour chacun.

| Jalon | Date | Critère de passage |
|---|---|---|
| Cadrage figé | 17 août | Stack, briques du workflow, identité de l'agence et rôles écrits dans `DECISIONS.md` |
| Dossiers à mi-parcours | 23 août | Toutes les parties A à E rédigées au moins en brouillon |
| Dossiers rendus | 31 août 9h | PDF conformes déposés sur Teams |
| Le workflow déploie | 27 sept. | Un commit sur `develop` déploie automatiquement en dev |
| Site fonctionnel | 11 oct. | Les 8 fonctionnalités du sujet passent en recette |
| Production en ligne | 8 nov. | Les 2 domaines répondent en HTTPS |
| Archive prête | 12 déc. | Dry-run validé, nommage vérifié |

## Risques et parades

| Risque | Impact | Parade |
|---|---|---|
| 16 jours pour deux dossiers | 🔴 Critique | Sprint jour par jour, travail parallélisé, aucune section laissée vide. Court vaut mieux que manquant |
| Retards déjà accumulés en mai et juin | 🟠 Note | Contacter le formateur aujourd'hui, rendre quand même les documents |
| Le Gantt doit être fait sous un outil imposé | 🟠 Blocage | Installer GanttProject dès le 16 août. MS Project ne tourne pas nativement sur macOS |
| Performances sur 500 000 codes | 🟠 Technique | Index en base, génération par batch, tests de charge dès septembre |
| Site et workflow à maintenir en ligne jusqu'au jury | 🟠 Budget | Prendre le VPS et les domaines avec une échéance postérieure à mars 2027 |
| Entretien individuel | 🟠 Note | Chacun relit l'intégralité des dossiers, pas seulement sa partie. Session de questions croisées en décembre |
| Perte de données | 🔴 Critique | Tout dans Git dès aujourd'hui, dossiers compris, et backups testés |
