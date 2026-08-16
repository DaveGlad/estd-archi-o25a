# H. Diagramme de Gantt

> Le diagramme doit être saisi sous GanttProject ou MS Project, aucun autre outil n'étant accepté. Cette section fournit la structure à saisir. Le fichier produit est exporté en image pour le dossier, avec la timeline et le diagramme des ressources.
>
> Le calcul du taux journalier moyen figure en annexe des deux dossiers.

## H.1 Périmètre

Ce Gantt couvre la mise en place du workflow d'intégration continue chez Furious Ducks, du cadrage à la formation des équipes. Il est distinct du Gantt du projet client Thé Tip Top, qui figure dans le cahier des charges.

Les deux plannings se recoupent sur un point : le workflow doit être opérationnel avant le début du développement du site du jeu-concours, puisque ce projet est celui qui doit l'éprouver.

## H.2 Structure en lots

| Lot | Intitulé | Charge | Coût |
|---|---|---|---|
| A | Cadrage et audit de l'existant | 7 j | 3 955 € |
| B | Socle serveur et Docker | 6 j | 3 390 € |
| C | SCM et conventions Git | 6 j | 3 320 € |
| D | Jenkins, agents et registry | 8 j | 4 520 € |
| E | Pipelines des trois types de projets | 15 j | 8 300 € |
| F | Environnements dev, préproduction, production | 8 j | 4 520 € |
| G | Métriques et alertes | 5 j | 2 825 € |
| H | Sauvegardes et restauration | 6 j | 3 390 € |
| I | Documentation et procédures | 6 j | 3 390 € |
| J | Formation des équipes | 7 j | 3 955 € |
| | **Total** | **74 j** | **41 565 €** |

## H.3 Détail des tâches

Les durées sont exprimées en jours-ressource.

| Réf. | Tâche | Durée | Ressource | Prédécesseur |
|---|---|---|---|---|
| **A** | **Cadrage et audit de l'existant** | **7 j** | | |
| A.1 | Entretiens avec les équipes, recensement des pratiques | 2 j | DevOps | |
| A.2 | Inventaire des projets et de leurs contraintes | 2 j | DevOps | A.1 |
| A.3 | Choix des briques et validation en comité | 3 j | Chef de projet | A.2 |
| **B** | **Socle serveur et Docker** | **6 j** | | |
| B.1 | Commande du serveur et des noms de domaine | 1 j | DevOps | A.3 |
| B.2 | Installation, durcissement, filtrage réseau | 2 j | DevOps | B.1 |
| B.3 | Docker, réseaux cloisonnés, volumes | 1 j | DevOps | B.2 |
| B.4 | Reverse proxy, certificats, sous-domaines | 2 j | DevOps | B.3 |
| **C** | **SCM et conventions Git** | **6 j** | | |
| C.1 | Installation du SCM et des comptes | 2 j | DevOps | B.4 |
| C.2 | Modèle de branches et protections | 2 j | DevOps | C.1 |
| C.3 | Migration des dépôts existants | 2 j | Développeur | C.2 |
| **D** | **Jenkins, agents et registry** | **8 j** | | |
| D.1 | Installation de Jenkins et raccordement au SCM | 2 j | DevOps | C.2 |
| D.2 | Agents conteneurisés et jetables | 3 j | DevOps | D.1 |
| D.3 | Registry privé et politique de tags | 2 j | DevOps | D.2 |
| D.4 | Premier pipeline de bout en bout | 1 j | DevOps | D.3 |
| **E** | **Pipelines des trois types de projets** | **15 j** | | |
| E.1 | Pipeline site vitrine, minification et compression | 3 j | DevOps | D.4 |
| E.2 | Pipeline site administrable, tests et migrations | 4 j | DevOps | D.4 |
| E.3 | Pipeline application mobile hybride | 3 j | DevOps | D.4 |
| E.4 | Jenkinsfile de référence et documentation | 2 j | Développeur | E.1, E.2, E.3 |
| E.5 | Intégration des contrôles de sécurité | 3 j | Développeur | E.2 |
| **F** | **Environnements dev, préproduction, production** | **8 j** | | |
| F.1 | Environnement de développement et déploiement automatique | 2 j | DevOps | E.2 |
| F.2 | Environnement de préproduction et anonymisation | 3 j | DevOps | F.1 |
| F.3 | Environnement de production et validation humaine | 3 j | DevOps | F.2 |
| **G** | **Métriques et alertes** | **5 j** | | |
| G.1 | Collecte des métriques système et conteneurs | 2 j | DevOps | F.3 |
| G.2 | Tableaux de bord et indicateurs de pilotage | 2 j | DevOps | G.1 |
| G.3 | Règles d'alerte et canaux de notification | 1 j | DevOps | G.2 |
| **H** | **Sauvegardes et restauration** | **6 j** | | |
| H.1 | Sauvegardes automatisées et externalisation chiffrée | 3 j | DevOps | F.3 |
| H.2 | Procédures de restauration des trois environnements | 2 j | DevOps | H.1 |
| H.3 | Test de restauration réel, chronométré et consigné | 1 j | DevOps | H.2 |
| **I** | **Documentation et procédures** | **6 j** | | |
| I.1 | Diagramme d'infrastructure et procédures BPMN | 2 j | DevOps | H.3 |
| I.2 | Fiches de mode opératoire par profil | 2 j | DevOps | I.1 |
| I.3 | Relecture et validation | 2 j | Chef de projet | I.2 |
| **J** | **Formation des équipes** | **7 j** | | |
| J.1 | Préparation des supports et des ateliers | 2 j | DevOps | I.3 |
| J.2 | Ateliers développeurs, sept sessions | 3 j | DevOps | J.1 |
| J.3 | Ateliers chefs de projet et présentation générale | 2 j | Chef de projet | J.1 |

