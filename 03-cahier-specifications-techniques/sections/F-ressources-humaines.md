# F. Gestion des ressources humaines

Mr Brasletti souhaite recruter quelqu'un pour la partie technique et la maintenance du workflow, et demande une proposition de formation permettant sa prise en main rapide. Cette partie répond aux deux points.

## F.1 Recrutement

### Pourquoi ce poste existe

Le workflow décrit dans ce dossier n'est pas un projet qui se termine. Une fois en place, il doit être surveillé, mis à jour, sauvegardé, restauré quand il le faut, et étendu à mesure que de nouveaux projets clients entrent dans le portefeuille. Confier cette charge à un développeur déjà affecté à un projet reviendrait à ce qu'elle passe systématiquement après les urgences client, ce qui est exactement la situation qui a produit les dysfonctionnements décrits en partie A.

Ce poste est aussi le premier membre de l'équipe plateforme définie en C.3. Son recrutement conditionne donc l'évolution de la topologie, pas seulement la maintenance de l'outil.

### Fiche de poste

**Intitulé** : Ingénieur DevOps, en charge de la plateforme de production

**Rattachement** : direction technique, sous la responsabilité de Guido Brasletti

**Lieu** : siège de l'agence, télétravail partiel possible

#### Missions principales

| Domaine | Missions |
|---|---|
| Exploitation | Maintenir le workflow en conditions opérationnelles, surveiller les métriques et les alertes, traiter les incidents dans les délais de la GTR |
| Fiabilité | Garantir l'exécution des sauvegardes, réaliser et documenter le test de restauration mensuel |
| Évolution | Intégrer les nouveaux projets clients au workflow, faire évoluer les pipelines, maintenir les images de base à jour |
| Sécurité | Appliquer les pratiques DevSecOps décrites en C.2, traiter les vulnérabilités remontées par les scans, gérer les accès et les secrets |
| Accompagnement | Aider les équipes projet à écrire leurs Jenkinsfile, rédiger et tenir à jour les procédures de la partie G |
| Amélioration continue | Suivre les indicateurs de C.1 et proposer les actions correctives |

#### Compétences techniques attendues

| Compétence | Niveau requis |
|---|---|
| Linux en administration serveur | Maîtrise |
| Docker et orchestration par compose | Maîtrise |
| Jenkins, écriture de pipelines déclaratifs | Maîtrise |
| Git et modèles de branches, dont GitFlow | Maîtrise |
| Reverse proxy, TLS, DNS | Bon niveau |
| Prometheus, Grafana, agrégation de logs | Bon niveau |
| Sauvegarde, restauration, gestion des volumes | Bon niveau |
| Scripting shell et un langage d'automatisation | Bon niveau |
| PostgreSQL en exploitation, sauvegarde et rejeu de journal | Notions solides |
| Sécurité applicative, analyse de dépendances, gestion de secrets | Notions solides |

#### Compétences non techniques

La dimension d'accompagnement est au moins aussi importante que la technique. Une plateforme que personne ne sait utiliser ne sert à rien, et le risque identifié en C.3 est justement que l'équipe plateforme redevienne un silo. Sont donc attendus : le goût de la transmission, la capacité à rédiger une procédure lisible par un non-spécialiste, l'autonomie, et la rigueur dans la consignation des incidents.

#### Profil recherché

Trois à cinq ans d'expérience sur un poste équivalent. Une formation d'ingénieur ou un niveau bac+5 en informatique constitue le profil type, mais un parcours de développeur ayant basculé vers l'exploitation convient tout aussi bien, et correspond même mieux à la culture de l'agence.

Une expérience en agence ou en ESN est un plus réel : le contexte multi-projets et multi-clients ne ressemble pas à celui d'un éditeur, et cela s'apprend surtout sur le terrain.

Une appétence pour l'open source est indispensable. C'est le positionnement de l'agence depuis 2007, et l'ensemble du workflow repose dessus.

### Conseil sur le contrat de travail

#### Type de contrat

Un **CDI** s'impose, pour une raison simple : le besoin est permanent. Un CDD ne se justifierait que pour un projet borné dans le temps, or la maintenance du workflow n'a pas de terme. Recruter en CDD produirait en plus un effet pervers, celui de voir partir la seule personne qui connaît la plateforme au bout de dix-huit mois, sans transmission organisée.

#### Statut et temps de travail

| Élément | Recommandation |
|---|---|
| Convention collective | Syntec, applicable aux entreprises du numérique |
| Statut | Cadre, position et coefficient à définir selon la grille de la convention |
| Temps de travail | 35 heures, ou forfait annuel en jours si l'organisation de l'agence le pratique déjà |
| Astreinte | Non nécessaire au démarrage, voir ci-dessous |
| Période d'essai | 4 mois, renouvelable une fois, durée usuelle pour un cadre |

La question de l'astreinte mérite d'être tranchée explicitement plutôt que laissée dans le flou. La GTR retenue en D.3 est de quatre heures **ouvrées**, ce qui n'impose aucune intervention de nuit ni de week-end. Une astreinte n'est donc pas justifiée au démarrage. Si l'agence souhaitait plus tard proposer à ses clients une GTR étendue, il faudrait alors mettre en place une astreinte formalisée et rémunérée, et surtout ne pas la faire reposer sur une seule personne. Ce point est à réexaminer quand l'équipe plateforme comptera deux personnes.

#### Grille de salaire

> Les fourchettes ci-dessous sont indicatives et doivent être confirmées dans le dossier par une source citée, par exemple une étude de rémunération sectorielle récente ou la grille de la convention Syntec. Le cahier des charges exige que toute donnée chiffrée soit sourcée et datée de moins de cinq ans.

