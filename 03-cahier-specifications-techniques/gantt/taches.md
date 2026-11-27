| Réf. | Tâche | Durée | Début | Fin | Ressource | Prédécesseur | Avanc. |
|---|---|---|---|---|---|---|---|
| **A** | **Cadrage et audit de l'existant** | **7 j** | | | | | |
| A.1 | Entretiens avec les équipes, recensement des pratiques | 2 j | 01/09 | 02/09 | Ingénieur DevOps |  | 100 % |
| A.2 | Inventaire des projets et de leurs contraintes | 2 j | 03/09 | 04/09 | Ingénieur DevOps | A.1 | 100 % |
| A.3 | Choix des briques et validation en comité | 3 j | 07/09 | 09/09 | Chef de projet | A.2 | 100 % |
| **B** | **Socle serveur et Docker** | **6 j** | | | | | |
| B.1 | Commande du serveur et des noms de domaine | 1 j | 10/09 | 10/09 | Ingénieur DevOps | A.3 | 100 % |
| B.2 | Installation, durcissement, filtrage réseau | 2 j | 11/09 | 14/09 | Ingénieur DevOps | B.1 | 100 % |
| B.3 | Docker, réseaux cloisonnés, volumes | 1 j | 15/09 | 15/09 | Ingénieur DevOps | B.2 | 100 % |
| B.4 | Reverse proxy, certificats, sous-domaines | 2 j | 16/09 | 17/09 | Ingénieur DevOps | B.3 | 100 % |
| **C** | **SCM et conventions Git** | **6 j** | | | | | |
| C.1 | Installation du SCM et des comptes | 2 j | 18/09 | 21/09 | Ingénieur DevOps | B.4 | 100 % |
| C.2 | Modèle de branches et protections | 2 j | 22/09 | 23/09 | Ingénieur DevOps | C.1 | 100 % |
| C.3 | Migration des dépôts existants | 2 j | 24/09 | 25/09 | Développeur | C.2 | 100 % |
| **D** | **Jenkins, agents et registry** | **8 j** | | | | | |
| D.1 | Installation de Jenkins et raccordement au SCM | 2 j | 24/09 | 25/09 | Ingénieur DevOps | C.2 | 100 % |
| D.2 | Agents conteneurisés et jetables | 3 j | 28/09 | 30/09 | Ingénieur DevOps | D.1 | 100 % |
| D.3 | Registry privé et politique de tags | 2 j | 01/10 | 02/10 | Ingénieur DevOps | D.2 | 100 % |
| D.4 | Premier pipeline de bout en bout | 1 j | 05/10 | 05/10 | Ingénieur DevOps | D.3 | 100 % |
| **E** | **Pipelines des trois types de projets** | **15 j** | | | | | |
| E.1 | Pipeline site vitrine, minification et compression | 3 j | 06/10 | 08/10 | Ingénieur DevOps | D.4 | 100 % |
| E.2 | Pipeline site administrable, tests et migrations | 4 j | 06/10 | 09/10 | Ingénieur DevOps | D.4 | 100 % |
| E.3 | Pipeline application mobile hybride | 3 j | 06/10 | 08/10 | Ingénieur DevOps | D.4 | 100 % |
| E.4 | Jenkinsfile de référence et documentation | 2 j | 12/10 | 13/10 | Développeur | E.1, E.2, E.3 | 100 % |
| E.5 | Intégration des contrôles de sécurité | 3 j | 12/10 | 14/10 | Développeur | E.2 | 100 % |
| **F** | **Environnements dev, préproduction, production** | **8 j** | | | | | |
| F.1 | Environnement de développement et déploiement automatique | 2 j | 12/10 | 13/10 | Ingénieur DevOps | E.2 | 100 % |
| F.2 | Environnement de préproduction et anonymisation | 3 j | 14/10 | 16/10 | Ingénieur DevOps | F.1 | 100 % |
| F.3 | Environnement de production et validation humaine | 3 j | 19/10 | 21/10 | Ingénieur DevOps | F.2 | 100 % |
| **G** | **Métriques et alertes** | **5 j** | | | | | |
| G.1 | Collecte des métriques système et conteneurs | 2 j | 22/10 | 23/10 | Ingénieur DevOps | F.3 | 100 % |
| G.2 | Tableaux de bord et indicateurs de pilotage | 2 j | 26/10 | 27/10 | Ingénieur DevOps | G.1 | 100 % |
| G.3 | Règles d'alerte et canaux de notification | 1 j | 28/10 | 28/10 | Ingénieur DevOps | G.2 | 100 % |
| **H** | **Sauvegardes et restauration** | **6 j** | | | | | |
| H.1 | Sauvegardes automatisées et externalisation chiffrée | 3 j | 22/10 | 26/10 | Ingénieur DevOps | F.3 | 100 % |
| H.2 | Procédures de restauration des trois environnements | 2 j | 27/10 | 28/10 | Ingénieur DevOps | H.1 | 100 % |
| H.3 | Test de restauration réel, chronométré et consigné | 1 j | 29/10 | 29/10 | Ingénieur DevOps | H.2 | 100 % |
| **I** | **Documentation et procédures** | **6 j** | | | | | |
| I.1 | Diagramme d'infrastructure et procédures BPMN | 2 j | 30/10 | 02/11 | Ingénieur DevOps | H.3 | 100 % |
| I.2 | Fiches de mode opératoire par profil | 2 j | 03/11 | 04/11 | Ingénieur DevOps | I.1 | 60 % |
| I.3 | Relecture et validation | 2 j | 05/11 | 06/11 | Chef de projet | I.2 | 0 % |
| **J** | **Formation des équipes** | **7 j** | | | | | |
| J.1 | Préparation des supports et des ateliers | 2 j | 09/11 | 10/11 | Ingénieur DevOps | I.3 | 0 % |
| J.2 | Ateliers développeurs, sept sessions | 3 j | 11/11 | 13/11 | Ingénieur DevOps | J.1 | 0 % |
| J.3 | Ateliers chefs de projet et présentation générale | 2 j | 11/11 | 12/11 | Chef de projet | J.1 | 0 % |
