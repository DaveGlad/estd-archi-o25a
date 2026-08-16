# D.6 Analyse de performance

## Principe

Aucune action n'est engagée sans savoir comment on la mesurera. Le tableau ci-dessous associe à chaque action de la stratégie ses indicateurs et l'outil qui les fournit.

## Indicateurs par action

### Le jeu-concours

| Indicateur | Cible | Outil |
|---|---|---|
| Codes utilisés sur codes émis | 25 % au minimum | Back-office |
| Participants distincts | 40 000 | Back-office |
| Participations par participant | Entre 1,5 et 3 | Back-office |
| Lots remis sur lots gagnés | 70 % | Back-office |
| Lots expirés | Moins de 30 % | Back-office |
| Répartition des gagnants par genre et par tranche d'âge | Pour information | Back-office |
| Répartition par boutique | Pour information, avec attention à Nice | Back-office |

Ces indicateurs sont produits par l'application elle-même, pas par un outil tiers. C'est ce qui les rend fiables et immédiatement disponibles.

### Le site

| Indicateur | Cible | Outil |
|---|---|---|
| Sessions | À établir après deux semaines de mesure | Google Analytics |
| Taux de participation, participations sur sessions | Supérieur à 30 % | Google Analytics et back-office |
| Taux de création de compte sur visites de la page d'inscription | Supérieur à 50 % | Google Analytics |
| Part du trafic mobile | Supérieure à 70 %, hypothèse à vérifier | Google Analytics |
| Pages vues par session | Supérieur à 3 | Google Analytics |
| Temps de chargement de la page de participation | Inférieur à 2 secondes sur mobile | Outil de mesure de performance |

### Les réseaux sociaux

| Indicateur | Cible | Outil |
|---|---|---|
| Abonnés gagnés | 5 000 cumulés | Statistiques natives, outil de gestion |
| Portée par publication | À établir | Statistiques natives |
| Taux d'engagement | Supérieur à 3 % en micro-audience | Statistiques natives |
| Trafic vers le site depuis les réseaux | À établir | Google Analytics, source du trafic |
| Participations attribuées à un partenaire d'influence | Par code de suivi | Google Analytics |

### L'emailing

| Indicateur | Cible | Outil |
|---|---|---|
| Consentements marketing recueillis | 25 000 | Back-office |
| Taux de délivrabilité | Supérieur à 98 % | Prestataire |
| Taux d'ouverture | 60 % en transactionnel, 25 % en lettre d'information | Prestataire |
| Lots réclamés après le mail de rappel | À mesurer avant et après | Back-office |

### Le référencement naturel

| Indicateur | Cible | Outil |
|---|---|---|
| Position sur les requêtes de marque | Première position | Console de recherche |
| Pages indexées | Les 13 URL publiques du sitemap | Console de recherche |
| Trafic organique | En progression continue | Google Analytics |
| Erreurs d'exploration | Zéro | Console de recherche |

## Le compte Google Analytics

Le sujet impose la création du compte, sa liaison au site, un tableau de bord personnalisé, quatre événements et un rapport personnalisé.

### Les quatre événements

| Événement demandé par le sujet | Transposition au projet | Déclencheur |
|---|---|---|
| Nombre de vues sur une page donnée | Page des lots à gagner | Affichage de `/jeu-concours/lots` |
| Soumission d'un formulaire | Création de compte | Envoi du formulaire d'inscription |
| Clic sur un appel à l'action | Bouton « Saisir mon code » | Clic, quelle que soit la page d'origine |
| Ajout au panier ou réservation | **Participation au jeu** | Validation d'un code, avec le lot gagné en paramètre |

Le quatrième mérite une explication, qui sera peut-être demandée à l'oral. Le sujet précise « selon le sujet » pour cet événement. Il n'y a ni panier ni réservation sur un site de jeu-concours. L'action équivalente, celle qui constitue la conversion recherchée, est la participation. C'est donc elle qui est instrumentée.

### Le tableau de bord personnalisé

Quatre blocs, correspondant aux objectifs de la partie D.

| Bloc | Contenu |
|---|---|
| Acquisition | Sessions par source, part du trafic social, part du trafic organique |
| Participation | Participations, taux de conversion, entonnoir de la page d'accueil à la validation du code |
| Public | Répartition par appareil, par ville, avec un focus sur Nice |
| Contenu | Pages les plus vues, pages de sortie, temps passé |

### Le rapport personnalisé

Un rapport intitulé « Suivi du jeu-concours », croisant la source de trafic, l'appareil et le taux de participation. C'est celui qui permettra de répondre à la seule question qui compte pour arbitrer le budget publicitaire : quel canal amène les personnes qui jouent réellement, et non celles qui passent.

## Contraintes légales liées à la mesure

| Contrainte | Mise en œuvre |
|---|---|
| Consentement préalable aux cookies de mesure | La mesure n'est déclenchée qu'après acceptation dans le bandeau |
| Refus aussi simple que l'acceptation | Le bandeau propose un refus en un clic, au même niveau visuel que l'acceptation |
| Choix modifiable | Page de gestion des cookies accessible depuis le pied de page |
| Durée de conservation | Treize mois, indiquée dans la politique de confidentialité |
| Anonymisation | Aucune donnée directement identifiante transmise à l'outil de mesure |
| Information des personnes | Le traitement figure dans le tableau de la politique de confidentialité |

Une conséquence à annoncer au client : puisque la mesure dépend du consentement, les chiffres de fréquentation seront inférieurs à la réalité. Les indicateurs produits par le back-office, eux, sont exhaustifs, puisqu'ils relèvent de l'exécution du jeu et non de la mesure d'audience. C'est sur eux qu'il faut fonder le bilan, pas sur l'outil de mesure.

## Rythme de suivi

| Fréquence | Contenu | Destinataire |
|---|---|---|
| Quotidien pendant le jeu | Participations du jour, incidents | Équipe projet |
| Hebdomadaire pendant le jeu | Acquisition, participation, réseaux sociaux | Chef de projet et client |
| Mensuel | Rapport complet, avec recommandations | Client, en comité de pilotage |
| Fin d'opération | Bilan sur les cinq objectifs SMART | Direction de Thé Tip Top |

## Les livrables concrets attendus

| Livrable | État |
|---|---|
| Compte Google Analytics créé et lié au site | À faire, R2, échéance 30 septembre |
| Les quatre événements configurés | À faire, R2 avec R3, échéance 8 novembre |
| Tableau de bord personnalisé | À faire, R2, échéance 8 novembre |
| Rapport personnalisé | À faire, R2, échéance 8 novembre |
| Captures d'écran pour le dossier | À faire, R2 |

Les identifiants sont à reporter dans le document d'accès du 16 novembre.
