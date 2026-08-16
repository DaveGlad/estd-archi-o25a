# A. État des lieux

## A.1 Présentation de l'agence

> Les éléments entre guillemets sont fictifs et doivent être figés dans `01-pilotage/DECISIONS.md` § 2 avant l'export du dossier. Les données factuelles (2007, 45 employés, Guido Brasletti, open source, cycle en V) viennent du sujet.

### Storytelling

Furious Ducks est née en 2007. À cette époque, le web français se partageait encore entre des agences de communication qui sous-traitaient toute la technique et des SSII qui ignoraient le design. Guido Brasletti a fait un pari à contre-courant : construire une agence dont la valeur ajoutée serait la maîtrise complète de la chaîne technique, et l'assumer avec des technologies open source, alors que le marché imposait des solutions propriétaires coûteuses en licences.

Dix-huit ans plus tard, le pari a tenu. L'agence compte 45 collaborateurs et a livré plusieurs centaines de projets, du site vitrine à l'application métier. L'open source n'y est pas un argument commercial, c'est une méthode de travail : pas d'enfermement propriétaire pour les clients, une capacité d'audit du code, et des compétences qui se transmettent d'un projet à l'autre.

C'est précisément ce succès qui produit aujourd'hui son point de rupture. Une agence de 5 personnes s'organise par la parole. Une agence de 45 personnes ne le peut plus.

### Valeurs

| Valeur | Traduction concrète dans le projet |
|---|---|
| Open source d'abord | Chaque brique du workflow est open source, toute exception devant être justifiée (voir D.2) |
| Maîtrise technique | Pas de boîte noire : l'agence héberge et opère elle-même son outillage |
| Transmission | Un nouvel arrivant doit être productif vite, d'où le plan de formation (voir F.2) |
| Sobriété numérique | La démarche RSE demandée par le client Thé Tip Top est appliquée d'abord à notre propre infrastructure |

### Informations juridiques

| Champ | Valeur |
|---|---|
| Dénomination sociale | Furious Ducks |
| Forme juridique | « à définir, une SAS serait cohérente avec 45 salariés » |
| Capital social | « à définir » |
| Siège social | « à définir » |
| RCS | « ville du siège et numéro » |
| SIREN et SIRET | « à définir, cohérents entre eux » |
| Code APE / NAF | 6201Z, programmation informatique |
| TVA intracommunautaire | « FR, clé, SIREN » |
| Date de création | 2007 |
| Effectif | 45 salariés |
| Direction | Guido Brasletti |

> Rappel de méthode : selon la forme juridique retenue, certaines mentions ne s'appliquent pas. Le capital social n'a aucun sens pour une entreprise individuelle, par exemple. Cette cohérence est à vérifier avant l'export, c'est un point de contrôle explicite du plan imposé.

## A.2 Présentation de la problématique

### Le constat de Mr Brasletti

Le directeur résume la situation en une phrase : après plus de quinze ans d'existence, « une désorganisation s'est progressivement installée, leur faisant perdre en efficacité ». Le symptôme est ressenti, la cause n'est pas nommée. Le rôle de ce dossier est de la nommer, puis d'y répondre.

### Diagnostic : sept dysfonctionnements

En analysant la situation d'une agence de cette taille qui travaille en cycle en V sans outillage d'industrialisation, sept problèmes apparaissent. Ils s'alimentent mutuellement.

| # | Dysfonctionnement | Manifestation quotidienne | Coût pour l'agence |
|---|---|---|---|
| 1 | Absence de versioning unifié | Le code circule par archives, dossiers partagés ou FTP, sans historique fiable | Impossible de savoir qui a introduit une régression, ni de revenir en arrière |
| 2 | Absence de sauvegardes | Les backups, quand ils existent, sont manuels et jamais testés | Un incident disque et c'est un projet client perdu. Risque existentiel |
| 3 | Procédures inexistantes | Chaque développeur déploie à sa façon | La mise en production dépend d'une personne, qui devient un point de défaillance unique |
| 4 | Environnements non reproductibles | « Ça marche sur ma machine » | Des bugs découverts en production, jamais en local |
| 5 | Tests manuels et tardifs | Le test arrive en fin de cycle, sous la pression de la date de livraison | Les régressions sont détectées par le client, pas par l'agence |
| 6 | Silos entre dev et ops | Celui qui développe n'exploite pas, celui qui exploite n'a pas écrit le code | Temps de résolution d'incident allongé, responsabilités diluées |
| 7 | Absence de métriques | Aucune donnée sur la disponibilité, les performances, la fréquence des incidents | On pilote à l'intuition, et on ne peut prouver aucune amélioration |

