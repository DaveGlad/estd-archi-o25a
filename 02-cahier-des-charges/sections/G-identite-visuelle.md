# G. Identité visuelle et charte graphique

> Cette partie comporte des livrables visuels qui doivent être produits par R4 et insérés dans le dossier. Le contenu ci-dessous arrête les partis pris, les spécifications et les valeurs. Les planches restent à composer.

## G.1 Recherches de logo

Le client demande une refonte complète de son identité visuelle, en collant à son activité et à son positionnement : un thé bio, fait main, haut de gamme, vendu en boutique.

Trois familles de concepts ont été explorées, avec trois déclinaisons chacune.

### Famille 1, la feuille inscrite

**Concept.** La feuille de thé est réduite à sa géométrie : une vésica symétrique, une nervure centrale, des nervures secondaires par paires. Elle est inscrite dans un disque, ce qui donne à la marque une assise et un cadre reconnaissable même très réduit. L'inclinaison de quinze degrés évite la raideur d'un axe strictement vertical et rappelle la feuille cueillie plutôt que la feuille dessinée.

C'est la famille retenue. Elle est déjà implémentée sur le site.

| Déclinaison | Description | Usage |
|---|---|---|
| 1.a, disque plein | Feuille claire sur disque vert | Usage principal, en-tête, favicon |
| 1.b, contour | Feuille et disque au trait, une seule couleur | Gravure, tampon, marquage à chaud sur les boîtes |
| 1.c, monochrome | Disque en aplat de la couleur du texte | Fax, photocopie, fond coloré |

### Famille 2, le monogramme

**Concept.** Les trois T de Thé Tip Top traités en entrelacs, à la manière d'un poinçon d'orfèvre ou d'un tampon d'atelier. Le geste renvoie à la signature manuelle et donc au fait main, qui est l'argument central de la maison. Cette famille produit une marque très reconnaissable mais moins immédiatement lisible que la feuille.

| Déclinaison | Description |
|---|---|
| 2.a | Trois T entrelacés dans un cercle plein |
| 2.b | Trois T au trait, sans cercle |
| 2.c | Un seul T, avec la barre horizontale prolongée en feuille |

### Famille 3, l'objet

**Concept.** La tasse vue de dessus, réduite à deux cercles concentriques, avec la feuille qui flotte à la surface. La famille joue sur le moment de la dégustation plutôt que sur la matière première. Elle est plus chaleureuse, mais aussi plus banale : c'est le registre visuel le plus employé du secteur, ce qui va à l'encontre de la volonté de se distinguer.

| Déclinaison | Description |
|---|---|
| 3.a | Tasse vue de dessus, feuille en négatif |
| 3.b | Tasse de profil avec volute de vapeur |
| 3.c | Infuseur stylisé, en référence au lot le plus distribué |

### Pourquoi la famille 1

| Critère | Famille 1 | Famille 2 | Famille 3 |
|---|---|---|---|
| Lisibilité à 16 pixels | Bonne | Faible | Moyenne |
| Originalité sur le secteur | Bonne | Très bonne | Faible |
| Lien avec le produit | Direct | Indirect | Direct |
| Déclinaison en une seule couleur | Simple | Complexe | Simple |
| Vieillissement | Bon, géométrie stable | Risqué, l'entrelacs date vite | Bon |

La famille 2 était la plus distinctive mais échouait au premier critère, qui est éliminatoire : une marque illisible en favicon est une marque qu'on ne reconnaît pas dans un onglet.

## G.2 Le logo retenu

### Construction

La marque est construite géométriquement, pas dessinée à main levée. Cela garantit qu'elle se redessine à l'identique et qu'elle reste nette à toutes les tailles.

| Élément | Spécification |
|---|---|
| Disque | Rayon de 19 unités sur une grille de 40 |
| Feuille | Vésica symétrique, hauteur 27,6 unités, soit 72 % du diamètre |
| Nervure centrale | Sur l'axe, épaisseur 1,3 |
| Nervures secondaires | Deux paires, épaisseur 1,1 |
| Inclinaison | 15 degrés vers la gauche |
| Format | Vectoriel, sans image bitmap |

### Le logotype

Le nom est composé en capitales espacées et non en casse mixte. À cette taille, la capitale tient mieux la ligne et donne à la marque une assise que le bas-de-casse ne lui donnait pas.

