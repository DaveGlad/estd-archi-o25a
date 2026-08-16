# C. Introduction au mouvement DevOps et DevSecOps

## C.1 DevOps

### Définition

DevOps est un mouvement culturel et organisationnel qui vise à supprimer la frontière entre ceux qui écrivent le logiciel, les dev, et ceux qui l'exploitent, les ops. Ce n'est ni un métier, ni un outil, ni une méthodologie. C'est un ensemble de pratiques dont l'objectif tient en une phrase : réduire le délai entre l'écriture d'une ligne de code et sa mise à disposition de l'utilisateur, sans dégrader la stabilité.

Le problème qu'il adresse correspond exactement au dysfonctionnement n° 6 du diagnostic de la partie A, le silo. Quand les développeurs sont évalués sur le changement et les exploitants sur la stabilité, leurs objectifs s'opposent, et chaque livraison devient une négociation.

### Les pratiques

| Pratique | Traduction chez Furious Ducks |
|---|---|
| Intégration continue | Tout commit déclenche un build et des tests automatisés (voir D) |
| Livraison et déploiement continus | Déploiement automatique en dev et en préproduction, sur validation en production |
| Infrastructure as Code | Toute l'infrastructure décrite dans des fichiers versionnés, Docker et compose |
| Monitoring et observabilité | Métriques et logs centralisés (voir D.2) |
| Responsabilité partagée | L'équipe qui développe répond du bon fonctionnement de ce qu'elle livre |

### Bénéfices attendus

| Bénéfice | Lien avec le diagnostic |
|---|---|
| Environnements reproductibles | Élimine le « ça marche sur ma machine », dysfonctionnement n° 4 |
| Détection précoce des régressions | Le test devient permanent au lieu d'être une phase sacrifiable, n° 5 |
| Déploiements fréquents et peu risqués | Un petit changement déployé souvent est plus sûr qu'un gros livré rarement |
| Pilotage par la donnée | Les métriques remplacent l'intuition, n° 7 |
| Réduction du facteur humain | Une procédure automatisée ne dépend plus d'une personne, n° 3 |

### Les quatre indicateurs de pilotage

Ces indicateurs, issus des travaux DORA, serviront à prouver l'amélioration, ce qui est aujourd'hui impossible faute de mesure.

| Indicateur | Avant, estimé en cycle en V | Cible à 12 mois |
|---|---|---|
| Fréquence de déploiement | Quelques-uns par projet | Plusieurs par semaine et par projet |
| Délai de mise en production d'un changement | Plusieurs semaines | Moins d'un jour |
| Taux d'échec des changements | Non mesuré | Moins de 15 % |
| Délai de rétablissement après incident | De plusieurs heures à plusieurs jours | Moins d'une heure |

> Ces valeurs sont des objectifs, pas des mesures. L'absence totale de métriques est elle-même un constat du diagnostic, et la première valeur du workflow sera justement de rendre ces chiffres observables.

## C.2 DevSecOps

### Définition

DevSecOps prolonge le mouvement DevOps du côté de la sécurité. Plutôt qu'un audit ponctuel réalisé juste avant la mise en production, la sécurité devient une préoccupation continue, automatisée et intégrée au pipeline. C'est le principe du shift left, qui consiste à déplacer le contrôle le plus tôt possible dans la chaîne.

### Pourquoi c'est structurant sur ce projet précis

Le projet client n'est pas un site vitrine. Le site du jeu-concours Thé Tip Top manipule trois choses sensibles à la fois : des données personnelles soumises au RGPD (identité, sexe, date de naissance, adresse e-mail), des codes ayant une valeur marchande, 500 000 codes gagnants dont des lots à 69 €, et un tirage au sort sous contrôle d'huissier qui doit être incontestable.

Une faille n'aurait donc pas seulement un coût technique. Elle aurait un coût juridique et réputationnel pour le client. La sécurité ne peut pas rester un contrôle final.

### Contrôles intégrés au pipeline

