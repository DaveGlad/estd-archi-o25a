# Répartition des tâches, groupe de 4

> Établie le 16 août 2026 à partir des cinq documents du sujet. Chaque ligne renvoie à l'exigence qui la justifie, pour qu'aucune ne soit oubliée et qu'aucune ne soit faite deux fois.

## 1. L'ordre imposé par l'énoncé

L'expression de besoin fixe une séquence qu'il faut respecter, y compris dans la présentation en soutenance.

> « Il vous est donc demandé de réaliser **dans un premier temps** le cahier des spécifications techniques pour le workflow et le workflow en lui-même pour l'agence. »
> « **Dans un second temps**, vous devrez réaliser le cahier des charges et le site internet du jeu-concours pour le client Thé Tip Top. »

Conséquence pratique : le workflow doit être opérationnel avant que le développement du site ne démarre, puisque c'est lui qui doit le déployer. Le planning de la phase 2 respecte cette dépendance.

## 2. Les quatre rôles

Les rôles sont à la fois la répartition interne et la maîtrise d'œuvre présentée au client dans le comité de pilotage du cahier des charges.

| Réf. | Rôle | Périmètre principal | Périmètre secondaire |
|---|---|---|---|
| **R1** | Chef de projet | Pilotage, chiffrage, Gantt, devis, documents légaux, comité de pilotage | Recette fonctionnelle, animation des soutenances |
| **R2** | Chargé de communication digitale | Veille, benchmark, étude de marché, mix marketing, stratégie digitale, comptes réels à créer | Rédaction des contenus SEO, recette éditoriale |
| **R3** | Développeur et référent technique | Cahier des spécifications techniques, workflow CI/CD, API, base de données, tests | Diagrammes UML et BPMN, mise en ligne |
| **R4** | Graphiste et référent expérience utilisateur | Identité visuelle, charte, zonings, wireframes, maquettes, intégration, accessibilité | Visuels des réseaux sociaux, support de présentation |

**Règle de suppléance.** Chaque livrable a un titulaire et un suppléant. Le suppléant relit systématiquement, et prend la main en cas d'absence. R1 supplée R2, R2 supplée R4, R3 supplée R1 sur le chiffrage, R4 supplée R3 sur l'intégration.

**Règle d'or.** Aucun livrable n'est déposé sans avoir été relu par une personne qui ne l'a pas écrit.

## 3. Rendus déjà dépassés, à traiter en urgence

| Rendu | Date initiale | Titulaire | Suppléant | Action |
|---|---|---|---|---|
| `Compréhension projet.docx` | 26 mai 2026 | R1 | R2 | Contacter le formateur, remplir le document fourni, déposer même en retard |
| `Vérification avancée projet.docx` | 29 juin 2026 | R1 | R3 | Idem, en s'appuyant sur l'avancement réel décrit dans `AVANCEMENT.md` |

Les deux documents sont notés et les pénalités sont déjà encourues. Les déposer reste préférable à un zéro, et montre la reprise en main.

## 4. Rendu du 31 août, 9h : les deux dossiers

### Ce qui est attendu

| Fichier | Titulaire du dépôt |
|---|---|
| `ESTD ARCHI {classe} – G{n} – Cahier des charges.pdf` | R1 |
| `ESTD ARCHI {classe} – G{n} – Cahier des spécifications techniques.pdf` | R1 |
| `ESTD ARCHI {classe} – G{n} – Accès organisation projet.pdf` | R1 |
| `ESTD ARCHI {classe} – G{n} – Diagramme de Gantt` *(optionnel)* | R1 |
| `ESTD ARCHI {classe} – G{n} – Prototypage et maquettage.zip` *(optionnel)* | R4 |

### Cahier des spécifications techniques, Furious Ducks