| Élément | Spécification |
|---|---|
| Typographie | Fraunces, graisse demi-grasse |
| Casse | Capitales |
| Interlettrage | 0,1 em |
| Écart entre la marque et le nom | 12 pixels pour une marque de 36 pixels |

### Zone de protection et taille minimale

| Règle | Valeur |
|---|---|
| Zone de protection | Un quart du diamètre du disque sur les quatre côtés |
| Taille minimale de la marque seule | 16 pixels à l'écran, 8 millimètres à l'impression |
| Taille minimale du logotype complet | 120 pixels de large |

### Les interdits

| Interdit | Raison |
|---|---|
| Déformer la marque | Elle est construite sur un disque, un aplatissement se voit immédiatement |
| Recolorer la feuille | Le contraste feuille sur disque est calculé, une autre teinte le casse |
| Ajouter une ombre portée ou un effet | La marque est plate, par construction |
| Poser la version pleine sur un fond coloré | Utiliser la version contour ou monochrome |
| Modifier l'interlettrage du logotype | Il est calé sur la taille du disque |
| Écrire le nom en casse mixte | La version validée est en capitales |
| Réduire la marque sous 16 pixels | Les nervures deviennent illisibles |

## G.3 UX mapping

### Carte d'empathie, sur le cœur de cible

Établie sur le persona Théo Marchand, qui découvre le jeu sans connaître la marque. C'est le parcours le plus contraignant, donc celui qui commande la conception.

| Quadrant | Contenu |
|---|---|
| Ce qu'il pense et ressent | « Est-ce que ça vaut le coup de faire un détour ? » « J'espère que ce n'est pas une arnaque à points de fidélité » |
| Ce qu'il voit | Une publication Instagram soignée, une boutique qu'il n'avait jamais remarquée, des prix plus élevés qu'en grande surface |
| Ce qu'il entend | Un ami qui lui dit que le bio en vrac est meilleur, l'encaisseuse qui lui explique le jeu en dix secondes |
| Ce qu'il dit et fait | Il compare sur son téléphone avant d'acheter, il photographie l'étiquette, il joue son code dans la rue |
| Ses freins | Le prix, la crainte d'un formulaire long, le doute sur la réalité du gain |
| Ses gains attendus | Découvrir un produit meilleur, obtenir quelque chose en plus de son achat, une raison de revenir |

### Carte d'expérience, du premier contact au retrait du lot

| Étape | Point de contact | Émotion | Point de friction | Réponse apportée |
|---|---|---|---|---|
| Découverte | Publication Instagram | Curiosité | Le jeu peut sembler trop beau | La promesse 100 % gagnant est affirmée dès l'accroche |
| Renseignement | Site, page d'accueil | Intérêt | Doute sur le sérieux | Mention du règlement déposé chez l'huissier, dès l'accueil |
| Déplacement | Boutique | Attente | Le seuil de 49 euros peut surprendre | Il est annoncé partout, jamais découvert en caisse |
| Achat | Caisse | Satisfaction | Le code peut passer inaperçu sur le ticket | Il est isolé et annoncé par l'encaisseuse |
| Participation | Site, sur mobile | **Impatience forte** | Une inscription longue ferait abandonner | Connexion Google et Facebook, résultat immédiat |
| Résultat | Site | Joie ou déception relative | Un infuseur après un coffret espéré | Le lot est présenté pour ce qu'il est, avec sa valeur et son usage |
| Attente | Courriel | Neutre | Oubli du lot | Rappel automatique avant la date limite |
| Retrait | Boutique | Satisfaction | File d'attente, employé qui cherche | Recherche en un champ, remise en deux clics |
| Après | Usage du lot | Attachement | Aucun | L'infuseur installe le rituel et prépare le réachat |

Le moment le plus critique est la participation, en cinquième ligne. C'est là que le parcours se perd si l'inscription est longue ou si le site charge lentement. C'est la raison pour laquelle le formulaire est réduit au strict nécessaire et les connexions tierces proposées.

## G.4 Zoning

> Neuf vues à produire : accueil, connexion et inscription, profil client, chacune en ordinateur, tablette et smartphone.

Le zoning découpe la page en blocs nommés, sans contenu ni couleur.

### Accueil, structure des blocs