| Contrôle | Moment | Objet |
|---|---|---|
| Analyse des dépendances | À chaque build | Détecter les vulnérabilités connues des bibliothèques tierces |
| Analyse statique du code (SAST) | À chaque build | Détecter injections, secrets en clair, mauvaises pratiques |
| Scan des images Docker | Avant publication au registry | Vulnérabilités des images de base |
| Détection de secrets | À chaque commit | Empêcher qu'un mot de passe entre dans l'historique Git |
| Gestion des secrets | Permanent | Aucun secret dans le dépôt, injection par variables d'environnement |
| Contrôle des accès | Permanent | Droits minimaux, branches protégées, comptes nominatifs |

> Un build dont l'analyse de sécurité échoue est un build rouge, et le pipeline s'arrête. C'est ce qui distingue le DevSecOps d'un rapport d'audit que personne ne lit.

## C.3 Topologies d'équipe retenues

> Une topologie décrit comment les responsabilités dev et ops sont réparties dans l'organisation. Il en existe plusieurs, dont certaines sont reconnues comme des anti-patterns. Le choix dépend de la maturité de l'entreprise, et doit évoluer avec elle.

### État actuel : la topologie en silos

```
┌──────────────┐        mur         ┌──────────────┐
│     Dev      │ ─── livraison ───► │     Ops      │
│ (développe)  │    par-dessus      │  (exploite)  │
└──────────────┘     le mur         └──────────────┘
```

C'est la situation décrite en partie A. Chacun son périmètre, aucune responsabilité partagée, et un transfert de responsabilité au moment le plus risqué, la mise en production.

### Cible à court terme : l'équipe plateforme

```
┌─────────┐ ┌─────────┐ ┌─────────┐   Équipes projet
│ Équipe  │ │ Équipe  │ │ Équipe  │   (Scrum, 4 à 6 personnes)
│    A    │ │    B    │ │    C    │   autonomes sur leur déploiement
└────┬────┘ └────┬────┘ └────┬────┘
     └───────────┼───────────┘
                 ▼
        ┌────────────────────┐
        │  Équipe plateforme │   construit et opère le workflow,
        │  (1 à 2 personnes) │   proposé comme un service interne
        └────────────────────┘
```

Trois raisons motivent ce choix pour Furious Ducks.

La taille de l'agence, d'abord. 45 personnes ne justifient pas un ingénieur ops dans chaque équipe, mais justifient largement une plateforme mutualisée.

Le recrutement demandé, ensuite. Mr Brasletti souhaite recruter une ressource dédiée à la gestion et à la maintenance du workflow. C'est exactement le premier membre de cette équipe plateforme, dont la fiche de poste figure en F.1.

La contrainte n° 5 du sujet, enfin, qui exige que la configuration du workflow soit modifiable par les développeurs sans qu'ils aient accès au CI. C'est la définition même d'une plateforme en libre-service : l'équipe projet configure son pipeline via un `Jenkinsfile` versionné dans son propre dépôt, sans aucun droit d'administration sur Jenkins.

Un risque est à surveiller, celui de voir l'équipe plateforme redevenir un silo ops déguisé. Le garde-fou est le libre-service. Si les équipes doivent ouvrir un ticket pour déployer, la topologie a échoué.

### Évolution à moyen terme : l'équipe facilitatrice

Une fois le workflow adopté, l'équipe plateforme consacre une part croissante de son temps à transmettre plutôt qu'à exécuter : formation, référentiel de bonnes pratiques, accompagnement ponctuel d'une équipe sur un besoin spécifique. Elle devient facilitatrice.

C'est ce qui justifie le plan de formation de la partie F.2. Il n'est pas un supplément, c'est le mécanisme par lequel la topologie évolue.

### Trajectoire

| Horizon | Topologie | Marqueur de réussite |
|---|---|---|
| Aujourd'hui | Silos | néant |
| 0 à 6 mois | Plateforme | Les équipes déploient en dev sans intervention humaine extérieure |
| 6 à 18 mois | Plateforme et facilitation | Une nouvelle équipe devient autonome sur le workflow en moins d'une semaine |
| Au-delà de 18 mois | Autonomie, plateforme réduite au socle | Les pratiques XP, à commencer par les tests automatisés, sont généralisées |

> Cette trajectoire est cohérente avec la mise en place progressive de Scrum décrite en B.4. On ne change pas simultanément la méthodologie, l'outillage et la répartition des responsabilités. L'ordre retenu est d'outiller d'abord, structurer ensuite, transmettre enfin.