### Pourquoi ces problèmes apparaissent maintenant

Aucun de ces dysfonctionnements n'est nouveau. Ce qui a changé, c'est l'échelle. Les mécanismes informels qui suffisaient à une petite structure, se parler, se faire confiance, se souvenir, ne passent pas à 45 personnes réparties sur des projets simultanés. La coordination informelle a un coût, et ce coût croît plus vite que l'effectif.

Le problème est donc un problème d'industrialisation, pas de compétence individuelle. La réponse ne peut pas se limiter à demander plus de rigueur, elle doit être outillée.

### Livrables attendus

Deux chantiers indissociables, plus deux conditions de réussite.

| Chantier | Livrable |
|---|---|
| Organisation | Une méthodologie de gestion de projet moderne pour remplacer le cycle en V (voir B) |
| Industrialisation | Un workflow de production complet, hébergé, conteneurisé et automatisé (voir D, E, G) |
| Pérennisation | Le recrutement d'une ressource dédiée et son plan de formation (voir F) |
| Preuve | Le projet client Thé Tip Top conduit de bout en bout à travers ce workflow |

Ce dernier point mérite d'être souligné. Mr Brasletti n'a pas commandé un workflow théorique, il a décidé de l'éprouver immédiatement sur un projet client réel. Le workflow ne sera validé que si le site du jeu-concours est livré à travers lui.

## A.3 Méthodologie de projet actuelle

### Le cycle en V chez Furious Ducks

L'agence travaille aujourd'hui en cycle en V. Les phases s'enchaînent séquentiellement, la branche descendante spécifiant le produit (besoins, spécifications, conception) et la branche montante le validant (tests unitaires, intégration, recette).

```
Besoins ─────────────────────────────────────────── Recette client
  └─ Spécifications ─────────────────────── Tests d'intégration
       └─ Conception ───────────── Tests unitaires
            └─ Développement
```

### Ce que ce modèle suppose, et qui n'est plus vrai

Le cycle en V n'est pas un mauvais modèle en soi. Il a été conçu pour un contexte particulier, celui où le besoin est stable et connu à l'avance. Trois hypothèses le fondent, et aucune ne tient sur les projets web actuels de l'agence.

| Hypothèse du cycle en V | Réalité des projets de l'agence |
|---|---|
| Le besoin est figé au démarrage | Le client découvre son besoin en voyant les premières maquettes |
| La validation peut attendre la fin | Une erreur de spécification découverte en recette coûte des dizaines de fois plus cher qu'en conception |
| Chaque phase est terminée avant la suivante | Les équipes attendent, puis se retrouvent en surcharge. La charge n'est jamais lissée |

### Conséquences observables

Sur l'organisation, c'est l'effet tunnel. Entre la validation des spécifications et la première démonstration, le client n'a aucune visibilité. S'il s'est trompé, ou si nous l'avons mal compris, le constat tombe en recette, quand le budget est déjà consommé.

Sur l'avancement, le test étant relégué en fin de parcours, il devient la variable d'ajustement dès que le planning glisse. Un retard de développement se paie en qualité, jamais en délai.

Sur la charge, les compétences sont mobilisées en séquence. Le graphiste sature au début, le développeur au milieu, le testeur à la fin. À 45 personnes sur des projets parallèles, ce déséquilibre devient une perte structurelle de capacité de production.

Sur la relation client, enfin, l'absence de livraison intermédiaire empêche toute négociation de périmètre en cours de route. Le moindre changement devient un avenant conflictuel au lieu d'un arbitrage naturel.

### Le lien avec le workflow

Le cycle en V n'a jamais eu besoin d'intégration continue. Puisqu'on n'intègre qu'une fois, à la fin, l'automatisation n'a pas d'objet. C'est pour cette raison que les deux chantiers de Mr Brasletti sont indissociables : changer de méthodologie sans outiller l'intégration ne produirait qu'un cycle en V accéléré, donc plus douloureux. La méthodologie (partie B) et le workflow (partie D) sont les deux faces d'une même transformation.