## H.4 Jalons

| Jalon | Position | Condition de franchissement |
|---|---|---|
| W1, choix techniques validés | Fin de A.3 | Le comité a validé les briques et le budget |
| W2, socle en ligne | Fin de B.4 | Les sous-domaines répondent en HTTPS |
| W3, code versionné | Fin de C.3 | Tous les dépôts sont migrés, les branches protégées |
| W4, première chaîne complète | Fin de D.4 | Un commit déclenche un build et produit une image |
| W5, généricité prouvée | Fin de E.4 | Les trois types de projets se déploient |
| W6, trois environnements actifs | Fin de F.3 | Dev et préproduction automatiques, production sur validation |
| W7, reprise après sinistre validée | Fin de H.3 | Une restauration réelle a été effectuée et chronométrée |
| W8, équipes autonomes | Fin de J.3 | Les équipes déploient sans intervention de la plateforme |

Le jalon W7 mérite d'être suivi de près. C'est le seul qui traite directement le dysfonctionnement le plus grave du diagnostic, l'absence de sauvegardes vérifiées, et c'est aussi celui qu'on est le plus tenté de repousser parce qu'il ne produit rien de visible.

## H.5 Chemin critique

```
A.1 → A.2 → A.3 → B.1 → B.2 → B.3 → B.4 → C.1 → C.2 → D.1 → D.2 → D.3
    → D.4 → E.2 → F.1 → F.2 → F.3 → H.1 → H.2 → H.3 → I.1 → I.2 → I.3 → J.1 → J.3
```

Le pipeline du site administrable, en E.2, est sur le chemin critique alors que les deux autres n'y sont pas. La raison est simple : c'est celui dont dépendent les environnements, puisque c'est le type de projet qui comporte une base de données et des migrations. Les pipelines vitrine et mobile peuvent se construire en parallèle sans retarder la suite.

## H.6 Diagramme des ressources

| Ressource | Charge | Répartition |
|---|---|---|
| Ingénieur DevOps | 60 j | Présent sur presque toutes les tâches, pic sur les lots D à H |
| Développeur | 7 j | Ponctuel, migration des dépôts et Jenkinsfile de référence |
| Chef de projet | 7 j | Cadrage, validation de la documentation, ateliers |

Cette répartition met en évidence un risque déjà identifié dans la matrice des risques du cahier des charges : le projet repose presque entièrement sur une seule ressource. C'est précisément ce que le recrutement décrit en partie F vient corriger, mais le recrutement n'aboutira pas avant la fin de la mise en place. Deux mesures compensent ce déséquilibre pendant cette période. La documentation est produite au fil de l'eau et non à la fin, et un développeur est associé aux lots C et E afin qu'une seconde personne connaisse le fonctionnement de la chaîne.
