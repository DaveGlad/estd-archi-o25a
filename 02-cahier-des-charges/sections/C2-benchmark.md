# C.2 Positionnement et concurrence

## Choix des concurrents analysés

| Site | Type | Pourquoi celui-ci |
|---|---|---|
| Palais des Thés | Concurrent direct | Même métier, même positionnement haut de gamme, réseau de boutiques physiques et vente en ligne |
| Kusmi Tea | Concurrent direct | Même métier, gamme intégralement bio depuis 2020, forte notoriété de marque |
| Nature & Découvertes | Concurrent indirect | Ne vend pas que du thé, mais capte la même intention d'achat cadeau et bien-être, avec un rayon thés et épicerie |

## Méthode

Les relevés ont été effectués en août 2026 sur les pages d'accueil, par inspection du code source, des en-têtes HTTP et des fichiers `robots.txt`. Ils sont donc reproductibles.

Trois familles de mesures ne peuvent pas se relever depuis le code source seul et restent à compléter avec les outils dédiés : les temps de chargement réels, les scores de performance et l'audit d'accessibilité automatisé. La méthode et les outils sont indiqués à chaque fois.

---

## Concurrent 1, Palais des Thés

### Audit technique

| Critère | Relevé |
|---|---|
| Socle technique détecté | Magento, avec une couche front en Vue |
| Serveur annoncé | Non exposé, bonne pratique de sécurité |
| Poids du HTML brut | 477 Ko |
| Scripts chargés depuis la page | 70 |
| Feuilles de style liées | 15 |
| Responsive | Balise viewport présente |
| HSTS | Actif |
| Outils tiers détectés | Google Tag Manager, Algolia pour la recherche, solution d'avis clients |
| Performances mesurées | À compléter avec PageSpeed Insights |

### Audit Green IT

| Critère | Relevé |
|---|---|
| Images au format nouvelle génération | 139 occurrences de webp ou avif |
| Nombre d'images dans la page | 54 |
| Nombre de requêtes | 85 ressources liées au minimum, hors images |
| Minification CSS et JS | À vérifier fichier par fichier avec l'extension GreenIT Analysis |
| Présence d'un print CSS | **Oui** |
| Caractères standards | Encodage UTF-8, pas de police d'icônes détectée |

Le print CSS est un point favorable, et il est rare. C'est un critère explicitement listé par la grille d'audit.

### Audit de référencement

| Critère | Relevé |
|---|---|
| Balise title | « Palais des Thés - Déguster le meilleur du thé », 45 caractères |
| Meta description | Présente, 152 caractères |
| Balise h1 | 1, correctement unique |
| Structure hn | 9 h2, 19 h3 |
| Attribut lang | Présent |
| URL canonique | Présente |
| Open Graph | Présent |
| Données structurées | 3 blocs JSON-LD |
| robots.txt | Présent, 3 déclarations de sitemap |
| HTTPS | Oui |
| Réseaux sociaux | Facebook, Instagram, Pinterest, LinkedIn |

**Méthode AIDA.** L'attention est captée par un visuel de saison et l'accroche « Déguster le meilleur du thé ». L'intérêt est entretenu par les blocs pédagogiques, les types de thé, la préparation, les cultures dans le monde. Le désir passe par les avis clients et le bloc « Deux cadeaux pour vous ». L'action est déclenchée par la livraison offerte dès 45 euros et les quatre échantillons offerts.

### Audit de design et d'ergonomie

| Critère | Observation |
|---|---|
| Logo | Typographique, sobre, sans symbole |
| Couleurs | Dominante neutre, accents chauds saisonniers |
| Typographies | Serif pour les titres, sans serif pour le texte |
| Navigation | 9 entrées principales, dont une entrée saisonnière « Thés glacés » |

**Critères de Bastien et Scapin.** Le guidage est bon, avec un incitatif clair sur les blocs de réassurance. La charge de travail est en revanche élevée : 9 entrées de navigation dépassent ce qu'un visiteur mémorise. L'homogénéité est respectée. Le contrôle explicite est correct, la gestion des cookies étant paramétrable.

### Audit d'accessibilité

| Principe WAI | Relevé |
|---|---|
| Perceptible | 54 images, **aucune sans attribut alt** |
| Utilisable | 41 attributs ARIA, 27 attributs role |
| Compréhensible | Attribut lang présent, libellés explicites |
| Robuste | Structure hn cohérente, un seul h1 |
| Contrastes | À mesurer avec un analyseur de contraste |
| Navigation au clavier | À tester manuellement |

### Ce qu'on retient

Site solide et complet, exemplaire sur les alternatives textuelles et sur le print CSS. Le poids de la page et le nombre de scripts restent élevés, ce qui pèse sur le mobile.

---

## Concurrent 2, Kusmi Tea

### Audit technique

