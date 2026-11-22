# Annexes du cahier des spécifications techniques

Le sujet est explicite sur le minimum : « A minima, les annexes doivent comporter le calcul du TJM des ressources du projet. » Et il insiste sur la forme : « Il faudra mettre en annexes de ce dossier la base de calcul utilisée pour le taux horaires des ressources et donc **tous les calculs effectués**. Cela permettra de voir qu'il n'y a pas d'erreur sur l'estimation du coût du projet. »

Autrement dit, les calculs doivent être vérifiables ligne à ligne, pas seulement leurs résultats. C'est le principe suivi dans les trois annexes.

## Les trois annexes

| N° | Objet | Fichier |
|---|---|---|
| 1 | Calcul du TJM des ressources | `../../02-cahier-des-charges/annexes/calcul-tjm.md` |
| 2 | Base de calcul des coûts d'hébergement | `annexe-2-hebergement.md` |
| 3 | Base de calcul des pertes de la situation actuelle | `annexe-3-pertes-actuelles.md` |

## Pourquoi l'annexe 1 est ailleurs

Le calcul du TJM est **le même fichier** dans les deux dossiers, le cahier des charges comme celui-ci. Le sujet l'exige dans les deux, et en faire deux versions serait la garantie qu'elles finissent par diverger : le jour où un salaire change, l'une des deux est oubliée, et les deux dossiers annoncent des prix différents pour la même ressource.

Il est donc stocké une fois, du côté du cahier des charges, et inséré dans les deux à l'assemblage. Le script `assembler.py` s'en charge.

## Ce que chaque annexe garantit

**Annexe 1.** Les salaires bruts ne sont pas posés au jugé : ils partent de fourchettes de marché sourcées et datées, auxquelles est appliqué l'écart de la place de Nantes. Le passage du brut au TJM est détaillé opération par opération sur une ligne, et deux contrôles de vraisemblance encadrent le résultat.

**Annexe 2.** Le montant de 1 380 € par an est comparé à trois offres relevées chez des hébergeurs, et chaque écart est expliqué, y compris les deux options moins chères qui ont été écartées et pourquoi.

**Annexe 3.** Les 87 640 € de pertes annuelles sont décomposés en quatre postes, avec la quantité retenue, son origine, et le fait qu'elle soit la borne basse de ce que les entretiens ont donné. Trois effets réels sont explicitement exclus du total, ce qui rend le calcul plus prudent.
