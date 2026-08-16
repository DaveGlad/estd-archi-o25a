# A. Descriptifs

## A.1 Présentation du client

### Storytelling

Thé Tip Top vend du thé, mais l'entreprise ne se définit pas par le produit. Elle se définit par une exigence : ne proposer que des thés dont elle connaît l'origine, la fabrication et le mode de récolte. Tous ses thés sont bio, tous sont préparés à la main.

Cette exigence se retrouve dans la gamme, qui ne se contente pas des classiques. À côté des thés blancs et des infusions, la maison a développé ses propres mélanges signatures, des thés détox et une gamme de thés légumes que l'on trouve rarement ailleurs. Ce sont ces créations qui font revenir les clients, et qui rendent la marque difficile à confondre avec une enseigne de grande distribution.

Le réseau s'est construit boutique après boutique, sans précipitation. L'ouverture du dixième point de vente, à Nice, marque une étape : celle où une maison de quartier devient une enseigne nationale. C'est le moment que l'entreprise choisit pour se faire connaître au-delà de sa clientèle habituelle, en organisant un jeu-concours qui donne une raison de pousser la porte à ceux qui ne l'ont jamais fait.

### Informations juridiques

| Champ | Valeur |
|---|---|
| Dénomination sociale | Thé Tip Top |
| Forme juridique | Société anonyme |
| Capital social | 150 000 € |
| Siège social | 18 rue Léon Frot, 75011 Paris |
| Dirigeant | Mr Eric Bourdon |
| RCS | *(Paris, numéro à définir)* |
| SIREN et SIRET | *(à définir, cohérents entre eux)* |
| Code APE ou NAF | *(à définir, commerce de détail alimentaire spécialisé)* |
| TVA intracommunautaire | *(à définir, FR, clé et SIREN)* |
| Nombre de points de vente | 10, dont Nice |

> Point de vigilance à trancher avec le client. Le brief désigne Mr Bourdon comme « gérant » tout en indiquant que l'entreprise est une société anonyme. Or le gérant est le dirigeant d'une SARL. Dans une SA, la direction est assurée par un président du conseil d'administration et un directeur général, ou par un président-directeur général. Il faut donc soit retenir la SA et parler de président-directeur général, soit retenir la SARL et conserver le titre de gérant. Nous partons sur la première hypothèse, cohérente avec un capital de 150 000 € et un réseau de dix boutiques, et le mentionnons ici parce que ces informations figurent dans les documents contractuels.

### SWOT

> Les cellules marquées d'un astérisque doivent être complétées à partir de l'étude de marché et du benchmark de la partie C. Le SWOT se construit au fil de ces analyses, il n'est figé qu'à la fin.

| Forces | Faiblesses |
|---|---|
| Gamme différenciante : mélanges signatures, thés légumes, thés détox | Aucune présence commerciale en ligne à ce jour |
| Produits 100 % bio et faits main, cohérents avec les attentes actuelles | Notoriété concentrée sur les zones de chalandise des boutiques |
| Réseau physique de 10 boutiques, avec un contact client direct | Identité visuelle vieillissante, à refondre |
| Croissance maîtrisée, qui a permis de tenir le niveau de qualité | Pas de base de données clients exploitable pour la communication |
| Trésorerie permettant d'investir dans une opération de notoriété | Présence sur les réseaux sociaux faible ou inexistante * |

| Opportunités | Menaces |
|---|---|
| Progression du marché des thés bio et des infusions * | Concurrence d'enseignes spécialisées mieux implantées en ligne * |
| Intérêt croissant pour le bien-être et la consommation responsable * | Grande distribution proposant des gammes bio à prix inférieurs * |
| Ouverture de Nice, qui donne un prétexte de communication | Saisonnalité marquée du thé, forte en hiver, creuse en été * |
| Projet de site de vente en ligne, qui prolongera l'opération | Réglementation stricte sur les jeux-concours et sur le démarchage |
| Le jeu-concours permet de constituer une base de contacts consentants | Risque d'image si le jeu est perçu comme mal organisé |

## A.2 Présentation du projet

### Le besoin, reformulé

Thé Tip Top ouvre sa dixième boutique à Nice. Plutôt que de traiter cette ouverture comme un événement local, l'entreprise veut en faire le point de départ d'une opération nationale de notoriété. Le moyen retenu est un jeu-concours par tirage au sort, ouvert à tout client dont le ticket de caisse ou la facture dépasse 49 €.

