# D.3 Référencement naturel

## Ce qu'est le référencement naturel, et pourquoi Google

Le référencement naturel regroupe les techniques qui permettent à un site d'apparaître dans les résultats non payants d'un moteur de recherche. Il se distingue du référencement payant, qui achète une position.

Se caler sur les algorithmes de Google n'est pas un choix idéologique, c'est un constat de part de marché : en France, la très grande majorité des recherches y transitent. Optimiser pour Google revient de fait à optimiser pour l'ensemble du marché, d'autant que les critères des autres moteurs en sont proches.

## Ce que ce pilier doit produire

| Objectif | Indicateur |
|---|---|
| Être trouvé par ceux qui cherchent l'opération sans connaître l'adresse | Trafic organique sur les requêtes de marque |
| Capter la recherche d'information sur le jeu | Positions sur « jeu concours thé », « thé tip top jeu » |
| Soutenir la notoriété au-delà du jeu | Positions sur les requêtes bio et artisanat |
| Ne pas gaspiller le budget d'exploration | Pages privées exclues de l'indexation |

## Audit de mots-clés

> Les volumes ci-dessous sont à confirmer avec un outil de mesure. La méthode et la hiérarchie, elles, sont arrêtées.

### Requêtes de marque, priorité absolue

| Requête | Intention | Page cible |
|---|---|---|
| thé tip top | Navigation | Accueil |
| thé tip top jeu concours | Navigation | Accueil |
| thé tip top code ticket | Transaction | Participer |
| the tiptop, thétiptop | Fautes courantes | Accueil |

Ce sont les requêtes qui comptent le plus. Une personne qui a vu une publication sur Instagram tapera le nom de la marque, pas l'adresse exacte du site. Si le site du jeu n'arrive pas en premier, le trafic part ailleurs.

### Requêtes liées à l'opération

| Requête | Intention | Page cible |
|---|---|---|
| jeu concours thé | Découverte | Accueil |
| jeu concours 100 % gagnant | Découverte | Accueil |
| gagner du thé | Découverte | Les lots à gagner |
| règlement jeu concours thé | Information | Règlement |

### Requêtes de fond, qui servent après le jeu

| Requête | Intention | Page cible |
|---|---|---|
| thé bio français | Information | Page concept |
| thé fait main | Information | Page concept |
| boutique thé Nice | Locale | Nos boutiques |
| coffret thé bio | Transaction | Les lots à gagner, puis futur site marchand |

### Saisonnalité à exploiter

L'étude de marché en partie C.1 établit que novembre est le deuxième meilleur mois de l'année dans l'univers du thé, et que juillet et août sont creux. Les requêtes suivent cette courbe.

Conséquence : les contenus doivent être publiés et indexés **avant** la montée saisonnière, c'est-à-dire en septembre et octobre, pas au lancement du jeu. Un contenu publié le jour de l'ouverture arrivera trop tard pour être positionné.

## Les bonnes pratiques, avec leur application au projet

| Bonne pratique | Application concrète à Thé Tip Top |
|---|---|
| Une balise title unique par page, de 50 à 60 caractères | « Le Grand Jeu Thé Tip Top, 100 % des tickets sont gagnants ». Le title de Nature & Découvertes fait 73 caractères et se voit tronqué, relevé en C.2 |
| Une meta description de 150 à 160 caractères, incitative | Celle de la page d'accueil annonce le seuil de 49 euros et la promesse. Elle n'est pas un résumé, c'est une accroche |
| Un seul h1 par page | Vérifié sur les trois concurrents, tous conformes. Le nôtre l'est aussi |
| Une hiérarchie hn cohérente | Chaque section porte son h2, chaque carte son h3 |
| Des URL lisibles | `/jeu-concours/lots`, pas `/page?id=42` |
| Un maillage interne dirigé | Chaque page mène à « Saisir mon code », qui est la conversion |
| Un fichier sitemap.xml | Généré depuis le code, treize URL publiques, mis à jour automatiquement |
| Un fichier robots.txt | Bloque `/admin`, `/employe` et `/mon-compte`, inutiles à explorer |
| HTTPS partout | Certificat renouvelé automatiquement, redirection systématique |
| Des données structurées | Quatre types : organisation, site, fil d'Ariane, questions fréquentes. Les concurrents en ont de un à trois |
| Un aperçu de partage maîtrisé | Image générée à la volée aux couleurs de la charte. Nature & Découvertes n'a pas d'Open Graph, relevé en C.2 |
| Des images légères et décrites | Format nouvelle génération, attribut alt sur toutes |
| Un site rapide sur mobile | Rendu côté serveur, pas de bibliothèque inutile sur les pages publiques |
| Un contenu qui répond à une question | La rubrique des questions fréquentes est balisée pour l'affichage enrichi |

## Contenu rédigé de la page d'accueil

> Ce contenu est celui qui figure sur le site. Les balises et les liens sont indiqués entre crochets.

**[title]** Le Grand Jeu Thé Tip Top, 100 % des tickets sont gagnants

**[meta description]** Pour l'ouverture de notre dixième boutique à Nice, tout ticket de caisse de plus de 49 € porte un code gagnant. Saisissez le vôtre et découvrez votre lot.

