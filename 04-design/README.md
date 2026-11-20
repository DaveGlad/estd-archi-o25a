# Design

| Dossier | État |
|---|---|
| `logo/` | 3 concepts, 1 retenu, 5 déclinaisons SVG |
| `charte/` | Couleurs, contrastes **mesurés**, typographie, images, mise en page |
| `maquettes/` | 15 captures du site réel : 5 pages × 3 formats |
| `zoning/` | 9 zonings, 3 pages par 3 formats |
| `wireframes/` | 9 wireframes, mêmes pages et mêmes formats |

## Les maquettes sont des captures, pas des dessins

Elles sont produites depuis le site qui tourne, par `npm run design:maquettes` dans
`06-app/theetiptop-contest`. Le choix est délibéré : **une maquette qui a divergé de ce qui
a été construit est pire que pas de maquette**, parce que c'est la version à laquelle un
jury compare le site.

Elles se régénèrent en une commande, donc elles ne peuvent pas vieillir en silence.

| Page | Pourquoi celle-là |
|---|---|
| `accueil` | La vitrine du jeu, et la page indexée |
| `connexion-inscription` | Formulaire **et** connexions Google / Facebook, exigence n° 2 du sujet |
| `participer` | UC-01, le parcours que tout le jeu sert |
| `profil` | Historique des gains et droits RGPD, exigences n° 4 et n° 8 |
| `lots` | La dotation et la répartition 60/20/10/6/4 % |

Trois formats à chaque fois — 1440, 820 et 390 px — parce que le sujet demande un site
« accessible à tous devices » et qu'une capture en 1440 ne prouve rien du téléphone.

## La charte documente l'existant

`charte/charte-graphique.md` n'est pas une intention : chaque hexadécimal est la conversion
sRGB d'un jeton OKLCH de `packages/ui/src/styles/theme.css`, et chaque ratio de contraste
est **calculé**, pas estimé. Le fichier de thème la référence en retour, ce qui fait que
l'un ne peut pas dériver de l'autre sans que ça se voie.