| Partie | Contenu | Titulaire | Relecteur | État |
|---|---|---|---|---|
| A.1 | Présentation de l'agence, storytelling et informations juridiques | R1 | R3 | Rédigée, identité juridique à figer |
| A.2 | Problématique de Mr Brasletti, étoffée | R3 | R1 | Rédigée |
| A.3 | Méthodologie actuelle, le cycle en V et ses limites | R3 | R1 | Rédigée |
| B | Méthodologie à venir, justifiée, avantages, inconvénients, mise en place, outils | R3 | R1 | Rédigée |
| C | DevOps et DevSecOps, topologies d'équipe et leurs évolutions | R3 | R1 | Rédigée |
| D.1 | Définitions CI/CD, contraintes, tâches à automatiser | R3 | R1 | Rédigée |
| D.2 | Choix techniques service par service, standards associés | R3 | R1 | Rédigée |
| D.3 | Hébergement, CPU, RAM, disques, bande passante, SLA, GTR, backups | R3 | R1 | Rédigée |
| E | Diagramme d'infrastructure, ports et protocoles | R3 | R4 | Rédigée, **à redessiner dans un outil** |
| F.1 | Fiche de poste, contrat, grille de salaire | R1 | R3 | Rédigée, **grille à sourcer** |
| F.2 | Plan de formation | R1 | R3 | Rédigée |
| G | Procédures BPMN, six diagrammes | R3 | R4 | Rédigées, **à redessiner en BPMN** |
| H | Gantt du workflow, mode ASAP | R1 | R3 | Structure prête, **à saisir dans l'outil** |
| I | Coûts de mise en place, de maintenance, rentabilité | R1 | R3 | Rédigée |
| Annexe | Calcul du TJM | R1 | R3 | Rédigée, hypothèses à valider |
| Couverture, sommaire, pagination | | R1 | R4 | À faire |

### Cahier des charges, Thé Tip Top

| Partie | Contenu | Titulaire | Relecteur | État |
|---|---|---|---|---|
| A.1 | Présentation du client, informations juridiques, SWOT | R2 | R1 | Rédigée, SWOT à compléter après le benchmark |
| A.2 | Présentation du projet, besoin reformulé, livrables, contraintes | R1 | R2 | Rédigée |
| A.3 | Présentation de l'agence | R1 | R3 | Rédigée |
| A.4 | Comité de pilotage, 3 personnes côté client minimum | R1 | R2 | Rédigée, **coordonnées à compléter** |
| A.5 | Descriptif rédactionnel fonctionnel, rédigé et non en liste | R1 | R3 | Rédigée |
| B | Plan de veille, types, objectifs, axes, sources, outils dont IA, diffusion, dates | R2 | R1 | Rédigée |
| C.1 | Étude de marché et chiffres clés, sources de moins de 5 ans | R2 | R1 | **À faire, 1 jour** |
| C.2 | Benchmark, 3 concurrents et 5 audits chacun, conclusions, mapping | R2 | R4 | **À faire, 3 jours** |
| C.3 | Cibles, grilles d'état d'esprit, personas, tableau des acteurs, zone de chalandise | R2 | R1 | **À faire, 1 jour** |
| D.0 | Mix marketing | R2 | R1 | Rédigée |
| D | Objectifs, SMART, ROI, RSE, éditorial, e-réputation, SEO, SMO, emailing, KPI | R2 | R1 | **À faire, 2 jours** |
| E.1 à E.4 | Cas d'utilisation, arborescence, diagrammes d'activité et de séquence | R3 | R4 | Rédigées, **à redessiner en UML** |
| E.5 | MCD et MLD | R3 | R1 | Rédigée |
| F | Technologies, compatibilité navigateurs, software, tests, hébergement | R3 | R1 | Rédigée, **versions et coûts à sourcer** |
| G.1, G.2 | Trois concepts de logo, trois déclinaisons chacun, logo final | R4 | R2 | **À faire, 1,5 jour** |
| G.3 | UX mapping, empathy map et experience map | R4 | R2 | **À faire, 0,5 jour** |
| G.4, G.5, G.6 | Zoning, wireframes, maquettes, en trois formats | R4 | R1 | **À faire, 3 jours** |
| G.7 | Charte graphique, CMJN, RVB, hexadécimal, typographies et licences | R4 | R3 | **À faire, 0,5 jour** |
| H | Mentions légales, CGU | R1 | R2 | Rédigée |
| I.1 | MoSCoW, Eisenhower, RACI, matrice des risques | R1 | R3 | Rédigée |
| I.2 | Gantt du projet client, mode ASAP, diagramme des ressources | R1 | R3 | Structure prête, **à saisir dans l'outil** |
| J | Devis principal et devis optionnels | R1 | R2 | Rédigée |
| Annexes | Questionnaire, retranscriptions d'interviews, calcul du TJM | R2 et R1 | croisée | **Interviews à mener** |

