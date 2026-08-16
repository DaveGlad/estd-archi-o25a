# F. Cahier des clauses techniques détaillées

## F.1 Technologies et compatibilité

### Technologies retenues

| Couche | Technologie | Justification |
|---|---|---|
| Site public | Next.js, React, TypeScript | Le rendu côté serveur est indispensable au référencement, qui fait partie des exigences du client. Il améliore aussi le temps d'affichage sur mobile, ce qui compte pour une opération dont le trafic viendra en grande partie des réseaux sociaux |
| Mise en forme | Tailwind CSS, bibliothèque de composants accessibles | Les composants retenus gèrent nativement la navigation au clavier et les attributs ARIA, ce qui fait gagner beaucoup de temps sur l'exigence d'accessibilité |
| Back-office et espace employé | Next.js, application distincte du site public | Séparer les interfaces d'administration du site grand public réduit la surface exposée et permet des droits d'accès distincts |
| API | NestJS, TypeScript, REST versionnée, documentée avec Swagger | L'API ne sert pas que le site. Elle doit aussi répondre aux caisses en magasin et au futur site de vente en ligne, qui sera développé par une autre agence. Une documentation générée automatiquement devient alors le contrat entre les deux prestataires |
| Accès aux données | Prisma | Les migrations sont versionnées et rejouables, ce qui permet au workflow d'intégration continue de les appliquer automatiquement sur chaque environnement |
| Base de données | PostgreSQL | Nécessaire pour insérer et interroger efficacement 500 000 codes. Licence open source, ce qui correspond au positionnement de l'agence |
| Cache et limitation de débit | Redis | Sert à limiter les tentatives de saisie de codes, ce qui rend inintéressante toute tentative de deviner des codes valides |
| Authentification | Bibliothèque gérant à la fois les comptes par formulaire et les fournisseurs externes | Le client demande explicitement l'inscription par formulaire classique et par compte Google ou Facebook. Une brique unique évite de maintenir trois chemins d'authentification différents |
| Langage commun | TypeScript sur toute la chaîne | Les types du modèle de données sont partagés entre l'API et les interfaces, ce qui supprime une catégorie entière d'erreurs entre le front et le back |

### Compatibilité navigateurs

> Les versions minimales ci-dessous doivent être confirmées dans le dossier par une source citée, par exemple les parts de marché issues d'un service de statistiques de navigation et les tables de support des fonctionnalités utilisées.

| Navigateur | Version minimale visée | Remarque |
|---|---|---|
| Chrome, ordinateur et Android | 2 dernières versions majeures | Navigateur majoritaire sur la cible |
| Safari, macOS | 2 dernières versions majeures | |
| Safari, iOS | 2 dernières versions majeures | Trafic mobile important attendu depuis les réseaux sociaux |
| Firefox | 2 dernières versions majeures | |
| Edge | 2 dernières versions majeures | |
| Navigateurs plus anciens | Non supportés officiellement | Le site reste consultable, la mise en forme peut être dégradée |

Le principe retenu est celui de l'amélioration progressive. Le contenu et le parcours de participation restent accessibles même si certaines fonctionnalités d'affichage récentes ne sont pas disponibles. Un joueur ne doit pas se retrouver bloqué parce que son téléphone a trois ans.

Internet Explorer n'est pas supporté, ce navigateur n'étant plus maintenu par son éditeur.

### Contraintes d'affichage

| Contrainte | Engagement |
|---|---|
| Affichage adaptatif | Ordinateur, tablette et smartphone, conception pensée d'abord pour le mobile |
| Accessibilité | Respect des critères d'accessibilité des contenus web, contrastes vérifiés dans la charte graphique |
| Performance | Le parcours de participation doit rester utilisable sur une connexion mobile moyenne |
| Sans JavaScript | Les pages de contenu restent lisibles. La participation nécessite en revanche JavaScript activé |

## F.2 Logiciels et outils