| Critère | Relevé |
|---|---|
| Socle technique détecté | Magento, avec des signatures React |
| Serveur annoncé | Cloudflare |
| Poids du HTML brut | **701 Ko**, le plus lourd des trois |
| Scripts chargés depuis la page | **89** |
| Feuilles de style liées | 4 |
| Responsive | Balise viewport présente |
| HSTS | Actif |
| Outils tiers détectés | Google Tag Manager |
| Performances mesurées | À compléter avec PageSpeed Insights |

### Audit Green IT

| Critère | Relevé |
|---|---|
| Images au format nouvelle génération | 120 occurrences de webp ou avif |
| Nombre d'images dans la page | 74 |
| Nombre de requêtes | Au moins 93 ressources liées, hors images |
| Minification | À vérifier avec l'extension dédiée |
| Présence d'un print CSS | **Non** |
| Caractères standards | Encodage UTF-8 |

Le HTML de 701 Ko est le point faible. À titre de comparaison, c'est plus du double du poids d'une page correctement optimisée.

### Audit de référencement

| Critère | Relevé |
|---|---|
| Balise title | « Kusmi Tea \| Thés et Infusions Bio de qualité », 44 caractères |
| Meta description | Présente, 200 caractères, soit un peu longue pour un affichage complet |
| Balise h1 | 1 |
| Structure hn | 9 h2, 11 h3 |
| URL canonique | Présente |
| Open Graph | Présent |
| Données structurées | 2 blocs JSON-LD |
| robots.txt | Présent, 1 déclaration de sitemap |
| Réseaux sociaux | Facebook, Instagram, YouTube, LinkedIn |

Le title place « Bio » avant « qualité », ce qui est un choix de mot-clé assumé et cohérent avec le segment le plus dynamique du marché.

**Méthode AIDA.** L'attention passe par la nouveauté mise en avant, « Matcha & Ube ». L'intérêt est nourri par les contenus de conseil, « Quel thé pour quel moment de la journée ? ». Le désir s'appuie sur la certification B Corp et le 100 % bio. L'action est déclenchée par la livraison offerte sur la première commande et le programme de fidélité.

### Audit de design et d'ergonomie

| Critère | Observation |
|---|---|
| Logo | Marque typographique forte, héritée d'une identité ancienne |
| Couleurs | Palette colorée, chaque gamme ayant sa teinte |
| Navigation | 8 entrées, dont une nouveauté signalée |

**Critères de Nielsen.** La visibilité de l'état du système est bonne. La correspondance avec le monde réel est excellente, le vocabulaire est celui du client et non celui du métier. La reconnaissance plutôt que le rappel est bien traitée par le codage couleur des gammes. Le point faible reste l'esthétique et le design minimaliste : la page d'accueil accumule les sollicitations.

### Audit d'accessibilité

| Principe WAI | Relevé |
|---|---|
| Perceptible | 74 images, **aucune sans attribut alt** |
| Utilisable | **183 attributs ARIA, 81 attributs role**, le plus fourni des trois |
| Compréhensible | Attribut lang présent |
| Robuste | Un seul h1, hiérarchie cohérente |
| Contrastes | À mesurer, la palette colorée appelle une vérification |

### Ce qu'on retient

C'est le plus avancé des trois sur l'accessibilité déclarative, avec un usage massif d'ARIA. C'est aussi le plus lourd, et il n'a pas de print CSS.

---

## Concurrent 3, Nature & Découvertes, indirect

### Audit technique

| Critère | Relevé |
|---|---|
| Socle technique détecté | Magento, couche front en Vue |
| Serveur annoncé | Cloudflare |
| Poids du HTML brut | 434 Ko, le plus léger des trois |
| Scripts chargés depuis la page | 82 |
| Feuilles de style liées | 10 |
| Responsive | Balise viewport présente |
| HSTS | Actif |
| Outils tiers détectés | Algolia |

### Audit Green IT

| Critère | Relevé |
|---|---|
| Images au format nouvelle génération | **Aucune occurrence de webp ou avif** |
| Nombre d'images dans la page | **144**, le plus élevé des trois |
| Présence d'un print CSS | **Non** |

C'est le point noir de cet audit. 144 images, aucune au format nouvelle génération : la page est lourde à charger, en particulier sur un réseau mobile. C'est le contre-exemple à citer dans les préconisations d'éco-conception.

### Audit de référencement

| Critère | Relevé |
|---|---|
| Balise title | « Trouvez le cadeau pour (se) faire plaisir \| Nature & Découvertes », 73 caractères, **trop long pour un affichage complet** |
| Meta description | Présente, 118 caractères |
| Balise h1 | 1 |
| Structure hn | 6 h2, 3 h3, structure pauvre pour une page d'accueil |
| URL canonique | Présente |
| **Open Graph** | **Absent** |
| Données structurées | 1 bloc JSON-LD |
| robots.txt | Présent, 5 déclarations de sitemap |
| Réseaux sociaux | Instagram, Facebook, YouTube |

L'absence d'Open Graph est un manque net : un partage sur un réseau social ne produira pas d'aperçu maîtrisé.