### Charge restante par personne d'ici au 31 août

| Personne | Jours restants estimés | Point de tension |
|---|---|---|
| R1 | 4 | Saisie des deux Gantt, mise en forme des deux dossiers |
| R2 | 7 | Le benchmark seul pèse 3 jours et bloque le SWOT et la partie D |
| R3 | 2 | Redessin des diagrammes UML et BPMN |
| R4 | 5,5 | Chemin critique de la partie G, aucune ressource de compensation |

R2 et R4 sont les deux goulots. R1 les décharge de la relecture croisée finale, et R3, dont la charge est la plus faible sur cette phase, reprend le redessin des diagrammes de la partie E du cahier des charges.

## 5. Semaine du 19 octobre : évaluation des dossiers

Semaine de formation réservée au projet. Le formateur note les deux dossiers et mène un entretien.

| Tâche | Titulaire | Détail |
|---|---|---|
| Préparer la défense de chaque partie | tous | Chacun doit pouvoir justifier **l'intégralité** des deux dossiers, pas seulement sa partie |
| Consigner les remarques du formateur | R1 | Un relevé écrit, partie par partie, qui devient la liste de travail pour la V2 |
| Arbitrer les corrections | R1 | Distinguer ce qui est une erreur de ce qui est une préférence |
| Préparer l'errata | R1 | Le sujet autorise un errata le jour de la soutenance pour les points soulevés |

## 6. Rendu du 16 novembre, 9h : site et workflow en ligne

### Le document à déposer

`ESTD ARCHI {classe} – G{n} – Accès site internet et comptes divers.pdf`, préparé par R1, alimenté par chacun.

| Information | Fournie par |
|---|---|
| URL du site en ligne | R3 |
| Identifiants administrateur du back-office | R3 |
| Identifiants des autres comptes créés, utilisateur, abonné, employé boutique | R3 |
| Login et mot de passe du compte GIT | R3 |
| URL et identifiants de chaque service du workflow | R3 |
| Identifiants Google Analytics | R2 |
| Identifiants de l'outil de gestion de projet | R1 |

### Le workflow, objectif n°1

| Exigence de l'énoncé | Titulaire | Vérificateur |
|---|---|---|
| 1. Hébergement dédié ou cloud, sous Linux | R3 | R1 |
| 2. Entièrement basé sur Docker, workflow et serveurs gérés | R3 | R4 |
| 3a. Solution CI Jenkins | R3 | R1 |
| 3b. Solution SCM de type Git | R3 | R1 |
| 3c. Solutions de tests applicatifs | R3 | R4 |
| 3d. Solutions de backups automatisés | R3 | R1 |
| 3e. Solutions de métriques | R3 | R1 |
| 4a. Optimisation des assets, minification et compression | R3 | R4 |
| 4b. Déploiement automatique des serveurs de dev | R3 | R1 |
| 4c. Stockage des images Docker construites par la CI | R3 | R1 |
| 4d. Déploiement automatique de la préproduction | R3 | R1 |
| 4e. Déploiement de la production, niveau d'automatisation justifié | R3 | R1 |
| 4f. Tests unitaires et fonctionnels exécutés | R3 | R4 |
| 4g. Envoi et stockage des rapports de tests | R3 | R1 |
| 5. Configuration modifiable par les devs sans accès au CI | R3 | R1 |
| 6. Applications open source, ou libres au pire | R3 | R1 |
| 7a. Pipeline site vitrine HTML-CSS | R4 | R3 |
| 7b. Pipeline site administrable | R3 | R1 |
| 7c. Pipeline application mobile hybride | R3 | R4 |
| 8. Backup de l'intégralité du workflow et des projets | R3 | R1 |
| Sous-domaine par outil | R3 | R1 |

