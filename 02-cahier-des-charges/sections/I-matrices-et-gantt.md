# I. Matrices et Gantt

## I.1 Méthodes et matrices

### MoSCoW

La priorisation MoSCoW détermine ce qui doit être livré avant l'ouverture du jeu et ce qui peut attendre. Elle sert de base à l'arbitrage si le planning se tend.

| Priorité | Fonctionnalité | Pourquoi ce niveau |
|---|---|---|
| **Doit être fait** | Génération des 500 000 codes avec leur lot | Le jeu ne peut pas ouvrir sans |
| | Saisie d'un code et attribution du gain | Cœur du dispositif |
| | Création de compte par formulaire | Sans compte, pas de gain rattachable |
| | Historique des gains du client | Demandé explicitement par le client |
| | Interface employé et remise des lots | Sans elle, les lots ne peuvent pas être délivrés |
| | Statistiques du back-office | Demandées explicitement |
| | Tirage au sort du gros lot | Engagement du règlement déposé |
| | Conformité RGPD | Obligation légale |
| | Pages légales et règlement | Obligation légale |
| **Devrait être fait** | Inscription par Google et Facebook | Demandé, mais le formulaire assure le repli |
| | Export de la base pour l'emailing | Peut se faire manuellement au démarrage |
| | Accessibilité complète | Visée dès le départ, perfectible ensuite |
| | Endpoints pour les caisses en magasin | Utile, mais la saisie côté client suffit à ouvrir |
| **Pourrait être fait** | Partage du gain sur les réseaux sociaux | Amplifie l'opération sans la conditionner |
| | Tableau de bord temps réel pour la direction | Confort, les statistiques suffisent |
| | Notification par courriel à l'approche de la date limite | Réduit les lots non réclamés |
| **Ne sera pas fait** | Site vitrine et site de vente en ligne | Hors périmètre, autre agence |
| | Application mobile native | Le site adaptatif répond au besoin |
| | Paiement en ligne | Aucune transaction dans le jeu |

Le classement de l'inscription par Google et Facebook en « devrait » plutôt qu'en « doit » demande une explication au client, puisqu'il l'a demandée explicitement. La raison est purement technique : ces connexions dépendent de la validation d'une application par un tiers, dont le délai ne nous appartient pas. Le formulaire classique garantit que le jeu peut ouvrir même si cette validation prend du retard.

### Matrice d'Eisenhower

Elle classe les tâches du projet selon leur urgence et leur importance, et sert à arbitrer au quotidien.

| | **Urgent** | **Non urgent** |
|---|---|---|
| **Important** | Génération et contrôle des 500 000 codes · Parcours de participation · Dépôt du règlement chez l'huissier · Mise en ligne avant l'ouverture de Nice | Identité visuelle · Stratégie de communication · Documentation technique · Formation des employés en boutique |
| **Peu important** | Réponses aux sollicitations quotidiennes du client · Ajustements de maquettes en cours de sprint | Partage sur les réseaux sociaux · Tableau de bord temps réel · Optimisations de performance au-delà du seuil requis |

Le quadrant important et non urgent est celui qui se sacrifie en premier quand le planning se tend, et c'est une erreur classique. L'identité visuelle conditionne tous les supports de communication, et la formation des employés conditionne la remise des lots en boutique. Ces tâches sont donc planifiées tôt, précisément parce que rien ne forcera à les faire.

### Matrice RACI

R pour réalise, A pour approuve, C pour est consulté, I pour est informé.

| Activité | Chef de projet | Développeur | DevOps | Graphiste UX | Chargé de com | Client |
|---|---|---|---|---|---|---|
| Cadrage et planning | R, A | C | C | C | C | A |
| Étude de marché et benchmark | A | I | I | C | R | I |
| Identité visuelle et logo | C | I | I | R | C | A |
| Maquettes et wireframes | C | C | I | R | C | A |
| Modèle de données | I | R | C | I | I | I |
| Génération des codes | A | R | C | I | I | I |
| Développement du site | A | R | C | C | I | I |
| API et intégrations | A | R | C | I | I | C |
| Infrastructure et mise en ligne | A | C | R | I | I | I |
| Tests et recette | A | R | C | C | I | C |
| Contenus éditoriaux | C | I | I | C | R | A |
| Réseaux sociaux et influenceurs | C | I | I | C | R | A |
| Emailing | C | C | I | C | R | A |
| Mesure d'audience | A | C | I | I | R | I |
| Documents légaux | R | I | I | I | C | A |
| Formation des employés boutique | R | I | I | C | C | A |
| Tirage au sort | A | R | C | I | I | C |