**Méthode AIDA.** L'attention est captée par la promesse cadeau. L'intérêt passe par les univers thématiques. Le désir s'appuie sur la certification B Corp et l'engagement biodiversité. L'action est portée par le click and collect en une heure, la livraison offerte dès 49 euros et les retours gratuits sous 30 jours.

### Audit de design et d'ergonomie

| Critère | Observation |
|---|---|
| Logo | Marque installée, forte reconnaissance |
| Navigation | 14 catégories principales, ce qui est considérable |

**Critères de Bastien et Scapin.** La charge de travail est le point critique : 14 catégories dépassent largement la capacité de mémorisation. La densité informationnelle de la page d'accueil est élevée. En contrepartie, le guidage par les univers est efficace pour un visiteur sans intention précise.

### Audit d'accessibilité

| Principe WAI | Relevé |
|---|---|
| Perceptible | 144 images, dont **7 sans attribut alt** |
| Utilisable | 136 attributs ARIA, **aucun attribut role** |
| Compréhensible | Attribut lang présent |
| Robuste | Un seul h1, mais structure hn peu développée |

### Ce qu'on retient

Le plus léger en HTML mais le plus lourd en images non optimisées. Manques nets sur l'Open Graph, les alternatives textuelles et la profondeur de la structure de titres.

---

## Tableau comparatif de synthèse

| Critère | Palais des Thés | Kusmi Tea | Nature & Découvertes |
|---|---|---|---|
| Poids du HTML | 477 Ko | 701 Ko | 434 Ko |
| Scripts | 70 | 89 | 82 |
| Images | 54 | 74 | 144 |
| Images webp ou avif | 139 | 120 | **0** |
| Images sans alt | 0 | 0 | **7** |
| Attributs ARIA | 41 | **183** | 136 |
| Print CSS | **oui** | non | non |
| Données structurées | **3** | 2 | 1 |
| Open Graph | oui | oui | **non** |
| Longueur du title | 45 car. | 44 car. | **73 car.** |
| Sitemaps déclarés | 3 | 1 | 5 |

## Conclusions

### Les points positifs à reprendre

**Les alternatives textuelles sont systématiques chez les deux concurrents directs.** Aucune image sans attribut alt sur 54 et 74 images. C'est le niveau à atteindre, et le nôtre le sera puisque l'accessibilité est traitée dès l'intégration.

**Le print CSS de Palais des Thés.** Un seul des trois en a un. Le nôtre en a un, prévu pour deux cas concrets, l'impression d'une page de gain par un joueur et celle des statistiques par un administrateur.

**Les données structurées.** Les trois en ont, de une à trois déclarations. Nous en avons quatre : organisation, site, fil d'Ariane et questions fréquentes.

**Le vocabulaire du client plutôt que celui du métier**, chez Kusmi Tea. « Quel thé pour quel moment de la journée » vaut mieux que « nos assemblages ».

### Les points négatifs à éviter

**La surcharge de la page d'accueil.** Neuf à quatorze entrées de navigation chez les trois. Notre navigation en compte cinq.

**Le poids.** 701 Ko de HTML chez Kusmi Tea, avant même les images. Un site de jeu-concours doit charger vite, il est consulté depuis un téléphone, souvent en boutique.

**Les images non optimisées.** 144 images sans un seul format nouvelle génération chez Nature & Découvertes. Notre intégration utilise l'optimisation d'images native du framework.

**L'absence d'Open Graph.** Une opération dont la promotion passe par les réseaux sociaux ne peut pas se permettre un aperçu de partage non maîtrisé. Nous générons l'image de partage à la volée, aux couleurs de la charte.

## Mapping concurrentiel

Deux axes retenus, parce que ce sont ceux sur lesquels Thé Tip Top se distingue réellement.

**Axe horizontal, de la distribution large au circuit spécialisé.**
**Axe vertical, du produit conventionnel au produit intégralement bio et artisanal.**

```
                    100 % bio et fait main
                              ▲
                              │
                  Thé Tip Top ●
                              │
                   Kusmi Tea ●
                              │
                              │        ● Palais des Thés
  distribution ───────────────┼───────────────── circuit
  large                       │                  spécialisé
                              │
    Nature & Découvertes ●    │
                              │
                              ▼
                    gamme conventionnelle
```

**Lecture.** Kusmi Tea est le concurrent le plus proche sur l'axe du bio, mais il est distribué très largement, y compris en grande surface et en corner. Palais des Thés est proche sur le circuit spécialisé mais sa gamme n'est pas intégralement bio. Nature & Découvertes est loin sur les deux axes, il capte l'intention cadeau et non l'intention thé.

**Position actuelle de Thé Tip Top.** En haut à gauche du quadrant spécialisé, seule marque à cumuler l'intégralité bio, le fait main et un réseau de boutiques en propre.

**Position visée.** Même position sur les deux axes, mais avec un déplacement vers la droite en notoriété. C'est l'objet du jeu-concours : ne pas changer de positionnement, mais le faire connaître. Le futur site de vente en ligne prolongera ce mouvement sans compromettre le circuit spécialisé, contrairement à une entrée en grande distribution.