R4 prend en charge le pipeline du site vitrine : c'est du HTML et du CSS, cela lui revient naturellement, et cela décharge R3 qui porte seul le reste de l'infrastructure.

### Le site du jeu-concours, objectif n°2

| Exigence de l'énoncé | Titulaire | Vérificateur |
|---|---|---|
| 1. Présenter le jeu-concours et les lots | R4 | R2 |
| 2. Inscription via un compte **Google et Facebook** et via un formulaire classique | R3 | R1 |
| 3. Participation via le ou les numéros de ticket | R3 | R1 |
| 4. Historique des gains du client | R3 | R1 |
| 5. Statistiques du back-office : tickets fournis, utilisés, lots gagnés, sexe, âge | R3 | R1 |
| 6. Utilisation des données à des fins d'emailing | R3 | R2 |
| 7. Vue employé boutique : voir les gains, marquer comme remis | R3 | R1 |
| 8. Accessible à tous devices, accessibilité, référencement, RGPD | R4 | R3 |
| Génération des 500 000 codes avec gain déjà associé | R3 | R1 |
| Répartition 60, 20, 10, 6, 4 pour cent garantie et vérifiée | R3 | R1 |
| Tirage au sort côté serveur, sans avantage au nombre de participations | R3 | R1 |
| API communiquant avec la webApp, les caisses et le futur site de vente | R3 | R1 |
| Démarche RSE dans les préconisations techniques | R3 | R2 |

### Les comptes réels à créer, tous portés par R2

Ce sont des livrables concrets, souvent oubliés parce qu'ils ne ressemblent pas à du travail de dossier.

| Élément | Exigence | Échéance interne |
|---|---|---|
| Compte Google Analytics lié au site | Cahier des charges, partie D.6 | 30 septembre |
| Événement, nombre de vues d'une page donnée | idem | 8 novembre |
| Événement, soumission d'un formulaire | idem | 8 novembre |
| Événement, clic sur un CTA | idem | 8 novembre |
| Événement, participation au jeu | idem | 8 novembre |
| Tableau de bord personnalisé et rapport personnalisé | idem | 8 novembre |
| Au moins un réseau social créé, **en privé** | Partie D.4 | 30 septembre |
| Plusieurs publications conformes à la ligne éditoriale | idem | 8 novembre |
| Compte Hootsuite relié aux réseaux | idem | 30 septembre |
| Compte chez un prestataire d'emailing, lié au site | Partie D.5 | 30 septembre |
| Template de mail conforme à la charte et au RGPD | idem | 30 septembre |

R4 fournit à R2 les visuels des publications et le gabarit du mail, à partir de la charte graphique.

### Noms de domaine, contrôlés par R3

| Usage | Forme imposée |
|---|---|
| Workflow | `wk-archi-o25a-15M-G{n}.fr` |
| Sous-domaine par outil | `jenkins.wk-archi-o25a-15M-G{n}.fr` et ainsi de suite |
| Site | `dsp5-archi-o25a-15M-G{n}.fr` |

Le copyright et les mentions légales doivent porter la mention de projet étudiant fictif. R1 le vérifie.

## 7. Semaine du 16 novembre : évaluation du site et du workflow

| Tâche | Titulaire |
|---|---|
| Démonstration du workflow, du commit au déploiement | R3 |
| Démonstration du site, parcours joueur, employé, administrateur | R1 |
| Démonstration du dispositif de communication | R2 |
| Réponse sur l'accessibilité et le responsive | R4 |
| Relevé écrit des remarques | R1 |

## 8. Rendu du 14 décembre, 9h : archive

Archive `ESTD ARCHI {classe} – G{n} – Archive projet de fin d'année`, assemblée par R1, vérifiée par R3.

| Fichier attendu | Producteur |
|---|---|
| `Cahier des charges.pdf`, version 1 | R1 |
| `Cahier des spécifications techniques.pdf`, version 1 | R1 |
| `Cahier des charges V2.pdf`, remarques intégrées | R1 |
| `Cahier des spécifications techniques V2.pdf` | R3 |
| `Support de présentation.pptx` ou `.pdf` | R4 |
| `Code source site internet` | R3 |
| `bdd`, export de la base | R3 |
| `Accès site internet - workflow et comptes divers.pdf` | R1 |
| `Accès organisation projet.pdf` | R1 |

