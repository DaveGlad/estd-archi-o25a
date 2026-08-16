# I. Estimation des coûts et rentabilité

> Les montants reposent sur le taux journalier moyen calculé en annexe et sur les hypothèses de coût d'infrastructure de la partie D.3. Les tarifs des prestataires doivent être confirmés par leurs grilles publiques avant l'export du dossier.

## I.1 Coût de mise en place

### Coût humain

Il correspond au diagramme de Gantt de la partie H.

| Lot | Charge | Coût |
|---|---|---|
| A, cadrage et audit | 7 j | 3 955 € |
| B, socle serveur et Docker | 6 j | 3 390 € |
| C, SCM et conventions Git | 6 j | 3 320 € |
| D, Jenkins, agents et registry | 8 j | 4 520 € |
| E, pipelines des trois types de projets | 15 j | 8 300 € |
| F, environnements dev, préproduction, production | 8 j | 4 520 € |
| G, métriques et alertes | 5 j | 2 825 € |
| H, sauvegardes et restauration | 6 j | 3 390 € |
| I, documentation et procédures | 6 j | 3 390 € |
| J, formation des équipes | 7 j | 3 955 € |
| **Total** | **74 j** | **41 565 €** |

### Coût matériel et logiciel

| Poste | Montant annuel | Remarque |
|---|---|---|
| Serveur, 8 vCPU, 32 Go, 500 Go SSD | 1 080 € | Estimation à confirmer sur la grille du prestataire retenu |
| Espace de sauvegarde externalisé, 1 To | 240 € | Chez un second prestataire, conformément à la règle du 3-2-1 |
| Nom de domaine et sous-domaines | 60 € | Un seul domaine, les sous-domaines sont gratuits |
| Licences logicielles | 0 € | Toutes les briques du workflow sont open source |
| **Total** | **1 380 €** | |

La ligne à zéro n'est pas un artifice de présentation. Le choix de briques open source, imposé par la direction et cohérent avec le positionnement de l'agence depuis 2007, supprime un poste qui représente souvent plusieurs milliers d'euros par an dans une chaîne équivalente reposant sur des solutions propriétaires.

### Investissement initial

| Poste | Montant |
|---|---|
| Mise en place, humain | 41 565 € |
| Infrastructure, première année | 1 380 € |
| **Total première année** | **42 945 €** |

## I.2 Coût de maintenance récurrent

| Poste | Base de calcul | Montant annuel |
|---|---|---|
| Ingénieur DevOps, mi-temps sur le workflow | 45 000 € bruts, majorés de 42 % de charges, à 50 % | 31 950 € |
| Infrastructure | Voir ci-dessus | 1 380 € |
| **Total annuel** | | **33 330 €** |

Le mi-temps mérite une justification. Le poste créé en partie F est un temps plein, mais la personne recrutée ne consacre pas l'intégralité de son temps au workflow. L'autre moitié se répartit entre l'accompagnement des équipes projet, les interventions sur les infrastructures clients et la veille technique. Imputer 100 % de son coût au workflow fausserait le calcul de rentabilité dans le sens défavorable.

## I.3 Coût de la situation actuelle

Pour mesurer une rentabilité, il faut d'abord chiffrer ce que coûte l'absence de workflow. Les estimations ci-dessous reposent sur les constats de la partie A et sur une activité de 40 projets par an.

| Poste de perte | Base de calcul | Coût annuel |
|---|---|---|
| Déploiements manuels | 40 projets × 6 déploiements × 0,25 jour × 565 € | 33 900 € |
| Correction de régressions détectées en production | 24 incidents × 1,5 jour × 530 € | 19 080 € |
| Mise en place et débogage des environnements | 40 projets × 1 jour × 530 € | 21 200 € |
| Incidents sans sauvegarde exploitable | 2 incidents × 3 jours × 565 € | 3 390 € |
| **Total** | | **77 570 €** |

Ces quatre postes sont ceux que l'on sait chiffrer. Trois autres effets sont réels mais volontairement laissés hors du calcul, faute de méthode de valorisation incontestable : la perte de confiance d'un client après un incident en production, le temps passé à chercher qui a introduit une modification faute d'historique fiable, et la démotivation liée aux tâches répétitives. Les exclure rend le calcul plus prudent, donc plus solide en discussion.

Une précision d'honnêteté intellectuelle s'impose ici. Ces chiffres sont des estimations, puisque l'agence ne mesure rien aujourd'hui, ce qui constitue précisément le dysfonctionnement numéro sept. Le premier effet du workflow sera de rendre ces valeurs observables et de permettre de confirmer ou de corriger ce calcul au bout d'un an.

## I.4 Comparaison et rentabilité

| | Sans workflow | Avec workflow |
|---|---|---|
| Investissement initial | 0 € | 42 945 € |
| Coût annuel récurrent | 77 570 € de pertes | 33 330 € |
| **Coût sur 3 ans** | **232 710 €** | **142 935 €** |

| Indicateur | Valeur |
|---|---|
| Gain annuel à partir de la deuxième année | 44 240 € |
| Gain net sur la première année, investissement déduit | 1 295 € |
| Point mort | environ 11 mois après la mise en service |
| Économie cumulée sur 3 ans | 89 775 € |
| Retour sur investissement à 3 ans | 209 % |

Le point mort à onze mois est le chiffre à retenir. Il signifie que le workflow est amorti à l'intérieur du premier exercice suivant sa mise en service, sans qu'il soit nécessaire de faire intervenir des gains qualitatifs difficiles à défendre.

## I.5 Bénéfices non chiffrés

Ces effets ne figurent pas dans le calcul, mais ils pèsent dans la décision.

| Bénéfice | Effet attendu |
|---|---|
| Capacité à livrer plus souvent | Le client voit avancer son projet, ce qui réduit les litiges de recette |
| Réduction du risque de perte de données | Une seule perte de projet client coûterait davantage que l'investissement complet |
| Attractivité pour le recrutement | Un environnement de travail outillé attire les profils expérimentés |
| Argument commercial | La maîtrise de la chaîne de production devient un différenciateur en avant-vente |
| Base d'une démarche responsable | Les builds incrémentaux réduisent la consommation de ressources, ce qui répond à l'attente du client Thé Tip Top |
| Prérequis à la méthodologie agile | Sans intégration continue, la Definition of Done reste déclarative, comme expliqué en B.2 |

Le dernier point est le plus structurant. Le workflow n'est pas seulement rentable en lui-même, il conditionne la réussite du changement de méthodologie décidé par la direction. Les deux chantiers se soutiennent, et aucun des deux ne produirait son plein effet sans l'autre.

## I.6 Sensibilité du résultat

Le calcul ci-dessus repose sur des estimations. Voici comment le résultat se déplace si elles s'avéraient trop optimistes.

| Hypothèse dégradée | Effet sur le point mort |
|---|---|
| Les pertes actuelles ne sont que de 60 000 € par an au lieu de 77 570 € | 19 mois |
| Le coût de mise en place dépasse de 30 % | 15 mois |
| Le temps consacré au workflow est de 75 % d'un temps plein au lieu de 50 % | 18 mois |
| Les trois hypothèses dégradées se cumulent | Le workflow devient tout juste rentable sur trois ans |

Le scénario le plus défavorable est celui où le workflow demande trois quarts du temps d'un ingénieur. C'est ce qui justifie l'attention portée à la documentation et à la formation dans les lots I et J : un workflow que personne d'autre ne sait utiliser mobilise en permanence celui qui l'a construit, et c'est ce mécanisme qui détruit la rentabilité.