Une règle a été respectée sur chaque ligne : un seul A. Deux approbateurs sur une même activité produisent systématiquement un blocage ou une décision contradictoire.

### Matrice des risques

Les risques sont cotés de 1 à 5 en probabilité et en impact. La criticité est le produit des deux.

| # | Risque | P | I | Criticité | Parade |
|---|---|---|---|---|---|
| R1 | Retard de validation des connexions Google et Facebook | 4 | 3 | **12** | Formulaire classique livré en premier, connexions ajoutées ensuite sans bloquer l'ouverture |
| R2 | Erreur dans la répartition des lots générés | 2 | 5 | **10** | Test automatisé de recomptage, exécuté et archivé avant l'ouverture |
| R3 | Indisponibilité du site pendant un pic de trafic | 3 | 4 | **12** | Tests de charge en préproduction, dimensionnement avec marge, surveillance et alertes |
| R4 | Validation client tardive sur l'identité visuelle | 4 | 3 | **12** | Trois concepts présentés en une seule fois, avec date de décision contractualisée |
| R5 | Tentative de fraude sur les codes | 3 | 3 | **9** | Limitation du nombre de tentatives, messages d'erreur neutres, journalisation |
| R6 | Perte de données de participation | 1 | 5 | **5** | Sauvegardes quotidiennes, journal de transactions, test de restauration hebdomadaire pendant le jeu |
| R7 | Décalage de l'ouverture de la boutique de Nice | 2 | 3 | **6** | Dates du jeu paramétrables, pas codées en dur |
| R8 | Contestation du tirage au sort | 2 | 4 | **8** | Graine et empreinte conservées, tirage rejouable devant l'huissier |
| R9 | Départ ou absence d'un membre de l'équipe | 2 | 4 | **8** | Suppléant identifié pour chaque rôle, documentation à jour, code revu par un pair |
| R10 | Non-conformité RGPD relevée | 2 | 4 | **8** | Conformité traitée dès la conception, politique de confidentialité validée par un juriste |
| R11 | Dépassement du budget | 3 | 3 | **9** | Périmètre priorisé MoSCoW, suivi à chaque fin de sprint |
| R12 | Lots non réclamés en fin de jeu | 4 | 2 | **8** | Rappel par courriel avant la date limite, information claire dès l'attribution |

Les trois risques les plus critiques ont tous une parade qui consiste à retirer la dépendance plutôt qu'à espérer qu'elle se lève. C'est le principe retenu : quand un risque dépend d'un tiers, on construit un chemin qui s'en passe.

## I.2 Diagramme de Gantt

> Le diagramme doit être saisi sous GanttProject ou MS Project, aucun autre outil n'étant accepté. Cette section fournit la structure complète à saisir : lots, tâches, durées, ressources, prédécesseurs et jalons. Le fichier produit est exporté en image pour le dossier et joint au rendu.

### Structure en lots

| Lot | Intitulé | Charge | Coût |
|---|---|---|---|
| 0 | Cadrage et lancement | 3 j | 1 695 € |
| 1 | Études et stratégie | 18 j | 8 145 € |
| 2 | Conception fonctionnelle | 14 j | 7 260 € |
| 3 | Identité visuelle et maquettes | 20 j | 9 320 € |
| 4 | Développement | 63 j | 33 535 € |
| 5 | Recette et mise en ligne | 19 j | 10 185 € |
| 6 | Dispositif de communication | 15 j | 6 525 € |
| 7 | Pilotage et suivi | 10 j | 5 650 € |
| | **Total** | **162 j** | **82 315 €** |

### Détail des tâches

Les durées sont exprimées en jours-ressource. Une tâche mobilisant deux profils apparaît sur deux lignes, afin que la somme des durées corresponde exactement à la charge des lots.

