# Charte graphique — Thé Tip Top

> **État** : cette charte documente l'identité **réellement implémentée** dans
> `packages/ui/src/styles/theme.css`, qui la référence en retour. Les valeurs ci-dessous
> sont **mesurées**, pas souhaitées : chaque hexadécimal est la conversion sRGB du jeton
> OKLCH du thème, et chaque ratio de contraste est calculé selon WCAG 2.1 (formule de
> luminance relative), pas estimé à l'œil.
>
> Une direction artistique complémentaire est attendue du client. Les parties *couleurs*,
> *contrastes* et *typographie* décrivent le code livré ; elles seront mises à jour si la
> direction évolue.

## 1. Le logo

### Les trois concepts présentés

| Concept | Fichier | Décision |
|---|---|---|
| **A — la feuille inscrite** | `logo/concepts/concept-a-feuille.svg` | ✅ **Retenu** |
| B — la vapeur | `logo/concepts/concept-b-vapeur.svg` | ❌ Écarté |
| C — le monogramme TTT | `logo/concepts/concept-c-monogramme.svg` | ❌ Écarté |

**Pourquoi A.** La feuille est construite géométriquement et non dessinée à main levée :
le contour est une vesica symétrique, la nervure centrale suit l'axe, les nervures
secondaires sont appariées. L'ensemble est incliné de 15°, ce qui retire la raideur d'un
axe strictement vertical. Elle dit « thé » immédiatement, sans illustration ni dégradé, et
tient dans un disque — la forme la plus robuste quand le support impose une vignette
(favicon, avatar de réseau social, pastille d'application).

**Pourquoi pas B.** Les volutes de vapeur se referment sous 24 px : à la taille d'un
favicon, il ne reste qu'une tache. Un logo dont la version 16 px est illisible est un logo
qu'on remplace par ses initiales dans la moitié de ses usages réels.

**Pourquoi pas C.** Trois T adossés ne disent rien du thé et se confondent avec un sigle de
société de services. Le sujet demande de « coller au mieux à l'activité et au
positionnement du client » ; un monogramme abstrait fait l'inverse.

### Les déclinaisons

| Fichier | Usage |
|---|---|
| `logotype-horizontal.svg` | **Usage par défaut** : en-tête du site, papier à en-tête, signature de courriel |
| `logotype-vertical.svg` | Formats étroits : sac, étiquette, bandeau de réseau social |
| `logo-symbole.svg` | Sans le mot : favicon, avatar, pastille |
| `logo-monochrome.svg` | **Une seule encre** : gravure sur infuseur, tampon, sérigraphie |
| `logotype-fond-sombre.svg` | Fonds sombres |

La version monochrome **évide** la feuille au lieu de la remplir. C'est la contrainte qui a
guidé la construction : un lot du jeu est un infuseur gravé, et une gravure n'a pas de
seconde encre.

La version fond sombre n'est pas une inversion mécanique. Le vert `#185B37` sur le fond
sombre `#0D1610` tomberait à **1,4:1** — invisible. Le disque passe donc au vert clair
`#68B986`, à **7,8:1**.

### Zone de protection et taille minimale

- **Zone de protection** : le rayon du disque (R) de tous les côtés. Rien, pas même un
  filet, n'y entre.
- **Taille minimale** : **24 px** de haut à l'écran pour le logotype complet, **16 px**
  pour le symbole seul. Sous 16 px, la nervure la plus fine passe sous le demi-pixel.
- **Impression** : 12 mm de large minimum pour le logotype.

### Les interdits

| Interdit | Pourquoi |
|---|---|
| Déformer, étirer, changer les proportions | La feuille est une construction symétrique ; une homothétie non uniforme la casse |
| Recolorer hors de la palette | Le vert et le laiton **sont** l'identité ; un logo bleu n'est plus celui-ci |
| Ajouter ombre portée, biseau ou dégradé | Le symbole doit survivre à une gravure et à un fax |
| Poser le logo couleur sur un fond sombre | 1,4:1. Utiliser `logotype-fond-sombre.svg` |
| Poser le logo sur une photographie chargée | Contraste non maîtrisé. Pastille unie, ou version monochrome |
| Remplacer la typographie du mot | Fraunces en capitales espacées fait partie de la marque |
| Dissocier le symbole et le mot en les recomposant | Deux logotypes existent déjà pour cela |

## 2. Couleurs

Les jetons sont définis en **OKLCH** dans le thème, pas en hexadécimal, et c'est un choix :
OKLCH est perceptuellement uniforme, donc faire varier la clarté d'un cran produit un écart
visuel régulier — ce qui n'est vrai ni en HSL ni en RVB. Les valeurs sRGB ci-dessous sont
la conversion, données pour les supports qui ne lisent pas OKLCH.

### Thème clair

| Jeton | HEX | RVB | CMJN | Rôle |
|---|---|---|---|---|
| `--primary` | `#185B37` | 24, 91, 55 | 74, 0, 40, 64 | **Vert thé.** Couleur de marque, actions principales |
| `--primary-hover` | `#034D2A` | 3, 77, 42 | 96, 0, 45, 70 | Survol |
| `--accent` | `#D09945` | 208, 153, 69 | 0, 26, 67, 18 | **Laiton.** Surfaces décoratives **uniquement** |
| `--accent-strong` | `#7F4A00` | 127, 74, 0 | 0, 42, 100, 50 | Laiton utilisable **en texte** |
| `--fg` | `#18221B` | 24, 34, 27 | 29, 0, 21, 87 | Texte courant |
| `--fg-muted` | `#5B675E` | 91, 103, 94 | 12, 0, 9, 60 | Texte secondaire |
| `--bg` | `#FCFAF4` | 252, 250, 244 | 0, 1, 3, 1 | Fond, papier chaud |
| `--surface` | `#FFFFFF` | 255, 255, 255 | 0, 0, 0, 0 | Cartes |
| `--border` | `#DDDBD2` | 221, 219, 210 | 0, 1, 5, 13 | Filets |
| `--success` | `#236436` | 35, 100, 54 | 65, 0, 46, 61 | Lot gagné, lot remis |
| `--warning` | `#8D4A00` | 141, 74, 0 | 0, 48, 100, 45 | Jeu fermé, délai expiré |
| `--danger` | `#A5292B` | 165, 41, 43 | 0, 75, 74, 35 | Code déjà joué, erreur |

> **Deux laitons et non un.** `--accent` (#D09945) est trop clair pour porter du texte :
> 2,3:1 sur blanc. Il sert aux aplats décoratifs. `--accent-strong` (#7F4A00) est le même
> laiton re-étagé jusqu'à **7,3:1**. Un jeton unique aurait forcé à choisir entre une
> décoration terne et un texte illisible.

### Thème sombre

| Jeton | HEX | Rôle |
|---|---|---|
| `--bg` | `#0D1610` | Fond |
| `--surface` | `#161F19` | Cartes |
| `--fg` | `#F3F2EC` | Texte courant |
| `--fg-muted` | `#AEABA0` | Texte secondaire |
| `--primary` | `#68B986` | Vert thé, re-étagé pour le fond sombre |
| `--accent-strong` | `#E8B45E` | Laiton, re-étagé |
| `--border` | `#2C362F` | Filets |

Les deux thèmes ne sont pas l'inverse l'un de l'autre. Chaque couleur a été **re-étagée**
pour sa surface : une inversion mécanique donne des verts fluorescents et des contrastes
qui passent de 8:1 à 2:1 sans prévenir.

## 3. Contrastes mesurés

Calculés sur les valeurs sRGB ci-dessus, formule WCAG 2.1. Le seuil AA est **4,5:1** pour
le texte courant, **3:1** pour le grand texte et les éléments graphiques (critère 1.4.11).

### Thème clair

| Avant-plan | Fond | Ratio | Verdict |
|---|---|---|---|
| `fg` | `bg` | **15,68:1** | AAA |
| `fg` | `surface` | **16,36:1** | AAA |
| `fg-muted` | `bg` | **5,67:1** | AA |
| `fg-muted` | `surface` | **5,92:1** | AA |
| `primary` | `bg` | **7,77:1** | AAA |
| `primary` | `surface` | **8,11:1** | AAA |
| `primary-fg` | `primary` | **7,90:1** | AAA — texte des boutons |
| `accent-strong` | `bg` | **6,98:1** | AAA |
| `accent-strong` | `surface` | **7,29:1** | AAA |
| `success` | `surface` | **7,12:1** | AAA |
| `warning` | `surface` | **6,75:1** | AAA |
| `danger` | `surface` | **7,11:1** | AAA |

### Thème sombre

| Avant-plan | Fond | Ratio | Verdict |
|---|---|---|---|
| `fg` | `bg` | **16,43:1** | AAA |
| `fg-muted` | `bg` | **8,02:1** | AAA |
| `primary` | `bg` | **7,79:1** | AAA |
| `accent-strong` | `bg` | **9,76:1** | AAA |
| `danger` | `surface` | **5,42:1** | AA |

### Palette de données

Quatre teintes, **ordre de créneau fixe, jamais cyclique** : une série qui change de
couleur d'un écran à l'autre oblige à relire la légende à chaque fois.

| Jeton | HEX | CMJN | Contraste sur blanc |
|---|---|---|---|
| `--chart-1` | `#0E7A48` | 89, 0, 41, 52 | 5,39:1 |
| `--chart-2` | `#B4801F` | 0, 29, 83, 29 | **3,47:1** |
| `--chart-3` | `#2E6FA8` | 73, 34, 0, 34 | 5,31:1 |
| `--chart-4` | `#A64B38` | 0, 55, 66, 35 | 5,70:1 |

> `--chart-2` est à 3,47:1, donc **sous le seuil de 4,5:1 du texte** et au-dessus du seuil
> de 3:1 des éléments graphiques. C'est conforme pour une aire ou une courbe, et ce jeton
> ne doit **pas** servir à écrire. C'est dit ici plutôt que découvert à l'audit.

Les séries ne se distinguent pas que par la teinte : un daltonien deutéranope confondrait
le vert et le rouge brique. Les graphiques portent donc aussi des **libellés directs** et
des **motifs de trait distincts**.

## 4. Typographie

| Rôle | Police | Licence | Chargement |
|---|---|---|---|
| Titres | **Fraunces** | SIL Open Font License 1.1 | `next/font/google`, auto-hébergée |
| Texte courant | **Inter** | SIL Open Font License 1.1 | `next/font/google`, auto-hébergée |
| Chiffres | Inter, `font-variant-numeric: tabular-nums` | — | — |

**Licences.** Les deux sont sous OFL 1.1 : usage commercial autorisé, redistribution
autorisée, aucune redevance. Cela compte au-delà du juridique — l'exigence n° 6 du sujet
impose de l'open source, et une police propriétaire dans l'identité de marque est une
dépendance payante par poste de travail, à vie.

**Auto-hébergement.** `next/font` télécharge les fichiers à la compilation et les sert
depuis le domaine du site. Aucune requête vers `fonts.googleapis.com` à l'exécution : c'est
une exigence RGPD — une requête vers un tiers transmet l'adresse IP du visiteur — et c'est
aussi une requête de moins et un rendu sans décalage.

**Chiffres tabulaires** dans le back-office et sur les compteurs. Sans cela, le nombre de
codes restants « saute » latéralement à chaque rafraîchissement, parce que le 1
proportionnel est plus étroit que le 8.

### Échelle

| Niveau | Taille | Graisse | Police |
|---|---|---|---|
| h1 | 2,5–3,5 rem (fluide) | 600 | Fraunces |
| h2 | 1,75–2,25 rem | 600 | Fraunces |
| h3 | 1,375 rem | 600 | Fraunces |
| Texte | 1 rem / 1,6 | 400 | Inter |
| Secondaire | 0,9375 rem | 400 | Inter |
| Surtitre | 0,75 rem, interlettrage 0,08 em, capitales | 600 | Inter |

Tailles en `rem` et non en `px` : un visiteur qui agrandit la police par défaut de son
navigateur — ce que font beaucoup de gens malvoyants — doit voir le site suivre.

## 5. Images

| Règle | Raison |
|---|---|
| Photographie naturelle, lumière du jour, pas de studio saturé | Le positionnement est « bio et fait main » ; une image sur fond blanc dit l'industriel |
| Formats **AVIF** et **WebP**, avec repli JPEG via `<picture>` | Poids divisé par trois à qualité égale. Démarche RSE : des octets non transmis sont de l'énergie non consommée, à chaque visite |
| `alt` descriptif obligatoire, vide **uniquement** si l'image est décorative | WCAG 1.1.1. Un `alt` vide sur une image porteuse de sens est pire que pas d'image |
| Aucune image de texte | Non sélectionnable, non traduisible, non lisible par un lecteur d'écran, floue en zoom |
| Dimensions déclarées sur chaque image | Sinon la page saute au chargement — le CLS des Core Web Vitals, qui compte pour le référencement |

Le site livré n'utilise **aucune photographie** : l'ornement est un tracé SVG dérivé de la
feuille du logo. C'est délibéré — pas de banque d'images à licencier, rien à flouter pour le
RGPD, et une page d'accueil qui tient en quelques dizaines de kilo-octets.

## 6. Mise en page

| Jeton | Valeur |
|---|---|
| Largeur de contenu | 1 200 px maximum, gouttières de 24 px |
| Rayon | `--radius-sm` 0,5 rem · `--radius` 0,75 rem · `--radius-lg` 1,25 rem |
| Grille | 12 colonnes au-delà de 1 024 px, 8 de 640 à 1 024 px, 4 en dessous |
| Points de rupture | 640 px · 768 px · 1 024 px · 1 280 px |

### Accessibilité, règles opposables

- Cible tactile de **44 × 44 px** minimum (WCAG 2.5.5).
- Focus **toujours visible**, anneau de 2 px en `--ring` avec 2 px de décalage. Jamais
  `outline: none` sans remplacement : c'est ce qui rend un site inutilisable au clavier.
- Lien d'évitement en première position dans le DOM.
- Aucune information portée par la **seule** couleur : un lot « remis » porte un libellé,
  pas qu'une pastille verte.
- `prefers-reduced-motion` respecté : les animations sont supprimées, pas accélérées.