Derrière l'opération commerciale, le besoin réel est double.

Le premier est un besoin de notoriété. L'entreprise est connue de ses clients, pas du grand public. Un jeu où tous les tickets sont gagnants donne une raison concrète d'entrer en boutique, et un contenu partageable sur les réseaux sociaux.

Le second est un besoin de connaissance client. Thé Tip Top vend aujourd'hui sans savoir à qui. Pour participer, le joueur doit créer un compte, ce qui permet de constituer une base de contacts qualifiés et consentants. Cette base servira bien au-delà du jeu, en particulier au lancement du futur site de vente en ligne.

Le jeu-concours est donc autant un outil de collecte qu'une opération promotionnelle. Cette double finalité doit être annoncée clairement au joueur, ce qui est à la fois une obligation légale et une condition de confiance.

### Ce que nous livrons

| Livrable | Contenu |
|---|---|
| Site du jeu-concours | Une application web publique et une interface d'administration, adossées à une API |
| Base des 500 000 codes | Codes générés avec leur lot déjà attribué, respectant la répartition annoncée |
| Nouvelle identité visuelle | Logo et univers graphique de la marque, plus le visuel du jeu-concours |
| Dispositif de communication | Stratégie sociale, partenariats d'influence, emailing, référencement |
| Mesure des résultats | Suivi d'audience configuré, avec les indicateurs définis en partie D |
| Documents légaux | Mentions légales, conditions générales d'utilisation, politique de confidentialité |

### Ce que nous ne livrons pas

Le site vitrine et le futur site de vente en ligne de Thé Tip Top sortent du périmètre. Ils seront réalisés par une autre agence, à partir de l'identité visuelle que nous créons.

Cette répartition a une conséquence directe sur la conception. L'API que nous développons doit pouvoir être consommée par ce futur site, ainsi que par les caisses en magasin. Elle est donc conçue comme un service documenté et versionné, pas comme un composant interne au site du jeu.

### Contraintes

| Contrainte | Nature | Conséquence sur le projet |
|---|---|---|
| Le jeu dure 30 jours, suivis de 30 jours de réclamation | Calendaire | Le site doit être ouvert avant l'impression des premiers tickets, et rester en ligne 60 jours au minimum |
| Les 500 000 codes existent avant l'ouverture | Technique | La génération et son contrôle sont un préalable au lancement, pas une fonctionnalité livrée en cours de route |
| Règlement déposé chez un huissier | Juridique | Les règles annoncées ne peuvent plus être modifiées après le dépôt, y compris la répartition des lots |
| Tirage du gros lot sous contrôle d'huissier | Juridique | Le tirage doit être reproductible et vérifiable |
| Le nombre de participations n'augmente pas les chances | Juridique | Contrainte d'algorithme, pas seulement de rédaction du règlement |
| Collecte de données personnelles | Juridique | Consentement, information, droits d'accès et d'effacement à prévoir dès la conception |
| Accessibilité et référencement demandés | Fonctionnelle | Pris en compte pendant le développement, pas ajoutés à la fin |
| Démarche responsable souhaitée | Fonctionnelle | Concerne les choix techniques autant que les préconisations marketing |
| Ouverture de la boutique de Nice | Calendaire | Le lancement du jeu est calé sur cette date, qui ne bouge pas |

La contrainte la plus structurante est la troisième. Une fois le règlement déposé, la répartition des lots devient un engagement opposable. Cela interdit toute correction discrète du dispositif après le lancement, et explique le niveau de contrôle prévu sur la génération des codes en partie F.

## A.3 Présentation de notre agence

### Storytelling

Furious Ducks est née en 2007. À l'époque, le web français se partageait entre des agences de communication qui sous-traitaient toute la technique et des sociétés de services qui ignoraient le design. Guido Brasletti a fait un pari à contre-courant : construire une agence maîtrisant la chaîne complète, et l'assumer avec des technologies open source, alors que le marché imposait des solutions propriétaires coûteuses en licences.

Dix-huit ans plus tard, l'agence compte 45 collaborateurs et a livré plusieurs centaines de projets, du site vitrine à l'application métier. L'open source n'y est pas un argument commercial, c'est une méthode de travail : pas d'enfermement propriétaire pour les clients, une capacité d'audit du code, et des compétences qui se transmettent d'un projet à l'autre.

