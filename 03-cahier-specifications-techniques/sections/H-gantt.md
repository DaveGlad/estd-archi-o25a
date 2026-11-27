# H. Diagramme de Gantt

> Le diagramme doit être saisi sous GanttProject ou MS Project, aucun autre outil n'étant accepté, et planifié **en mode ASAP**. Cette section fournit la structure à saisir. Le fichier produit est exporté en image pour le dossier, avec la timeline et le diagramme des ressources.
>
> Le calcul du taux journalier moyen figure en annexe des deux dossiers.

## H.1 Périmètre

Ce Gantt couvre la mise en place du workflow d'intégration continue chez Furious Ducks, du cadrage à la formation des équipes. Il est distinct du Gantt du projet client Thé Tip Top, qui figure dans le cahier des charges.

Les deux plannings se recoupent sur un point : le workflow doit être opérationnel avant le début du développement du site du jeu-concours, puisque ce projet est celui qui doit l'éprouver.

## H.2 Structure en lots

| Lot | Intitulé | Charge | Répartition | Coût |
|---|---|---|---|---|
| A | Cadrage et audit de l'existant | 7 j | 4 j DevOps, 3 j chef de projet | 4 620 € |
| B | Socle serveur et Docker | 6 j | 6 j DevOps | 3 960 € |
| C | SCM et conventions Git | 6 j | 4 j DevOps, 2 j développeur | 3 800 € |
| D | Jenkins, agents et registry | 8 j | 8 j DevOps | 5 280 € |
| E | Pipelines des trois types de projets | 15 j | 10 j DevOps, 5 j développeur | 9 500 € |
| F | Environnements dev, préproduction, production | 8 j | 8 j DevOps | 5 280 € |
| G | Métriques et alertes | 5 j | 5 j DevOps | 3 300 € |
| H | Sauvegardes et restauration | 6 j | 6 j DevOps | 3 960 € |
| I | Documentation et procédures | 6 j | 4 j DevOps, 2 j chef de projet | 3 960 € |
| J | Formation des équipes | 7 j | 5 j DevOps, 2 j chef de projet | 4 620 € |
| | **Total** | **74 j** | | **48 280 €** |

Les coûts appliquent les taux journaliers de l'annexe TJM : **660 €** pour l'ingénieur DevOps comme pour le chef de projet, **580 €** pour le développeur. Le contrôle se refait en une ligne, par ressource plutôt que par lot : 60 × 660 + 7 × 660 + 7 × 580 = 39 600 + 4 620 + 4 060 = **48 280 €**.

## H.3 Détail des tâches

Les durées sont exprimées en jours-ressource. Les dates sont celles que GanttProject calcule au plus tôt, à partir des prédécesseurs et d'un démarrage au 1er septembre 2026. La colonne d'avancement reflète l'état au 21 novembre 2026 : les lots A à H sont terminés, la documentation est en cours, la formation n'a pas commencé.

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

Ce tableau et le fichier `gantt/workflow-furious-ducks.gan` sont produits par le même script, `gantt/build-gan.py`. Saisir les 34 tâches une deuxième fois à la main créerait une copie qui finirait par diverger, et personne ne s'en apercevrait avant que les totaux cessent de correspondre. Le script refuse d'ailleurs d'écrire quoi que ce soit si la somme des coûts ne tombe pas sur les 48 280 € annoncés en H.2.

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