| Bloc | Ordinateur | Tablette | Smartphone |
|---|---|---|---|
| En-tête | Barre fixe, logo à gauche, navigation au centre, compte à droite | Idem, navigation réduite | Logo et menu, navigation repliée |
| Héros | Deux colonnes, texte à gauche, carte du gros lot à droite | Une colonne, carte sous le texte | Une colonne |
| Chiffres clés | Trois colonnes sous le texte du héros | Trois colonnes | Trois colonnes resserrées |
| Mode d'emploi | Trois colonnes égales | Trois colonnes | Une colonne empilée |
| Les lots | Trois colonnes, deux rangées | Deux colonnes | Une colonne |
| La maison | Deux colonnes, texte et liste de boutiques | Une colonne | Une colonne |
| Pied de page | Cinq colonnes | Trois colonnes | Une colonne |

### Connexion et inscription

| Bloc | Ordinateur | Tablette | Smartphone |
|---|---|---|---|
| Titre et introduction | Colonne de gauche | Pleine largeur | Pleine largeur |
| Carte de formulaire | Colonne de gauche, largeur limitée | Centrée | Pleine largeur |
| Connexions tierces | Sous le formulaire | Idem | Idem |
| Colonne d'argumentaire | Colonne de droite | **Masquée** | **Masquée** |

Le masquage de la colonne d'argumentaire sous la largeur ordinateur est un choix. Sur mobile, l'utilisateur vient s'inscrire, pas se laisser convaincre : il a déjà son ticket en main.

### Profil client

| Bloc | Ordinateur | Tablette | Smartphone |
|---|---|---|---|
| En-tête de compte | Pleine largeur | Pleine largeur | Pleine largeur |
| Navigation de compte | Colonne latérale gauche | Barre horizontale défilante | Barre horizontale défilante |
| Chiffres du compte | Trois colonnes | Trois colonnes | Une colonne |
| Liste des gains | Pleine largeur, une carte par gain | Idem | Idem, carte empilée |

## G.5 Wireframes

Mêmes pages, mêmes formats, neuf vues. Le wireframe pose le contenu à l'intérieur des blocs du zoning : titres réels, longueurs de texte réalistes, champs de formulaire, boutons. Toujours en niveaux de gris.

Les contenus à y placer sont ceux rédigés en partie D.3 pour l'accueil, et ceux du site pour les deux autres pages.

## G.6 Maquettes

Mêmes pages, mêmes formats, avec l'identité visuelle complète.

**État actuel.** La page d'accueil est maquettée en cinq largeurs, 1920, 1512, 1440, 768 et 390 pixels. Il manque les pages de connexion et inscription, et le profil client.

**Méthode retenue.** Les maquettes sont produites à partir de l'intégration front, et non l'inverse. C'est inhabituel, et c'est un argument à assumer en soutenance : l'écart entre la maquette et le site livré est nul par construction, puisque la première est issue du second.

## G.7 Charte graphique

### Couleurs

> Les valeurs CMJN sont à calculer par R4 pour l'impression. Les valeurs écran sont arrêtées et vérifiées.

| Rôle | Hexadécimal clair | Hexadécimal sombre | Usage |
|---|---|---|---|
| Vert thé, couleur principale | `#185B37` | `#68B986` | Boutons, aplats, marque |
| Laiton, accent décoratif | `#D09945` | `#E8B45E` | Surfaces, filets, ornements |
| Laiton soutenu, accent textuel | `#7F4A00` | `#E8B45E` | Surtitres, chiffres mis en avant |
| Papier, fond | `#FCFAF4` | `#0D1610` | Fond de page |
| Surface | `#FFFFFF` | `#161F19` | Cartes, en-têtes |
| Encre | `#18221B` | `#F3F2EC` | Texte courant |
| Encre atténuée | `#5B675E` | `#AEABA0` | Texte secondaire |
| Filet | `#DDDBD2` | `#2C362F` | Bordures |

### Contrastes vérifiés

Les ratios ont été calculés, pas estimés. Seules les combinaisons validées figurent dans l'identité.