Point de vigilance : le nom de chaque fichier est noté. R3 relit la liste caractère par caractère avant le dépôt, en particulier le tiret demi-cadratin qui sépare les segments.

## 9. Semaine du 14 décembre : soutenance

15 à 20 minutes de présentation collective, puis environ 15 minutes d'entretien individuel par personne.

### Découpage proposé de la présentation

| Séquence | Durée | Intervenant |
|---|---|---|
| Contexte, agence, problématique, méthode | 3 min | R1 |
| Le workflow, architecture et démonstration | 5 min | R3 |
| Le client, marché, cibles, stratégie | 4 min | R2 |
| L'identité visuelle et le site | 4 min | R4 |
| Chiffrage, rentabilité, bilan | 2 min | R1 |
| Errata éventuel | 1 min | R1 |

### Préparation des entretiens individuels

Chacun est interrogé sur **l'ensemble** des deux dossiers, pas sur sa partie. Deux sessions de questions croisées sont planifiées, les 8 et 12 décembre : chaque personne interroge les trois autres sur son propre périmètre.

## 10. Suivi du projet, obligation permanente

L'outil de gestion, Trello ou Notion, doit être en **accès public** et tenu à jour du début à la fin. R1 en est responsable.

| Élément imposé | Traitement |
|---|---|
| Trois colonnes : à faire, en cours, terminé | Structure du tableau |
| Responsable par tâche | Champ obligatoire, R1, R2, R3 ou R4 |
| Deadline par tâche | Champ obligatoire |
| Étiquette par tâche | La partie de projet concernée |
| Réunions à venir et passées | Une carte par réunion |
| Comptes rendus de réunion | Modèle dans `01-pilotage/templates/` |

Le compte rendu doit comporter le titre, la date et l'heure, le lieu, la liste des participants invités, présents et absents, l'ordre du jour, les discussions et décisions, la ou les prochaines réunions, et le nom de la personne qui l'a rédigé et transmis.

**Rythme retenu.** Une réunion d'équipe hebdomadaire, le lundi. Un comité de pilotage à chaque jalon. Le compte rendu est rédigé le jour même, par un rédacteur tournant.

## 11. Écarts relevés entre l'énoncé et le travail déjà produit

Relevé effectué le 16 août 2026, après relecture intégrale des cinq documents du sujet.

| Écart | Correction apportée |
|---|---|
| Les connexions tierces avaient été mises sur Google et Apple | Rétabli sur **Google et Facebook**, conformément à l'objectif n°2 point 2. Corrigé dans le code, les mocks, le schéma Prisma, les CGU, le back-office et les deux dossiers |
| Le mix marketing, exigé par l'expression de besoin, était absent | Ajouté en ouverture de la partie D du cahier des charges, avec la mention qu'il ne figure pas dans la trame imposée |
| Le mode de planification ASAP du Gantt n'était pas mentionné | Ajouté dans les deux dossiers et dans les deux checklists |
| Le sujet impose de traiter le CST avant le CDC | Vérifié, le planning de la phase 2 respecte cette dépendance |
| Deux présentations PowerPoint sont demandées, une par objectif | Un seul support couvrant les deux objectifs, structuré en deux temps. À valider avec le formateur |

## 12. Contrôle final avant chaque dépôt

Cette liste est passée par R1, contresignée par un second membre, avant tout dépôt sur Teams.

- [ ] Le nom du fichier respecte `ESTD ARCHI {classe} – G{n} – {Document}`, tiret demi-cadratin compris
- [ ] Le format est A4 portrait, la pagination est en 1/100
- [ ] Le sommaire suit l'ordre exact de la trame imposée
- [ ] Chaque préconisation est justifiée et quantifiée
- [ ] Chaque chiffre est sourcé, avec une source de moins de cinq ans
- [ ] Aucun copier-coller du sujet, tout est reformulé
- [ ] Les mentions juridiques figurent en pied de page de la couverture
- [ ] Le dépôt est fait avant 9h, pas à 8h55
- [ ] Une capture de la confirmation de dépôt est archivée