| Domaine | Outils | Usage |
|---|---|---|
| Gestion de projet | Trello ou Notion, GanttProject | Suivi des tâches, comptes rendus de réunion, diagramme de Gantt et diagramme des ressources |
| Conception et graphisme | Outil de maquettage collaboratif, suite graphique | Zoning, wireframes, maquettes, création du logo et de la charte |
| Modélisation | Outil de diagrammes UML et BPMN | Cas d'utilisation, activité, séquence, MCD et MLD, procédures du workflow |
| Développement | Éditeur de code, gestionnaire de versions Git | Écriture du code et suivi des modifications |
| Base de données | Client d'administration PostgreSQL | Consultation, vérification des jeux de données, contrôle de la répartition des lots |
| Conteneurisation | Docker et Docker Compose | Environnements reproductibles, identiques du poste de travail à la production |
| Intégration continue | Jenkins | Build, tests, déploiements, publication des rapports |
| Audits techniques | Analyseur de performances, extension d'identification des technologies | Benchmark des concurrents et contrôle de notre propre site |
| Audits d'accessibilité | Outil d'évaluation d'accessibilité, analyseur de contrastes | Vérification des critères pendant le développement, pas seulement à la fin |
| Audits d'éco-conception | Outil d'analyse d'empreinte de page | Démarche RSE demandée par le client |
| Référencement | Outil d'analyse de mots-clés, console de recherche | Audit de mots-clés et suivi de l'indexation |
| Mesure d'audience | Google Analytics | Suivi des indicateurs définis en partie D |

## F.3 Tests applicatifs

### Pourquoi cette stratégie

Le site du jeu-concours a une particularité : il ne peut pas être corrigé tranquillement après coup. Le jeu dure 30 jours, les codes sont imprimés sur des tickets déjà distribués, et le règlement est déposé chez un huissier. Un défaut sur l'attribution des lots ne se rattrape pas par une mise à jour.

Les tests sont donc dimensionnés en fonction du risque, et non répartis uniformément.

### Les quatre familles de tests

| Famille | Périmètre | Outil | Exécution |
|---|---|---|---|
| Tests unitaires | Fonctions de calcul et règles métier prises isolément | Vitest | À chaque commit, dans la CI |
| Tests d'intégration | API et base de données ensemble, transactions, contraintes d'unicité | Vitest avec une base de test conteneurisée | À chaque commit, dans la CI |
| Tests fonctionnels | Parcours complets dans un vrai navigateur | Playwright | Après déploiement en développement et en préproduction |
| Tests de performance | Comportement en charge sur la base complète | k6 | En préproduction, avant chaque livraison |

### Ce qui est testé en priorité

| Élément critique | Type de test | Ce qu'on vérifie |
|---|---|---|
| Répartition des 500 000 codes | Intégration | Le recomptage en base donne exactement 60, 20, 10, 6 et 4 % |
| Unicité des codes | Intégration | Aucun doublon sur 500 000 générations |
| Un code joué une seule fois | Intégration | Deux requêtes simultanées sur le même code ne créent qu'une participation |
| Un lot remis une seule fois | Intégration | Deux remises simultanées échouent sauf une |
| Tirage du gros lot | Unitaire | Un participant ayant joué 20 codes n'a pas plus de chances qu'un autre |
| Reproductibilité du tirage | Unitaire | À graine identique, le résultat est identique |
| Expiration des gains | Unitaire | Un gain non réclamé passe à expiré au bon moment |
| Parcours de participation | Fonctionnel | De la connexion à l'affichage du lot |
| Parcours de remise | Fonctionnel | De la recherche du client à l'enregistrement |
| Inscription par fournisseur externe | Fonctionnel | Google et Facebook, et le rattachement à un compte existant |
| Recherche d'un code | Performance | Temps de réponse stable sur une base de 500 000 lignes |
| Montée en charge | Performance | Comportement lors d'un pic de participation après une publication sur les réseaux |

Le test de répartition mérite d'être souligné auprès du client. C'est lui qui prouve que l'engagement pris dans le règlement est effectivement tenu. C'est aussi la pièce à présenter en cas de contestation.

### Rapports de tests

Chaque exécution produit un rapport au format JUnit, format standard lisible par le serveur d'intégration continue. Les rapports sont publiés sur l'interface de la CI, archivés à chaque exécution, et consultables pour toute version passée.

Trois exports sont possibles : le rapport HTML consultable directement, le fichier XML exploitable par un autre outil, et l'historique de couverture, qui montre l'évolution dans le temps plutôt qu'une valeur isolée.

Un build dont les tests échouent ne produit pas d'image déployable. C'est ce qui rend la règle contraignante plutôt que déclarative.

