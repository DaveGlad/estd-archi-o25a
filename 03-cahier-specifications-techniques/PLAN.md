# Cahier des spécifications techniques Furious Ducks : checklist de conformité

> Source : `00-sujet/0. Sujet/2. STRUCTURE Cahier des specifications techniques ESTD - Archi web.pdf` (5 p.)
> Ce dossier parle de **l'agence**, pas du client. Format A4 portrait, pagination **1/100**, préconisations **justifiées et quantifiées**.

## Page de couverture
- [ ] Mention « Cahier des spécifications techniques » + **nom de l'agence**
- [ ] Date de début de projet + numéro de version
- [ ] Rédacteurs
- [ ] Mentions juridiques de l'agence en pied de page

## Sommaire
- [ ] Complet, dans l'ordre du plan ci-dessous

---

## A. État des lieux
- [ ] **1. Présentation de l'agence** : storytelling (pas de copier-coller) + infos juridiques : dénomination, siège, statut, capital, RCS, SIREN, SIRET, APE/NAF, TVA intracom
- [ ] **2. Présentation de la problématique**, telle qu'exprimée par **Mr Guido Brasletti**, étoffée avec les problématiques classiques d'agence : absence de versioning, absence de backups, procédures inexistantes, environnements non reproductibles, silos dev/ops, régressions non détectées…
- [ ] Livrables attendus pour répondre à la problématique
- [ ] **3. Méthodologie de projet actuelle** : le **cycle en V**, ses limites concrètes pour l'organisation et l'avancée des projets

## B. Méthodologie de projet à venir
- [ ] Méthodologie préconisée (**Scrum / Kanban / XP**) et **justification**
- [ ] Fonctionnement bref (pas un cours), avantages et inconvénients
- [ ] Mise en place concrète chez Furious Ducks (45 employés)
- [ ] Outils associés
- [ ] Articulation avec le workflow d'intégration continue

## C. Introduction au mouvement DevOps et DevSecOps
- [ ] Définitions, usages, avantages
- [ ] **Topologies d'équipe** DevOps retenues pour l'agence + **leurs évolutions** dans le temps
- [ ] Justification par rapport à la taille et à l'organisation de l'agence

## D. Analyse du workflow CI/CD
### 1. Présentation Workflow CI/CD
- [ ] Définitions **succinctes** de l'intégration continue et du déploiement continu
- [ ] **Contraintes** du workflow (celles du sujet + celles de l'agence)
- [ ] **Liste des tâches à automatiser**, justifiées et recontextualisées pour l'agence

### 2. Choix techniques
Présenter et **justifier** chaque service :
- [ ] **Reverse proxy** (+ TLS, sous-domaine par outil)
- [ ] **SCM** Git (GitLab CE ou Gitea) et le standard **GitFlow**
- [ ] **Serveur CI : Jenkins** (imposé) + agents
- [ ] **Registry** d'images Docker
- [ ] **Tests / QA**
- [ ] **Métriques** (Prometheus, Traefik, Kibana, Grafana…)
- [ ] **Backups**
- [ ] Bonnes pratiques / standards liés à chaque service (conventions de commit, branches protégées, revue de code, politique de tags…)
- [ ] Contrainte **open source** (ou au pire libre) respectée et argumentée

### 3. Hébergement et backups
- [ ] Préconisations d'hébergement : **CPU, RAM, disques, bande passante, SLA, GTR**
- [ ] Politique de **backups** : périmètre, fréquence, rétention, externalisation, chiffrement
- [ ] Procédure et **test de restauration**

## E. Diagramme d'infrastructure complet du workflow
- [ ] Tous les services du workflow représentés
- [ ] **Ports** indiqués
- [ ] **Protocoles de communication** indiqués
- [ ] Réseaux Docker, environnements dev / preprod-QA / prod, flux entrants et sortants

## F. Gestion des ressources humaines
- [ ] **1. Recrutement**, fiche de poste : profil recherché, qualifications, missions
- [ ] Conseil sur le **contrat de travail** : CDI ou CDD, nombre d'heures, **grille de salaire**
- [ ] **2. Formation** : plan de formation du nouveau membre pour une prise en main rapide du workflow et des méthodologies (contenu, durée, format, coût)

## G. Procédures (diagrammes **BPMN**)
- [ ] Un ou plusieurs **diagrammes d'activité**
- [ ] Processus de **déploiement dev**
- [ ] Processus de **déploiement preprod**
- [ ] Processus de **déploiement prod**
- [ ] Procédure de **sauvegarde** du workflow **pour la prod**
- [ ] Procédure de **restauration** pour **dev**, **preprod** **et** **prod**
- [ ] Procédures rédigées **à destination des utilisateurs** (mode opératoire exploitable)

## H. Diagramme de Gantt
- [ ] Sous **MS Project ou GanttProject** uniquement, planification **en mode ASAP**
- [ ] Du brief à la livraison, tâches **par lots**
- [ ] Ressources avec **taux horaires** (charges patronales + salariales + marge agence)
- [ ] **Jalons**, **prédécesseurs**, **% d'achèvement**
- [ ] **Listing des tâches + timeline** ET **diagramme des ressources**
- [ ] Devis principal déduit des coûts par lot

## I. Estimation des coûts et rentabilité
- [ ] Coût de **mise en place** du workflow (serveurs, humains, licences)
- [ ] Coût de **maintenance** récurrent
- [ ] **Rentabilité** : comparaison chiffrée avec la même organisation **sans** workflow (temps gagné, régressions évitées, coût d'une panne, ROI, point mort)

## Annexes
- [ ] **Calcul du TJM des ressources** : base de calcul et tous les calculs détaillés
- [ ] Documents et études complémentaires

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
- [ ] Pagination 1/100, A4 portrait, sommaire à jour
- [ ] Chaque choix technique est justifié et chiffré
- [ ] Nom du fichier : `ESTD ARCHI {classe} – G{n} – Cahier des spécifications techniques.pdf`