Pour Thé Tip Top, cette maîtrise technique compte plus que d'habitude. Un jeu-concours dont le règlement est déposé chez un huissier ne tolère pas l'à-peu-près sur l'attribution des lots.

### Informations juridiques

| Champ | Valeur |
|---|---|
| Dénomination sociale | Furious Ducks |
| Forme juridique et capital | *(à définir, voir `01-pilotage/DECISIONS.md` § 2)* |
| Siège social | *(à définir)* |
| RCS, SIREN, SIRET | *(à définir, cohérents entre eux)* |
| Code APE ou NAF | 6201Z, programmation informatique |
| TVA intracommunautaire | *(à définir)* |
| Date de création | 2007 |
| Effectif | 45 salariés |
| Direction | Mr Guido Brasletti |

## A.4 Comité de pilotage

Le comité de pilotage réunit les personnes qui décident et celles qui produisent. Il se réunit à chaque fin de sprint, soit toutes les deux semaines, et à chaque jalon du projet.

### Maîtrise d'ouvrage, Thé Tip Top

| Nom | Fonction | Rôle dans le projet | Coordonnées | Disponibilités |
|---|---|---|---|---|
| Eric Bourdon | Direction générale | Décisionnaire final, valide le budget et l'identité visuelle | *(adresse, mail, téléphone)* | *(jours et horaires)* |
| *(à définir)* | Responsable marketing | Interlocuteur principal au quotidien, valide les contenus et le dispositif de communication | *(à compléter)* | *(à compléter)* |
| *(à définir)* | Responsable du réseau de boutiques | Représente les employés en boutique, valide le parcours de remise des lots | *(à compléter)* | *(à compléter)* |

### Maîtrise d'œuvre, Furious Ducks

| Nom | Fonction | Rôle dans le projet | Coordonnées | Disponibilités |
|---|---|---|---|---|
| *(R1)* | Chef de projet | Pilotage, planning, budget, interlocuteur du responsable marketing | *(à compléter)* | *(à compléter)* |
| *(R2)* | Chargé de communication digitale | Stratégie éditoriale, réseaux sociaux, emailing, mesure d'audience | *(à compléter)* | *(à compléter)* |
| *(R3)* | Développeur et référent technique | Architecture, API, base de données, mise en ligne | *(à compléter)* | *(à compléter)* |
| *(R4)* | Graphiste et référent expérience utilisateur | Identité visuelle, maquettes, accessibilité | *(à compléter)* | *(à compléter)* |

### Règles de continuité

Pour chaque intervenant doivent figurer les jours et horaires de travail, les congés prévus sur la durée du projet, et la personne à contacter en cas d'absence. Ces informations sont à compléter dans `01-pilotage/DECISIONS.md` § 1 avant l'export du dossier.

Cette règle n'est pas une formalité. Le jeu-concours a une date d'ouverture qui ne se décale pas. Si le seul interlocuteur capable de valider un visuel est en congés la semaine du lancement, le projet s'arrête. Chaque rôle a donc un suppléant identifié.

| Rôle | Suppléant désigné |
|---|---|
| Décisionnaire client | Responsable marketing, dans la limite des montants engagés |
| Interlocuteur quotidien client | Responsable du réseau de boutiques |
| Chef de projet | Développeur référent |
| Référent technique | Chef de projet, pour les décisions non techniques uniquement |

## A.5 Descriptif rédactionnel fonctionnel

### Ce que voit un visiteur non connecté

Un visiteur arrive le plus souvent depuis un réseau social, un lien envoyé par un ami, ou l'adresse imprimée sur son ticket de caisse. Il ne sait pas nécessairement de quoi il s'agit, et il arrive avec un ticket à la main. La page d'accueil doit donc répondre à trois questions en quelques secondes : de quoi s'agit-il, qu'est-ce que je peux gagner, et comment je participe.

Le visiteur peut consulter librement la présentation du jeu, la liste des lots et leurs valeurs, les modalités de participation et le règlement complet. Il peut également consulter la liste des boutiques et accéder aux pages légales. Il ne peut en revanche pas saisir de code : la participation suppose un compte, puisqu'un gain doit être rattaché à une personne identifiable pour être remis.