| Réf. | Tâche | Durée | Ressource | Prédécesseur |
|---|---|---|---|---|
| **0** | **Cadrage et lancement** | **3 j** | | |
| 0.1 | Réunion de lancement | 1 j | Chef de projet | |
| 0.2 | Note de cadrage et validation | 2 j | Chef de projet | 0.1 |
| **1** | **Études et stratégie** | **18 j** | | |
| 1.1 | Plan de veille | 2 j | Chargé de com | 0.2 |
| 1.2 | Étude de marché et chiffres clés | 4 j | Chargé de com | 0.2 |
| 1.3 | Benchmark, 3 concurrents et 5 audits chacun | 5 j | Chargé de com | 1.2 |
| 1.4 | Cibles, personas, zone de chalandise | 2 j | Chargé de com | 1.3 |
| 1.5 | Stratégie de communication digitale | 2 j | Chargé de com | 1.4 |
| 1.6 | Présentation et validation client | 3 j | Chef de projet | 1.5 |
| **2** | **Conception fonctionnelle** | **14 j** | | |
| 2.1 | Ateliers de cadrage fonctionnel | 2 j | Chef de projet | 1.6 |
| 2.2 | Tri de cartes et arborescence | 2 j | Graphiste UX | 2.1 |
| 2.3 | Cas d'utilisation et diagrammes UML | 3 j | Développeur | 2.1 |
| 2.4 | Modèle de données | 3 j | Développeur | 2.3 |
| 2.5 | Spécifications et validation | 2 j | Chef de projet | 2.4 |
| 2.6 | Parcours utilisateur détaillés | 2 j | Graphiste UX | 2.2 |
| **3** | **Identité visuelle et maquettes** | **20 j** | | |
| 3.1 | Recherches, 3 concepts de logo | 4 j | Graphiste UX | 1.6 |
| 3.2 | Présentation et choix du logo | 1 j | Chef de projet | 3.1 |
| 3.3 | Déclinaisons et charte graphique | 3 j | Graphiste UX | 3.2 |
| 3.4 | Zoning et wireframes, 3 formats | 4 j | Graphiste UX | 2.6 |
| 3.5 | Maquettes, 3 formats | 6 j | Graphiste UX | 3.3, 3.4 |
| 3.6 | Reprises après retour client | 1 j | Graphiste UX | 3.5 |
| 3.7 | Validation client des maquettes | 1 j | Chef de projet | 3.6 |
| **4** | **Développement** | **63 j** | | |
| 4.1 | Initialisation, base et environnements | 3 j | Développeur | 2.5 |
| 4.2 | Génération et contrôle des 500 000 codes | 5 j | Développeur | 4.1 |
| 4.3 | Authentification, comptes et rôles | 4 j | Développeur | 4.1 |
| 4.4 | Connexions Google et Facebook | 3 j | Développeur | 4.3 |
| 4.5 | Parcours de participation | 5 j | Développeur | 4.2, 4.3 |
| 4.6 | Historique des gains et espace client | 3 j | Développeur | 4.5 |
| 4.7 | Interface employé et remise des lots | 4 j | Développeur | 4.5 |
| 4.8 | Back-office et statistiques | 4 j | Développeur | 4.5 |
| 4.9 | Export pour l'emailing | 2 j | Développeur | 4.8 |
| 4.10 | Tirage au sort | 2 j | Développeur | 4.5 |
| 4.11 | Fonctionnalités RGPD | 2 j | Développeur | 4.6 |
| 4.12 | API pour les caisses et le futur site | 3 j | Développeur | 4.5 |
| 4.13 | Intégration graphique adaptative | 6 j | Graphiste UX | 3.7 |
| 4.14 | Infrastructure et automatisation du déploiement | 8 j | Ingénieur DevOps | 4.1 |
| 4.15 | Sécurisation, clés d'API et durcissement | 4 j | Ingénieur DevOps | 4.12 |
| 4.16 | Pilotage du développement | 5 j | Chef de projet | 4.1 |
| **5** | **Recette et mise en ligne** | **19 j** | | |
| 5.1 | Tests fonctionnels et de performance | 5 j | Développeur | 4.11, 4.12 |
| 5.2 | Audit d'accessibilité et corrections | 3 j | Développeur | 4.13 |
| 5.3 | Référencement et contenus optimisés | 2 j | Chargé de com | 4.13 |
| 5.4 | Recette client et corrections | 4 j | Chef de projet | 5.1, 5.2 |
| 5.5 | Mise en production | 2 j | Ingénieur DevOps | 5.4 |
| 5.6 | Formation des employés en boutique | 3 j | Ingénieur DevOps | 5.5 |
| **6** | **Dispositif de communication** | **15 j** | | |
| 6.1 | Comptes sociaux et visuels associés | 3 j | Graphiste UX | 3.3 |
| 6.2 | Calendrier éditorial et publications | 4 j | Chargé de com | 6.1 |
| 6.3 | Partenariats d'influence | 3 j | Chargé de com | 6.1 |
| 6.4 | Templates d'emailing | 3 j | Chargé de com | 3.3 |
| 6.5 | Mesure d'audience et rapports | 2 j | Chargé de com | 5.5 |
| **7** | **Pilotage et suivi** | **10 j** | | |
| 7.1 | Comités de pilotage | 4 j | Chef de projet | 0.2 |
| 7.2 | Suivi et reporting | 4 j | Chef de projet | 0.2 |
| 7.3 | Bilan de fin d'opération | 2 j | Chef de projet | 5.6 |

