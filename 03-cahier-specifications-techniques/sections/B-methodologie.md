# B. Méthodologie de projet à venir

> Le plan impose de rester bref : « Le but ici n'est pas de faire un cours, mais d'expliquer brièvement le fonctionnement de la méthodologie sélectionnée, ses avantages et inconvénients s'il y en a, comment cela devrait être mis en place, les outils à utiliser. » Cette partie est donc volontairement resserrée.

## B.1 Le choix : Scrum, complété par Kanban

### Comparaison des candidats

| Critère | Scrum | Kanban | XP |
|---|---|---|---|
| Cadre de rôles et de rituels | Fort, structurant pour une agence qui n'en a aucun | Faible, suppose une maturité existante | Moyen |
| Engagement de périmètre daté | Oui, par sprint, ce qui est nécessaire face à un client au forfait | Non | Oui |
| Adapté au flux continu (maintenance, TMA) | Peu | Très bien | Peu |
| Exigences techniques imposées | Aucune | Aucune | Fortes : TDD, pair programming, refactoring permanent |
| Coût d'adoption pour 45 personnes venant du cycle en V | Modéré | Faible | Élevé |

### Décision retenue

Scrum pour les projets clients, Kanban pour le flux de maintenance et de support.

Trois raisons, dans l'ordre d'importance.

Scrum apporte d'abord ce qui manque, c'est-à-dire un cadre. Le diagnostic de la partie A décrit une absence de structure, pas un déficit de compétence. Scrum fournit des rôles nommés, des rituels datés et un livrable démontrable toutes les deux semaines. Kanban, plus souple, suppose une discipline déjà acquise et n'aurait donc rien corrigé.

Le sprint résout ensuite l'effet tunnel. Une démonstration client toutes les deux semaines transforme une erreur de compréhension en simple ajustement de sprint, là où le cycle en V la transformait en litige de recette.

XP est enfin écarté comme point de départ, mais pas sur le fond. Ses pratiques d'ingénierie, tests automatisés, intégration continue, refactoring, sont exactement celles que le workflow va outiller. Imposer simultanément le TDD et le pair programming à une équipe qui n'a même pas de versioning ferait échouer les deux transformations à la fois. Ces pratiques seront donc introduites progressivement, une fois le workflow en place. C'est l'évolution décrite en C.3.

## B.2 Fonctionnement retenu

| Élément | Choix pour Furious Ducks | Justification |
|---|---|---|
| Durée de sprint | 2 semaines | Assez court pour corriger le tir, assez long pour livrer un incrément démontrable sur des projets de quelques mois |
| Product Owner | Le chef de projet, interlocuteur du client | Rôle déjà existant dans l'agence, renommé et repositionné |
| Scrum Master | Tournant au sein de chaque équipe | 45 personnes ne justifient pas un poste dédié à temps plein. À réévaluer plus tard |
| Équipe de développement | 4 à 6 personnes pluridisciplinaires : dev, intégrateur, graphiste | Taille recommandée, qui permet de faire tourner environ 7 équipes en parallèle |
| Definition of Done | Code mergé sur `develop`, build vert dans la CI, déploiement automatique en recette | Le workflow rend la DoD vérifiable automatiquement au lieu de la laisser déclarative |

### Les rituels

| Rituel | Fréquence | Durée | Objet |
|---|---|---|---|
| Sprint planning | Début de sprint | 2 h | Sélection et estimation du contenu du sprint |
| Daily | Quotidien | 15 min | Points de blocage uniquement |
| Sprint review | Fin de sprint | 1 h | Démonstration au client, sur l'environnement de préproduction |
| Rétrospective | Fin de sprint | 1 h | Amélioration du processus lui-même |
| Backlog refinement | Milieu de sprint | 1 h | Préparation du sprint suivant |

> La sprint review se tient sur l'environnement de préproduction alimenté automatiquement par le workflow. C'est le point de jonction concret entre la méthodologie et l'outillage. Sans déploiement automatisé, la démonstration bimensuelle redevient une corvée qu'on finit par sauter.

## B.3 Avantages et inconvénients

### Avantages attendus

| Avantage | Effet mesurable |
|---|---|
| Fin de l'effet tunnel | Une démonstration client toutes les 2 semaines au lieu d'une recette finale |
| Détection précoce des écarts | Une erreur de spécification coûte un sprint, plus un projet entier |
| Charge lissée | Les compétences travaillent en parallèle sur un même incrément |
| Périmètre négociable | Le backlog priorisé permet d'arbitrer sans avenant conflictuel |
| Amélioration continue outillée | La rétrospective produit des actions, la CI en mesure les effets |

### Inconvénients et parades

| Inconvénient | Parade retenue |
|---|---|
| Incompatibilité apparente avec le forfait, puisque le client signe un périmètre que Scrum fait varier | Contractualiser un budget et un délai fermes, avec un périmètre priorisé selon MoSCoW. Le client arbitre à budget constant |
| Coût des rituels, environ 5 h par sprint et par personne | Assumé et chiffré dans le Gantt (partie H). À comparer au coût d'une régression détectée en production |
| Disponibilité du client exigée toutes les 2 semaines | Formalisée dans le comité de pilotage du cahier des charges |
| Risque de Scrum de façade, avec des rituels tenus et des pratiques inchangées | La Definition of Done est vérifiée par la CI. Un build rouge interdit de déclarer une story terminée |

## B.4 Mise en place

Basculer 45 personnes d'un coup serait un facteur d'échec. Le déploiement est donc progressif et daté.

| Phase | Durée | Contenu | Critère de passage |
|---|---|---|---|
| 1. Équipe pilote | 2 sprints | Une équipe volontaire de 4 à 6 personnes, formée, sur un projet réel de taille moyenne | 2 sprints livrés, rétrospectives tenues |
| 2. Ajustement | 1 sprint | Adaptation du cadre à partir des rétrospectives, rédaction du référentiel interne | Référentiel écrit et validé |
| 3. Généralisation | 3 mois | Extension aux autres équipes, les membres du pilote servant de référents | Toutes les équipes en Scrum |
| 4. Maturité | continu | Introduction des pratiques XP, en commençant par les tests automatisés, puis pilotage par les métriques | Vélocité stable, taux de régression en baisse |

Un prérequis bloque le démarrage : la phase 1 ne peut commencer qu'une fois le SCM et la CI opérationnels. Sans build automatisé, la Definition of Done redevient déclarative et tout le dispositif perd son ancrage.

## B.5 Outils

| Besoin | Outil | Justification |
|---|---|---|
| Backlog, sprints, suivi | Outil de gestion de projet, Trello ou Notion | Cohérent avec l'exigence de suivi public du projet |
| Code, revue, branches | SCM Git (voir D.2) | Support de la Definition of Done |
| Build et tests automatisés | Jenkins (voir D.2) | Rend la DoD vérifiable |
| Démonstration client | Environnement de préproduction déployé automatiquement | Support de la sprint review |
| Métriques de pilotage | Prometheus et Grafana (voir D.2) | Vélocité, fréquence de déploiement, taux d'échec des builds |

> Les quatre derniers outils appartiennent au workflow décrit en partie D. Ce n'est pas un hasard : la méthodologie n'est réellement applicable que parce que le workflow l'outille.