## F.4 Hébergement et nom de domaine

> Ce que nous décrivons ici est ce que le client devrait prendre dans un cadre réel, et non l'hébergement retenu pour la maquette du projet de formation.

### Nom de domaine

| Élément | Préconisation | Justification |
|---|---|---|
| Domaine principal | Un nom court reprenant la marque, en `.fr` | Le jeu s'adresse à une clientèle française et le `.fr` renforce la crédibilité locale |
| Extensions défensives | Réservation du `.com` et d'une variante orthographique proche | Coût faible, évite qu'un tiers exploite la notoriété de l'opération |
| Durée | Réservation sur plusieurs années | Un domaine réservé pour un an inquiète les moteurs de recherche et se renouvelle mal |
| Protection des données | Anonymisation des coordonnées dans l'annuaire public | Limite le démarchage et l'hameçonnage |
| Certificat | Certificat renouvelé automatiquement, redirection systématique vers HTTPS | Le site collecte des données personnelles, le chiffrement n'est pas optionnel |

### Hébergement

Trois formules ont été comparées.

L'hébergement mutualisé est écarté : il ne permet pas d'exécuter une API et une base de données dans les conditions requises, et ne donne pas la maîtrise des sauvegardes.

Un service infogéré chez un fournisseur de cloud offrirait la meilleure disponibilité, mais son coût n'est pas justifié pour une opération de 60 jours dont la fréquentation est prévisible.

Un serveur virtuel dédié chez un hébergeur situé en Europe est la formule retenue. Elle offre la maîtrise complète de la configuration, un coût maîtrisé, et une localisation des données dans l'Union européenne, ce qui simplifie considérablement la conformité au RGPD.

| Caractéristique | Besoin | Justification |
|---|---|---|
| Processeur | 4 vCPU | Suffisant pour l'API et le site, avec de la marge pour les pics |
| Mémoire vive | 8 Go | API, base et cache, plus la marge nécessaire aux pics de participation |
| Disque | 100 Go SSD | La base de 500 000 codes reste modeste, l'espace sert surtout aux sauvegardes locales et aux journaux |
| Bande passante | Non limitée | Un pic après une publication d'influenceur ne doit pas déclencher de surfacturation |
| Localisation | Union européenne | Exigence RGPD, et latence réduite pour la cible française |
| Sauvegarde externalisée | Espace distinct chez un second prestataire | Une sauvegarde stockée chez le même hébergeur que la production ne protège pas d'une défaillance de cet hébergeur |

> Le coût mensuel de chaque poste est à confirmer au moment du devis, à partir des tarifs publics des prestataires retenus. Le total figure dans le devis principal de la partie J, et la comparaison des trois formules doit y apparaître.

### Niveaux de service attendus

| Indicateur | Engagement recherché |
|---|---|
| Taux de disponibilité | Au moins 99,9 % |
| Garantie de temps d'intervention | 1 heure |
| Garantie de temps de rétablissement | 4 heures ouvrées |

Un point à signaler au client : ces engagements portent sur l'infrastructure de l'hébergeur, pas sur l'application. La disponibilité du site dépend aussi de notre propre configuration, d'où la surveillance et les alertes mises en place.

### Stratégie de sauvegarde

| Élément | Fréquence | Rétention | Emplacement |
|---|---|---|---|
| Base de données | Quotidienne, avec journal de transactions archivé toutes les 15 minutes | 30 jours, plus 12 sauvegardes mensuelles | Externalisée, chiffrée |
| Fichiers téléversés | Quotidienne | 30 jours | Externalisée, chiffrée |
| Configuration serveur | À chaque modification | Illimitée | Versionnée dans Git |
| Images applicatives | À chaque livraison | 3 mois | Registre privé |

Deux objectifs chiffrés encadrent le dispositif. La perte de données maximale acceptable est de 15 minutes, ce qui justifie l'archivage du journal de transactions plutôt qu'une simple sauvegarde quotidienne. Le délai de remise en service visé est de 2 heures.

Un test de restauration est réalisé chaque mois et consigné. Pendant les 30 jours du jeu, ce test est hebdomadaire : c'est la période où une perte de données serait la plus coûteuse, puisqu'elle porterait sur des participations que les joueurs ne peuvent pas rejouer, leur code étant déjà consommé.