### Jalons

| Jalon | Position | Condition de franchissement |
|---|---|---|
| J1, cadrage validé | Fin du lot 0 | Périmètre, budget et planning signés |
| J2, stratégie validée | Fin de 1.6 | Le client a validé cibles et dispositif |
| J3, identité visuelle validée | Fin de 3.2 | Logo choisi, décliné et validé |
| J4, maquettes validées | Fin de 3.7 | Les 3 formats sont validés |
| J5, codes générés et contrôlés | Fin de 4.2 | Le test de répartition passe, rapport archivé |
| J6, recette client prononcée | Fin de 5.4 | Aucune anomalie bloquante restante |
| J7, site en ligne | Fin de 5.5 | Site accessible, sauvegardes actives |
| J8, ouverture du jeu | Ouverture de Nice | Règlement déposé, tickets imprimés, employés formés |
| J9, clôture et tirage | J+30 | Tirage effectué sous contrôle de l'huissier |
| J10, fin des réclamations | J+60 | Lots non réclamés expirés, bilan remis |

### Chemin critique

Le chemin le plus contraint passe par les tâches suivantes.

```
0.1 → 0.2 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 2.1 → 2.3 → 2.4 → 2.5
    → 4.1 → 4.2 → 4.5 → 4.6 → 4.11 → 5.1 → 5.4 → 5.5 → J8
```

Deux observations pour le client. Le benchmark, en 1.3, est sur le chemin critique bien qu'il paraisse éloigné du développement : c'est lui qui conditionne la validation de la stratégie, donc le lancement de la conception. Et la génération des codes, en 4.2, bloque tout le parcours de participation, ce qui justifie de la traiter très tôt dans le développement plutôt qu'en même temps que les écrans.

### Diagramme des ressources

Le sujet demande ce diagramme en plus de la timeline. Il se génère depuis le même fichier et montre la charge de chaque ressource semaine par semaine.

| Ressource | Charge totale | Répartition |
|---|---|---|
| Chef de projet | 31 j | Étalée sur toute la durée, pics au cadrage et à la recette |
| Développeur confirmé | 54 j | Concentrée sur les lots 4 et 5 |
| Ingénieur DevOps | 17 j | Deux pics, infrastructure puis mise en production |
| Graphiste et UX | 31 j | Concentrée sur le lot 3, puis intégration |
| Chargé de communication | 29 j | Deux pics, études au début, dispositif à la fin |

Le point de vigilance se situe sur le graphiste, qui est seul sur son lot et se trouve sur le chemin critique via les maquettes. Un retard de sa part n'a aucune ressource de compensation. C'est ce qui justifie de démarrer les recherches de logo dès la validation de la stratégie, sans attendre la fin de la conception fonctionnelle.
