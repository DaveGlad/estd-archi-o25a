# Annexe 3 : base de calcul des pertes de la situation actuelle

La partie I.3 chiffre à **87 640 € par an** ce que coûte à l'agence l'absence de chaîne d'intégration. Cette annexe donne les quantités retenues, leur origine, et ce qui a été volontairement laissé de côté.

## 1. Avertissement de méthode

Ces chiffres sont des **estimations**, et il faut le dire avant de les présenter. L'agence ne mesure rien aujourd'hui : c'est le dysfonctionnement n° 7 du diagnostic de la partie A. Les quantités ci-dessous viennent des entretiens menés pendant le lot A du Gantt, pas d'un outil de suivi.

Cette faiblesse est aussi le premier bénéfice attendu du workflow. Les métriques décrites en D.2 rendront ces valeurs observables, et le calcul pourra être confirmé ou corrigé au bout d'un an d'exploitation. Une estimation que l'on sait fausse dans un sens inconnu vaut mieux qu'un chiffre absent, à condition de l'annoncer.

Deux précautions sont prises pour que l'estimation penche du côté prudent. Les quantités retenues sont les bornes basses de ce que les équipes ont déclaré. Et trois effets réels mais invérifiables sont exclus du total, voir le point 4.

## 2. Volume d'activité de référence

| Donnée | Valeur | Origine |
|---|---|---|
| Projets livrés par an | 40 | Moyenne des trois derniers exercices |
| Déploiements par projet | 6 | Recette, préproduction, mise en ligne, et trois correctifs en moyenne |
| Incidents en production par an | 24 | Soit deux par mois, déclarés par les chefs de projet |
| Pertes de données sans sauvegarde exploitable | 2 par an | Déclarées en entretien, lot A |

## 3. Les quatre postes chiffrés

### Déploiements manuels

Un déploiement fait à la main mobilise un ingénieur un quart de journée : préparation, transfert, vérification, et la reprise quand une étape a été oubliée.

```
40 projets × 6 déploiements × 0,25 jour × 660 € = 39 600 €
```

Le quart de journée est la borne basse. Les entretiens situaient le geste entre deux et quatre heures selon le projet, et la reprise après erreur, elle, se compte en demi-journées. Retenir 0,25 jour revient à supposer qu'aucun déploiement ne se passe mal, ce qui est évidemment faux.

### Correction des régressions détectées en production

Une régression trouvée par le client coûte beaucoup plus cher que la même trouvée par un test : il faut la reproduire, la corriger, la vérifier, et refaire un déploiement.

```
24 incidents × 1,5 jour × 580 € = 20 880 €
```

Un jour et demi couvre le diagnostic, le correctif et la remise en ligne. Le temps commercial passé à rassurer le client n'est pas compté.

### Mise en place et débogage des environnements

Chaque nouveau projet demande de reconstituer un environnement de développement sur le poste de chaque intervenant, puis de résoudre les écarts entre ces postes.

```
40 projets × 1 jour × 580 € = 23 200 €
```

Une journée par projet, tous intervenants confondus, ce qui est faible pour un projet à trois personnes. C'est le poste où l'estimation est la plus conservatrice.

### Incidents sans sauvegarde exploitable

Reconstituer ce qui a été perdu, et refaire ce qui ne peut pas l'être.

```
2 incidents × 3 jours × 660 € = 3 960 €
```

Trois jours est une moyenne entre un incident mineur et une perte sérieuse. C'est aussi le poste dont la variance est la plus forte : une seule perte de dépôt complet coûterait à elle seule davantage que l'investissement total dans le workflow.

### Total

| Poste | Montant |
|---|---|
| Déploiements manuels | 39 600 € |
| Régressions en production | 20 880 € |
| Environnements | 23 200 € |
| Incidents sans sauvegarde | 3 960 € |
| **Total** | **87 640 €** |

## 4. Ce qui est exclu du calcul, et pourquoi

| Effet | Réalité | Pourquoi il n'est pas chiffré |
|---|---|---|
| Perte de confiance après un incident | Avérée, deux clients l'ont exprimée par écrit | Aucune méthode de valorisation défendable. Chiffrer la probabilité de non-reconduction d'un contrat relève de l'hypothèse, pas du calcul |
| Temps passé à chercher qui a modifié quoi | Quotidienne, faute d'historique fiable | Impossible à isoler du temps de développement normal sans outil de mesure |
| Démotivation liée aux tâches répétitives | Citée dans tous les entretiens du lot A | Se traduirait par du turnover, dont le coût est réel mais dont l'imputation au seul manque d'outillage serait contestable |

Les exclure rend le total plus bas, donc le calcul de rentabilité plus prudent, donc plus solide en discussion. Un chiffrage qui additionne tout ce qui va dans son sens se défend mal devant une direction.

## 5. Comment vérifier ce calcul dans un an

Les métriques mises en place par le lot G rendent trois de ces quatre postes directement observables.

| Poste | Mesure disponible une fois le workflow en service |
|---|---|
| Déploiements manuels | Nombre de déploiements automatiques par projet et par mois, compteur du pipeline |
| Régressions en production | Nombre de retours arrière déclenchés, et de correctifs livrés hors cycle |
| Environnements | Durée entre la création d'un dépôt et le premier build vert |
| Incidents sans sauvegarde | Journal des restaurations, et résultat des tests de restauration mensuels |

C'est l'un des indicateurs de pilotage de la partie C.1, appliqué à l'agence elle-même plutôt qu'aux projets clients.
