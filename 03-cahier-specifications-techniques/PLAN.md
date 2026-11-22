# Cahier des spécifications techniques Furious Ducks : checklist de conformité

> Source : `00-sujet/0. Sujet/2. STRUCTURE Cahier des specifications techniques ESTD - Archi web.pdf` (5 p.)
> Ce dossier parle de **l'agence**, pas du client. Format A4 portrait, pagination **1/100**, préconisations **justifiées et quantifiées**.

## Page de couverture
- [x] Mention « Cahier des spécifications techniques » + **nom de l'agence**
- [x] Date de début de projet + numéro de version
- [x] Rédacteurs
- [x] Mentions juridiques de l'agence en pied de page

## Sommaire
- [x] Complet, dans l'ordre du plan ci-dessous

---

## A. État des lieux
- [x] **1. Présentation de l'agence** : storytelling (pas de copier-coller) + infos juridiques : dénomination, siège, statut, capital, RCS, SIREN, SIRET, APE/NAF, TVA intracom
- [x] **2. Présentation de la problématique**, telle qu'exprimée par **Mr Guido Brasletti**, étoffée avec les problématiques classiques d'agence : absence de versioning, absence de backups, procédures inexistantes, environnements non reproductibles, silos dev/ops, régressions non détectées…
- [x] Livrables attendus pour répondre à la problématique
- [x] **3. Méthodologie de projet actuelle** : le **cycle en V**, ses limites concrètes pour l'organisation et l'avancée des projets

## B. Méthodologie de projet à venir
- [x] Méthodologie préconisée (**Scrum / Kanban / XP**) et **justification**
- [x] Fonctionnement bref (pas un cours), avantages et inconvénients
- [x] Mise en place concrète chez Furious Ducks (45 employés)
- [x] Outils associés
- [x] Articulation avec le workflow d'intégration continue

## C. Introduction au mouvement DevOps et DevSecOps
- [x] Définitions, usages, avantages
- [x] **Topologies d'équipe** DevOps retenues pour l'agence + **leurs évolutions** dans le temps
- [x] Justification par rapport à la taille et à l'organisation de l'agence

## D. Analyse du workflow CI/CD
### 1. Présentation Workflow CI/CD
- [x] Définitions **succinctes** de l'intégration continue et du déploiement continu
- [x] **Contraintes** du workflow (celles du sujet + celles de l'agence)
- [x] **Liste des tâches à automatiser**, justifiées et recontextualisées pour l'agence

### 2. Choix techniques
Présenter et **justifier** chaque service :
- [x] **Reverse proxy** (+ TLS, sous-domaine par outil)
- [x] **SCM** Git (GitLab CE ou Gitea) et le standard **GitFlow**
- [x] **Serveur CI : Jenkins** (imposé) + agents
- [x] **Registry** d'images Docker
- [x] **Tests / QA**
- [x] **Métriques** (Prometheus, Traefik, Kibana, Grafana…)
- [x] **Backups**
- [x] Bonnes pratiques / standards liés à chaque service (conventions de commit, branches protégées, revue de code, politique de tags…)
- [x] Contrainte **open source** (ou au pire libre) respectée et argumentée

### 3. Hébergement et backups
- [x] Préconisations d'hébergement : **CPU, RAM, disques, bande passante, SLA, GTR**
- [x] Politique de **backups** : périmètre, fréquence, rétention, externalisation, chiffrement
- [x] Procédure et **test de restauration**

## E. Diagramme d'infrastructure complet du workflow
- [x] Tous les services du workflow représentés
- [x] **Ports** indiqués
- [x] **Protocoles de communication** indiqués
- [x] Réseaux Docker, environnements dev / preprod-QA / prod, flux entrants et sortants

## F. Gestion des ressources humaines
- [x] **1. Recrutement**, fiche de poste : profil recherché, qualifications, missions
- [x] Conseil sur le **contrat de travail** : CDI ou CDD, nombre d'heures, **grille de salaire**
- [x] **2. Formation** : plan de formation du nouveau membre pour une prise en main rapide du workflow et des méthodologies (contenu, durée, format, coût)

## G. Procédures (diagrammes **BPMN**)
- [x] Un ou plusieurs **diagrammes d'activité**
- [x] Processus de **déploiement dev**
- [x] Processus de **déploiement preprod**
- [x] Processus de **déploiement prod**
- [x] Procédure de **sauvegarde** du workflow **pour la prod**
- [x] Procédure de **restauration** pour **dev**, **preprod** **et** **prod**
- [x] Procédures rédigées **à destination des utilisateurs** (mode opératoire exploitable)

## H. Diagramme de Gantt
- [x] Sous **MS Project ou GanttProject** uniquement, planification **en mode ASAP**
- [x] Du brief à la livraison, tâches **par lots**
- [x] Ressources avec **taux horaires** (charges patronales + salariales + marge agence)
- [x] **Jalons**, **prédécesseurs**, **% d'achèvement**
- [x] **Listing des tâches + timeline** ET **diagramme des ressources**
- [x] Devis principal déduit des coûts par lot

## I. Estimation des coûts et rentabilité
- [x] Coût de **mise en place** du workflow (serveurs, humains, licences)
- [x] Coût de **maintenance** récurrent
- [x] **Rentabilité** : comparaison chiffrée avec la même organisation **sans** workflow (temps gagné, régressions évitées, coût d'une panne, ROI, point mort)

## Annexes
- [x] **Calcul du TJM des ressources** : base de calcul et tous les calculs détaillés
- [x] Documents et études complémentaires

---

## Les 8 exigences du sujet : traçabilité
| # | Exigence | Traitée en |
|---|---|---|
| 1 | Hébergé sur dédié ou cloud, **Linux** | D.2 / D.3 |
| 2 | **Entièrement basé sur Docker** (workflow **et** serveurs gérés) | D.2 / E |
| 3 | Contient : Jenkins · SCM Git · tests applicatifs · backups automatisés · métriques | D.2 |
| 4 | La CI : optimisation des assets · déploiement dev auto · stockage des images · déploiement preprod auto · déploiement prod · tests unitaires/fonctionnels · envoi/stockage des rapports | D.1 / G |
| 5 | Config modifiable par les devs **sans accès au CI** (**Jenkinsfile**) | D.2 |
| 6 | Applications **open source** (ou libres au pire) | D.2 |
| 7 | S'adapte à 3 types de projets : vitrine HTML/CSS · site administrable PHP/NodeJS/Python/Ruby · app mobile hybride/Java/Swift | D.1 / G |
| 8 | **Backup de l'intégralité** du workflow et des projets gérés | D.3 / G |

## Contrôle final avant export
- [x] Pagination 1/100, A4 portrait, sommaire à jour

> Le format et la pagination sont imposés par `assembler.py`, pas réglés à la main : A4 portrait 210 x 297 mm, marges de 20 mm, et un pied de page qui porte les champs Word `PAGE` et `NUMPAGES` plutôt qu'un texte figé, de sorte que la numérotation se recalcule à chaque modification. Le sommaire est généré depuis les fichiers de section, il ne peut donc pas annoncer un dossier différent de celui qui suit.
- [x] Chaque choix technique est justifié et chiffré
- [x] Nom du fichier : `ESTD ARCHI {classe} – G{n} – Cahier des spécifications techniques.pdf`
