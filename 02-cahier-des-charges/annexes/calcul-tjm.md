# Annexe : calcul du taux journalier moyen

> Cette annexe figure dans les deux dossiers, le cahier des charges comme le cahier des spécifications techniques. Le sujet l'exige explicitement dans les deux cas, et il demande que **tous les calculs** y figurent, pas seulement leur résultat. Chaque ligne ci-dessous est donc recalculable à la main.

## 1. Hypothèses retenues

| Paramètre | Valeur | Justification |
|---|---|---|
| Taux de charges patronales | 42 % | Ordre de grandeur pour un cadre au régime général, cotisations de retraite complémentaire comprises. Fourchette usuelle de 40 à 45 % selon le niveau de rémunération |
| Frais généraux | 25 % du coût employeur | Locaux, matériel, licences, administration, encadrement, formation |
| Marge de l'agence | 20 % | Couvre le risque projet, l'investissement commercial et le résultat |
| Jours travaillés par an | 225 | 365 jours, moins 104 de week-end, 25 de congés payés et 11 fériés |
| Taux d'occupation facturable | 75 % | Les 25 % restants couvrent la formation, la veille, l'avant-vente et l'intercontrat |
| **Jours facturables par an** | **169** | 225 × 75 % = 168,75, arrondi à l'entier le plus proche |

### D'où viennent les salaires bruts

Les rémunérations retenues au point 3 ne sont pas choisies au jugé. Elles partent des fourchettes de marché constatées en France en 2026, auxquelles est appliqué l'écart de la place de Nantes, où l'agence a son siège.

| Profil | Fourchette nationale 2026 | Retenu pour Nantes | Écart appliqué |
|---|---|---|---|
| Ingénieur DevOps confirmé, 3 à 5 ans | 55 000 à 65 000 € | 52 000 € | Environ 12 % sous la moyenne nationale |
| Ingénieur DevOps senior, 6 ans et plus | 70 000 à 85 000 € | non recruté | Voir la fiche de poste, partie F.1 |

L'écart de 12 % correspond à celui que les études de rémunération constatent entre l'Île-de-France et les métropoles régionales. Il n'est pas un rabais : le coût de la vie et les loyers y sont plus bas, et la rémunération nette perçue reste comparable. C'est d'ailleurs l'un des arguments d'attractivité de l'agence, développé en F.1.

Les autres profils sont positionnés par rapport à celui-là, en conservant les écarts internes que l'agence pratique déjà : un développeur confirmé à 46 000 €, un graphiste à 40 000 €, un chargé de communication à 38 000 €.

**Sources consultées en novembre 2026**, à joindre au dossier sous forme de captures datées :

- [Salaire Ingénieur DevOps en France 2026](https://salerya.fr/metiers/tech/devops/)
- [Salaire d'un ingénieur DevOps : junior, confirmé et senior](https://www.learnthings.fr/salaire-ingenieur-devops-junior-confirme-senior/)
- [Salaire DevOps Engineer 2026](https://rpo.rocket4sales.com/salaires/devops-engineer)

La convention collective applicable est **Syntec**, dont la grille de minima par coefficient sert de plancher. Les montants retenus sont tous très au-dessus de ces minima, ce qui est normal sur un métier en tension.

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
| Chef de projet | 52 000 € | 73 840 € | 92 300 € | 546 € | **660 €** |
| Ingénieur DevOps | 52 000 € | 73 840 € | 92 300 € | 546 € | **660 €** |
| Développeur confirmé | 46 000 € | 65 320 € | 81 650 € | 483 € | **580 €** |
| Graphiste et référent UX | 40 000 € | 56 800 € | 71 000 € | 420 € | **505 €** |
| Chargé de communication digitale | 38 000 € | 53 960 € | 67 450 € | 399 € | **480 €** |

Les TJM sont arrondis aux 5 € supérieurs, ce qui est l'usage sur un devis.

Le détail d'une ligne, pour que le calcul soit refaisable sans rien supposer. Ingénieur DevOps : 52 000 × 1,42 = 73 840 €. Puis 73 840 × 1,25 = 92 300 €. Puis 92 300 ÷ 169 = 546,15 €. Enfin 546,15 × 1,20 = 655,38 €, arrondi à **660 €**.

## 4. Vérification

Un contrôle simple permet de valider l'ordre de grandeur. Un chef de projet à 660 € par jour sur 169 jours facturables génère 111 540 € de chiffre d'affaires annuel, pour un coût de revient de 92 300 €. La marge dégagée est de 19 240 €, soit 17,3 % du chiffre d'affaires produit par cette ressource. C'est cohérent avec la marge de 20 % appliquée au coût de revient, l'écart venant simplement du fait que l'une se calcule sur le coût et l'autre sur le prix de vente.

Un second contrôle, par le bas cette fois. Le TJM de 660 € représente 2,9 fois le coût employeur journalier de la ressource, lequel vaut 73 840 ÷ 169 = 437 €. Un rapport compris entre 2,5 et 3 est ce que l'on observe dans les agences de cette taille. En dessous de 2,5, les frais de structure ne sont pas couverts ; au-dessus de 3, le prix décroche du marché.

## 5. Sensibilité

Ces trois paramètres sont ceux qui déplacent le plus le résultat. Le tableau montre l'effet d'une variation sur le TJM d'un développeur confirmé, fixé à 580 €.

| Paramètre modifié | Nouvelle valeur | TJM développeur |
|---|---|---|
| Référence | | 580 € |
| Taux d'occupation | 65 % au lieu de 75 % | 675 € |
| Taux d'occupation | 85 % au lieu de 75 % | 515 € |
| Frais généraux | 35 % au lieu de 25 % | 630 € |
| Marge | 30 % au lieu de 20 % | 630 € |

La sensibilité au taux d'occupation est la plus forte. C'est ce qui explique pourquoi une agence surveille son taux de facturation plus attentivement que sa grille de salaires.