Cette contrainte est présentée comme une étape du parcours et non comme un obstacle. Le visiteur qui saisit son code sans être connecté est invité à créer son compte, et son code est conservé pour être appliqué automatiquement après l'inscription.

### Ce que fait un client connecté

Le client crée son compte de trois façons au choix : par formulaire classique, avec son compte Google, ou avec son compte Facebook. Les deux dernières réduisent la friction au moment où elle coûte le plus cher, c'est-à-dire quand le client a son ticket en main et veut savoir ce qu'il a gagné.

Quel que soit le mode d'inscription, le client renseigne son genre et sa date de naissance. Ces données servent aux statistiques de gagnants demandées par le client, ce qui est indiqué au moment de la collecte.

Une fois connecté, il saisit le code à dix caractères figurant sur son ticket. Le site vérifie que le code existe, qu'il n'a pas déjà été joué et que le jeu est ouvert, puis affiche immédiatement le lot gagné, ses modalités de retrait et sa date limite de réclamation. Une confirmation lui est envoyée par courriel.

Il retrouve ensuite l'ensemble de ses gains dans son espace personnel, avec pour chacun le statut, à réclamer, remis ou expiré, et la date limite. Il peut jouer autant de codes qu'il possède de tickets éligibles.

Son espace personnel lui permet enfin de modifier ses informations, de gérer son consentement à recevoir des communications, de télécharger ses données et de demander la suppression de son compte.

### Ce que fait un employé en boutique

L'employé dispose d'une interface distincte du site public. Il y recherche un client par son nom, son adresse de courriel ou le code de son ticket, consulte les gains de ce client avec leur statut, puis enregistre la remise du lot après l'avoir remis physiquement.

L'interface ne lui donne accès qu'aux informations nécessaires à cette opération. Il ne voit ni la date de naissance, ni les préférences de communication, ni l'historique complet du client.

Chaque remise est enregistrée avec l'identité de l'employé, la boutique et l'horodatage. Un lot déjà remis ne peut plus l'être une seconde fois, et l'interface affiche alors qui l'a remis et quand. Un lot dont la date limite est dépassée apparaît comme expiré et ne peut plus être délivré.

### Ce que fait un administrateur

L'administrateur accède au tableau de bord de l'opération. Il y suit le nombre de codes distribués et utilisés, la répartition des lots gagnés, le nombre de lots effectivement remis, et le profil des gagnants par tranche d'âge et par genre.

Il peut extraire la liste des participants ayant consenti à recevoir des communications, afin d'alimenter les campagnes d'emailing. Cette extraction est limitée aux personnes ayant explicitement donné leur accord, et l'opération est tracée.

Il paramètre également le jeu : dates d'ouverture et de clôture, date limite de réclamation, montant minimum d'achat, lots et répartition. Ces paramètres sont figés une fois le règlement déposé chez l'huissier, mais leur présence dans l'interface permet de réutiliser le dispositif pour une future opération.

À la clôture, il déclenche le tirage au sort du gros lot. Le tirage est exécuté par le serveur, porte sur les participants distincts et non sur les participations, et conserve les éléments permettant de le rejouer devant l'huissier.

### Ce que le site échange avec l'extérieur

L'API alimente le site, mais elle doit aussi servir deux autres consommateurs.

Les caisses en magasin, d'une part, pour transmettre les tickets émis et vérifier un code présenté par un client au comptoir.

Le futur site de vente en ligne, d'autre part, qui devra pouvoir consulter les gains d'un client pour lui permettre de réclamer son lot lors d'une commande.

L'API est donc versionnée, documentée et sécurisée par des clés distinctes selon le consommateur. C'est une contrainte structurante, exprimée par le client dès le brief.

### Contraintes techniques exprimées par le client

Quatre exigences ont été formulées explicitement et s'appliquent à l'ensemble des fonctionnalités décrites ci-dessus.

Le site doit être accessible depuis tous les appareils, ce qui suppose une conception pensée d'abord pour le mobile, une part importante du trafic étant attendue depuis les réseaux sociaux.

Il doit respecter les bonnes pratiques d'accessibilité, afin que le jeu reste utilisable par des personnes en situation de handicap.

Il doit respecter les bonnes pratiques de référencement, pour être trouvé par les personnes qui chercheront l'opération sans connaître l'adresse exacte.

Il doit enfin être conforme au règlement général sur la protection des données, ce qui concerne la collecte, l'information, la conservation et la suppression des données des participants.