| Niveau | Expérience | Fourchette brute annuelle | Commentaire |
|---|---|---|---|
| Junior | 0 à 2 ans | à confirmer | Écarté ici, le poste est seul sur son périmètre |
| Confirmé | 3 à 5 ans | à confirmer | **Cible du recrutement** |
| Senior | 6 ans et plus | à confirmer | À envisager si l'agence veut aussi un rôle de référent technique transverse |

Le coût employeur se calcule en ajoutant les charges patronales au salaire brut. Le détail du calcul figure dans l'annexe consacrée au TJM des ressources, avec le taux retenu et sa source. C'est ce coût complet, et non le salaire brut, qui alimente l'estimation de rentabilité de la partie I.

#### Recrutement en pratique

| Étape | Contenu |
|---|---|
| Diffusion | Canaux spécialisés et communautés open source, plus cooptation interne |
| Présélection | Analyse des candidatures sur les compétences du tableau ci-dessus |
| Entretien technique | Étude de cas sur un pipeline réel, plutôt qu'un questionnaire théorique |
| Entretien avec la direction | Adéquation avec la culture de l'agence et la dimension d'accompagnement |
| Décision | Sous deux semaines après le dernier entretien |

L'étude de cas est volontairement construite à partir d'une situation vécue par l'agence, par exemple ajouter un projet au workflow ou diagnostiquer un build rouge. Elle donne une image bien plus juste qu'un entretien théorique, et elle donne aussi au candidat une idée réaliste du poste.

## F.2 Formation

### Intégration du nouvel arrivant

L'objectif est qu'il soit autonome sur le workflow en un mois, et capable de le faire évoluer seul au bout de trois.

| Période | Contenu | Résultat attendu |
|---|---|---|
| Jour 1 | Accès, comptes nominatifs, clés SSH, présentation de l'agence et du portefeuille de projets | Environnement de travail opérationnel |
| Semaine 1 | Lecture guidée de ce dossier, visite de l'infrastructure service par service, observation d'un déploiement complet | Comprend l'architecture et sait la restituer |
| Semaine 2 | Exécution accompagnée des procédures de la partie G, dont un déploiement en développement et une restauration en préproduction | Sait exécuter les procédures existantes |
| Semaine 3 | Prise en charge d'un incident réel en binôme, ajout d'un projet simple au workflow | Autonome sur l'exploitation courante |
| Semaine 4 | Réalisation seul du test de restauration mensuel, chronométré et consigné | Autonome sur la fiabilité |
| Mois 2 et 3 | Modification d'un pipeline, mise à jour d'une brique du workflow, accompagnement d'une équipe projet | Capable de faire évoluer la plateforme |

Le test de restauration en semaine 4 n'est pas un exercice symbolique. C'est la procédure la plus critique et la moins fréquemment exécutée, donc celle où la compétence se perd le plus vite. La faire réaliser tôt, et seul, valide à la fois la compétence de la personne et la qualité de la documentation.

### Supports de formation

| Support | Contenu | Qui le maintient |
|---|---|---|
| Ce cahier des spécifications techniques | Architecture, choix techniques, procédures | Équipe plateforme |
| Fiches de mode opératoire de G.7 | Gestes du quotidien, par profil | Équipe plateforme |
| Journal des incidents | Historique des pannes, causes et résolutions | Toute l'équipe |
| Dépôts de démonstration | Trois exemples de Jenkinsfile commentés | Équipe plateforme |
| Tableaux de bord Grafana | Documentation vivante du comportement normal | Équipe plateforme |

Ces supports existent déjà, ils sont produits par le projet lui-même. La formation ne demande donc pas de créer un dispositif à part, ce qui limite son coût et garantit surtout qu'elle ne se périmera pas, puisque les supports sont ceux que l'équipe utilise tous les jours.

### Formation des équipes existantes

Le recrutement ne suffit pas. Les 45 collaborateurs doivent eux aussi savoir se servir du workflow, sans quoi la topologie plateforme dérivera vers le silo que nous cherchons à éviter.

| Public | Format | Durée | Contenu |
|---|---|---|---|
| Développeurs | Atelier pratique en petits groupes | Une demi-journée | Fiches 1 et 2 de G.7 : livrer une fonctionnalité, modifier son Jenkinsfile |
| Chefs de projet | Atelier | 2 heures | Fiche 3 : valider une mise en production, lire les tableaux de bord |
| Toute l'équipe | Présentation générale | 1 heure | Vue d'ensemble, à quoi sert le workflow et ce qu'il change au quotidien |
| Nouveaux arrivants | Intégration au parcours d'accueil de l'agence | 2 heures | Version condensée de la semaine 1 |

Les ateliers développeurs se tiennent par groupes de six à huit personnes, sur un projet réel plutôt que sur un exemple factice. Sept sessions suffisent à couvrir l'ensemble des équipes.

### Budget de formation

| Poste | Base de calcul |
|---|---|
| Intégration du nouvel arrivant | 1 mois de montée en compétence, plus le temps d'accompagnement par l'équipe plateforme |
| Ateliers développeurs | 7 sessions d'une demi-journée, animation comprise |
| Ateliers chefs de projet et présentation générale | À chiffrer selon l'effectif concerné |
| Mise à jour continue des supports | Intégrée aux missions du poste, sans coût additionnel |

Le chiffrage détaillé s'appuie sur le TJM des ressources et figure dans le Gantt de la partie H, puis dans l'estimation de la partie I. La formation représente un coût visible et ponctuel, à comparer au coût invisible et permanent d'une équipe qui contourne un outil qu'elle ne maîtrise pas.
