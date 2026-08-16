# Annexe : calcul du taux journalier moyen

> Cette annexe figure dans les deux dossiers, le cahier des charges comme le cahier des spécifications techniques. Le sujet l'exige explicitement dans les deux cas.
>
> Les valeurs de départ sont des hypothèses de travail. Elles doivent être confirmées avant l'export du dossier par une source citée : étude de rémunération sectorielle récente, grille de la convention collective applicable, et barème des cotisations en vigueur.

## 1. Hypothèses retenues

| Paramètre | Valeur | Justification |
|---|---|---|
| Taux de charges patronales | 42 % | Ordre de grandeur pour un salarié cadre. À confirmer avec le barème en vigueur |
| Frais généraux | 25 % du coût employeur | Locaux, matériel, licences, administration, encadrement, formation |
| Marge de l'agence | 20 % | Couvre le risque projet, l'investissement commercial et le résultat |
| Jours travaillés par an | 225 | 365 jours, moins 104 de week-end, 25 de congés payés et 11 fériés |
| Taux d'occupation facturable | 75 % | Les 25 % restants couvrent la formation, la veille, l'avant-vente et l'intercontrat |
| **Jours facturables par an** | **169** | 225 × 75 % |

Le taux d'occupation mérite une explication, car c'est lui qui fait le plus varier le résultat. Facturer 100 % des jours travaillés supposerait qu'aucun collaborateur ne se forme, ne fasse de veille et ne participe jamais à une réponse commerciale. Aucune agence ne fonctionne ainsi. Retenir 75 % est prudent sans être pessimiste.

## 2. Formule

```
coût employeur annuel   = salaire brut annuel × (1 + charges patronales)
coût de revient annuel  = coût employeur × (1 + frais généraux)
coût de revient journalier = coût de revient annuel ÷ jours facturables
TJM                     = coût de revient journalier × (1 + marge)
```

## 3. Résultat par ressource

| Ressource | Brut annuel | Coût employeur | Coût de revient annuel | Coût de revient journalier | **TJM retenu** |
|---|---|---|---|---|---|
| Chef de projet | 45 000 € | 63 900 € | 79 875 € | 473 € | **565 €** |
| Ingénieur DevOps | 45 000 € | 63 900 € | 79 875 € | 473 € | **565 €** |
| Développeur confirmé | 42 000 € | 59 640 € | 74 550 € | 441 € | **530 €** |
| Graphiste et référent UX | 36 000 € | 51 120 € | 63 900 € | 378 € | **455 €** |
| Chargé de communication digitale | 34 000 € | 48 280 € | 60 350 € | 357 € | **430 €** |

Les TJM sont arrondis aux 5 € supérieurs, ce qui est l'usage sur un devis.

## 4. Vérification

Un contrôle simple permet de valider l'ordre de grandeur. Un chef de projet à 565 € par jour sur 169 jours facturables génère 95 485 € de chiffre d'affaires annuel, pour un coût de revient de 79 875 €. La marge dégagée est de 15 610 €, soit 16,4 % du chiffre d'affaires produit par cette ressource. C'est cohérent avec la marge de 20 % appliquée au coût de revient, l'écart venant simplement du fait que l'une se calcule sur le coût et l'autre sur le prix de vente.

## 5. Sensibilité

Ces trois paramètres sont ceux qui déplacent le plus le résultat. Le tableau montre l'effet d'une variation sur le TJM d'un développeur confirmé, fixé à 530 €.

| Paramètre modifié | Nouvelle valeur | TJM développeur |
|---|---|---|
| Référence | | 530 € |
| Taux d'occupation | 65 % au lieu de 75 % | 615 € |
| Taux d'occupation | 85 % au lieu de 75 % | 470 € |
| Frais généraux | 35 % au lieu de 25 % | 570 € |
| Marge | 30 % au lieu de 20 % | 575 € |

La sensibilité au taux d'occupation est la plus forte. C'est ce qui explique pourquoi une agence surveille son taux de facturation plus attentivement que sa grille de salaires.
