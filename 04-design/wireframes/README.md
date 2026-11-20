# Wireframes

Les trois pages demandées par le cahier des charges, dans les trois formats : accueil,
connexion et inscription, profil. Neuf fichiers SVG.

| | desktop 1440 px | tablette 820 px | mobile 390 px |
|---|---|---|---|
| Accueil | `accueil-desktop.svg` | `accueil-tablette.svg` | `accueil-mobile.svg` |
| Connexion et inscription | `connexion-inscription-desktop.svg` | `connexion-inscription-tablette.svg` | `connexion-inscription-mobile.svg` |
| Profil | `profil-desktop.svg` | `profil-tablette.svg` | `profil-mobile.svg` |

## Mesurés, pas dessinés

Chaque zone est relevée sur le site déployé, avec ses dimensions réelles en pixels. Un
wireframe dessiné à côté du produit diverge au premier changement de maquette, et devient
alors un document qui décrit une page qui n'existe plus.

Les zones portent leur propre titre, pas une étiquette générique. Une page dont le wireframe
annonce trois fois « Contenu » ne dit rien de sa structure.

## Ce qu'ils ajoutent au wireframe

Le wireframe garde les mêmes zones et descend d'un niveau. Les titres restent lisibles,
les paragraphes deviennent des barres proportionnelles à leur longueur, les boutons
gardent leur libellé. On lit la hiérarchie de l'information sans être distrait par la
couleur ni par la typographie.

## Ce que montre la comparaison des trois formats

Le même contenu se réorganise sans rien perdre. En desktop, la saisie de code et l'encart
explicatif tiennent côte à côte. En tablette, l'encart passe sous le formulaire. En mobile,
tout s'empile et la navigation se replie derrière un bouton.

La hauteur totale figure en tête de chaque fichier. L'accueil passe de 3 317 px en desktop
à près du double en mobile, ce qui est la conséquence directe de l'empilement.

## Régénérer

Le générateur ouvre les pages dans un navigateur, relève les boîtes englobantes et écrit
les SVG. Il produit aussi les wireframes du dossier voisin, à partir du même relevé.