**[h1]** 100 % des tickets sont gagnants. Le vôtre aussi.

Pour fêter notre arrivée à Nice, chaque ticket de caisse de plus de 49 € porte un code gagnant. Infuseur, boîte de thé, coffret découverte, et une année de thé à gagner au tirage au sort.

**[bouton, lien vers /participer]** Saisir mon code
**[bouton secondaire, lien vers /jeu-concours/lots]** Voir les lots

**[h2]** Comment participer

Trois étapes, deux minutes, et aucun achat supplémentaire.

**[h3]** Achetez en boutique
Tout ticket de caisse ou facture de plus de 49 € porte un code à dix caractères, imprimé sous le montant total.

**[h3]** Saisissez votre code
Créez votre compte en quelques secondes, par formulaire ou en un clic, puis entrez le code de votre ticket.

**[h3]** Récupérez votre lot
En boutique ou en ligne, jusqu'à trente jours après la clôture du jeu. Aucun achat supplémentaire.

**[h2]** Les lots à gagner

Cinq lots, répartis sur les 500 000 codes du jeu.

**[h3]** Un infuseur à thé, 60 % des tickets
Infuseur en acier inoxydable gravé, livré dans sa pochette en coton bio.

**[h3]** Une boîte de 100 g de thé détox ou d'infusion, 20 % des tickets
Au choix parmi nos détox et nos infusions, toutes préparées à la main.

**[h3]** Une boîte de 100 g de thé signature, 10 % des tickets
Un de nos mélanges maison, créés et assemblés dans notre atelier.

**[h3]** Un coffret découverte à 39 €, 6 % des tickets
Cinq thés à découvrir, présentés dans un coffret en bois.

**[h3]** Un coffret découverte à 69 €, 4 % des tickets
Notre plus grand coffret : neuf thés, un infuseur et un carnet de dégustation.

**[lien vers /jeu-concours/lots]** Tout voir

**[h2]** Dix boutiques, une même exigence

Nos thés sont bio et assemblés à la main dans notre atelier. Depuis notre première boutique parisienne jusqu'à celle de Nice, nous ne vendons que ce dont nous connaissons l'origine.

**[lien vers /boutiques]** Trouver une boutique

## Contenu rédigé de la page de présentation du concept

> Cette page n'existe pas encore sur le site. Elle est à créer à l'adresse `/le-concept`, et à ajouter au sitemap ainsi qu'à la navigation du pied de page.

**[title]** Thé Tip Top, des thés bio assemblés à la main depuis 2014

**[meta description]** Dix boutiques, une seule exigence : ne vendre que des thés dont nous connaissons l'origine. Mélanges signatures, thés détox, thés légumes, tous bio et faits main.

**[h1]** Des thés dont nous connaissons l'origine

Thé Tip Top vend du thé. Mais ce n'est pas le produit qui nous définit, c'est une exigence : ne proposer que des thés dont nous connaissons la provenance, la fabrication et le mode de récolte. Tous nos thés sont bio. Tous sont préparés à la main.

**[h2]** Une gamme que l'on ne trouve pas ailleurs

À côté des classiques, thés blancs et infusions, nous avons développé nos propres créations. Les mélanges signatures, assemblés dans notre atelier. Les thés détox, pensés pour un moment précis de la journée. Et les thés légumes, une famille que l'on rencontre rarement en boutique.

Ce sont ces créations qui font revenir nos clients, et qui rendent notre maison difficile à confondre avec une enseigne de grande distribution.

**[h2]** Le bio n'est pas un argument, c'est notre méthode

**[lien vers /boutiques]** Nos dix boutiques

En France, le bio représente aujourd'hui près d'un tiers du marché du thé et progresse d'environ 12 % par an. Nous n'avons pas suivi cette tendance, nous l'avons précédée : notre gamme est intégralement bio depuis l'origine.

Concrètement, cela veut dire que nous refusons des thés. Un thé qui nous plaît mais dont nous ne pouvons pas remonter la chaîne ne rentre pas dans nos boutiques.

**[h2]** Fait main, et cela se goûte

Nos mélanges sont assemblés à la main dans notre atelier, par petites quantités. C'est plus long et plus coûteux qu'un assemblage industriel. C'est aussi la seule façon de garantir qu'une boîte achetée en novembre ait le même goût qu'une boîte achetée en mars.

**[h2]** Dix boutiques, et bientôt en ligne

Notre réseau s'est construit boutique après boutique, sans précipitation, de Paris à Nice. L'ouverture de notre dixième adresse marque une étape.

**[lien vers /]** Découvrir notre jeu-concours d'ouverture

## Ce qui reste à faire sur ce pilier

| Tâche | Titulaire | Échéance |
|---|---|---|
| Confirmer les volumes de recherche avec un outil de mesure | R2 | Avant l'export du dossier |
| Créer la page `/le-concept` sur le site | R4 | 18 octobre |
| L'ajouter au sitemap et au pied de page | R3 | 18 octobre |
| Vérifier l'indexation après la mise en ligne | R2 | Semaine du 9 novembre |