| Combinaison | Ratio clair | Ratio sombre | Niveau |
|---|---|---|---|
| Encre sur papier | 15,66 | 16,38 | AAA |
| Encre atténuée sur papier | 5,69 | 7,98 | AA et AAA |
| Vert principal sur papier | 7,76 | 7,77 | AAA |
| Blanc sur vert principal | 7,87 | 8,05 | AAA |
| Encre sur surface atténuée | 14,35 | 13,75 | AAA |
| Laiton soutenu sur papier | 7,00 | 9,72 | AAA |
| **Laiton clair sur papier** | **2,42** | 9,72 | **Échec en mode clair** |

**La règle qui en découle.** Le laiton clair est inutilisable pour du texte sur fond papier. Il est donc réservé aux surfaces décoratives, aux filets et aux ornements. Dès qu'il s'agit de texte, c'est la variante soutenue à 7,00 qui est employée. Cette distinction est appliquée dans tout le site.

### Palette des graphiques

Quatre teintes catégorielles, validées sur cinq critères mesurés : bande de clarté, plancher de chroma, séparation sous simulation de daltonisme, seuil de vision normale, contraste sur le fond.

| Emplacement | Clair | Sombre |
|---|---|---|
| 1 | `#0E7A48` | `#35A46C` |
| 2 | `#B4801F` | `#BF8A26` |
| 3 | `#2E6FA8` | `#4E90CE` |
| 4 | `#A64B38` | `#C56C55` |

En mode sombre, la paire vert et laiton reste dans la bande basse de séparation sous daltonisme. Les graphiques concernés portent donc systématiquement une légende et des étiquettes chiffrées : la couleur ne porte jamais l'identité à elle seule.

### Typographies

| Usage | Fonte | Graisses | Licence |
|---|---|---|---|
| Titres | Fraunces | 600 | Licence libre, à citer précisément dans le dossier |
| Texte courant | Inter | 400, 500, 600 | Licence libre, à citer précisément |
| Chiffres et codes | Fonte à chasse fixe du système | 400 | Aucune, police système |

> R4 doit vérifier et citer la référence exacte de chaque licence. Le sujet le demande explicitement.

### Échelle typographique

| Usage | Taille | Interlignage | Interlettrage |
|---|---|---|---|
| Titre de héros | 44 à 68 px, fluide | 0,98 | -0,03 em |
| Titre de page | 32 à 44 px, fluide | 1,10 | -0,02 em |
| Titre de section | 26 à 34 px, fluide | 1,15 | -0,02 em |
| Titre de carte | 19 px | 1,30 | -0,01 em |
| Texte courant | 15 à 17 px | 1,55 à 1,60 | 0 |
| Texte secondaire | 13,5 à 15 px | 1,45 à 1,55 | 0 |
| Surtitre et étiquette | 11 à 12 px, capitales | 1 | +0,10 à +0,13 em |

### Images autorisées et refusées

| Autorisé | Refusé |
|---|---|
| Lumière naturelle, latérale | Éclairage studio froid |
| Mains au travail, gestes de l'atelier | Mains de mannequin, mise en scène évidente |
| Matière visible, feuilles, texture des boîtes | Rendu 3D, image de synthèse |
| Fonds neutres, bois, lin, papier | Fonds colorés saturés |
| Cadrages serrés sur le produit | Plans larges de bureau ou de vie de famille |
| Personnes réelles, en situation | Sourires de banque d'images |
| Grain léger accepté | Filtres marqués, saturation poussée |

### Éléments graphiques de la charte

| Élément | Spécification |
|---|---|
| Rayon des cartes | 14 px |
| Rayon des boutons | 10 px |
| Rayon des pastilles | Complet |
| Épaisseur des filets | 1 px |
| Ornement feuille | Version au trait du logo, en filigrane, opacité 35 % |
| Ornement vapeur | Trois volutes, employé uniquement sur les aplats verts |
| Grain de fond | Bruit fractal, opacité 3,5 % en clair et 5 % en sombre |
| Anneau de focus | 2 px de la couleur principale, décalé de 2 px |

## Ce qui reste à produire par R4

| Livrable | Charge estimée |
|---|---|
| Planche des neuf propositions de logo | 1,5 jour |
| Planches des deux cartes UX | 0,5 jour |
| Neuf zonings | 1 jour |
| Neuf wireframes | 1 jour |
| Six maquettes manquantes, connexion et profil | 1 jour |
| Conversion CMJN et vérification des licences | 0,5 jour |
| Planche des images autorisées et refusées | 0,5 jour |
