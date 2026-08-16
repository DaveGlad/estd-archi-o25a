# D. Analyse du workflow CI/CD

## D.1 Présentation du workflow CI/CD

### Définitions

L'intégration continue consiste à fusionner fréquemment le travail de tous les développeurs dans une branche commune, chaque fusion déclenchant automatiquement une compilation et une batterie de tests. L'objectif est de détecter un défaut d'intégration en quelques minutes plutôt qu'en quelques semaines.

Le déploiement continu prolonge cette logique jusqu'à la mise à disposition : tout artefact ayant passé les contrôles est automatiquement déployé sur un environnement cible. On distingue la livraison continue, où l'artefact est prêt mais la mise en production reste déclenchée par un humain, du déploiement continu, où la mise en production est elle aussi automatique.

### Contraintes du workflow

Les huit contraintes imposées par la direction, et l'endroit où chacune est traitée.

| # | Contrainte | Traitée en |
|---|---|---|
| 1 | Hébergement sur serveur dédié ou cloud, sous Linux | D.3 |
| 2 | Entièrement basé sur Docker, le workflow comme les serveurs qu'il gère | D.2 et E |
| 3 | Contient une CI Jenkins, un SCM Git, des tests applicatifs, des backups automatisés et des métriques | D.2 |
| 4 | La CI gère l'optimisation des assets, le déploiement dev, le stockage des images, le déploiement en préproduction, le déploiement en production, les tests unitaires et fonctionnels, l'envoi et le stockage des rapports | D.1 et G |
| 5 | Configuration modifiable par les développeurs sans accès au CI | D.2, via le Jenkinsfile |
| 6 | Applications open source, ou libres au pire | D.2 |
| 7 | S'adapte à trois types de projets : vitrine HTML/CSS, site administrable, application mobile hybride | D.1 |
| 8 | Backup de l'intégralité du workflow et des projets gérés | D.3 et G |

Deux exigences propres à l'agence s'ajoutent à cette liste. La démarche RSE demandée par le client Thé Tip Top, appliquée d'abord à notre propre infrastructure. Et la maîtrise des coûts, puisque le workflow doit être rentable, ce que démontre la partie I.

### Les tâches à automatiser

Chaque tâche automatisée répond à un dysfonctionnement identifié en partie A. C'est ce qui justifie son coût.

| Tâche automatisée | Déclencheur | Dysfonctionnement corrigé |
|---|---|---|
| Récupération du code et vérification de l'historique | Commit ou merge request | n° 1, absence de versioning |
| Installation des dépendances, avec cache | Après récupération | n° 4, environnements non reproductibles |
| Analyse statique et détection de secrets | Après les dépendances | Sécurité, voir C.2 |
| Tests unitaires | Après l'analyse | n° 5, tests tardifs |
| Tests d'intégration | Après les tests unitaires | n° 5 |
| Optimisation des assets, minification et compression | Build | Contrainte 4a, plus performance et éco-conception |
| Construction de l'image Docker | Après le build | n° 4 |
| Scan de vulnérabilités de l'image | Avant publication | Sécurité, voir C.2 |
| Publication au registry | Si le scan est conforme | Contrainte 4c |
| Déploiement automatique en dev | Merge sur `develop` | n° 3, procédures inexistantes |
| Tests fonctionnels sur l'environnement déployé | Après le déploiement dev | n° 5 |
| Déploiement automatique en préproduction | Merge sur `release/*` | Contrainte 4d, plus sprint review, voir B.2 |
| Déploiement en production | Tag sur `main`, avec validation humaine | Contrainte 4e |
| Publication et archivage des rapports de tests | Fin de pipeline | Contrainte 4g et n° 7 |
| Sauvegarde planifiée du workflow et des projets | Quotidien | n° 2, absence de backups |
| Vérification de restauration | Périodique | n° 2 |
| Collecte des métriques et alertes | Continu | n° 7, absence de métriques |

### Pourquoi la production n'est pas entièrement automatique

Le sujet laisse le niveau d'automatisation de la production à notre appréciation. Nous retenons la livraison continue : l'artefact de production est construit, testé et prêt automatiquement, mais son déploiement est déclenché par une validation humaine.

Le contexte est celui d'une agence, pas d'un éditeur de produit. Une mise en production engage la relation avec un client tiers, elle relève donc d'une décision commerciale autant que technique.

La maturité de l'agence compte aussi. Elle part d'une situation sans versioning ni tests automatisés, comme le montre la partie A. Le déploiement continu suppose une couverture de tests et une capacité de retour arrière qui n'existent pas encore. C'est une cible de maturité, pas un point de départ.

L'enjeu du projet client tranche enfin la question. Le jeu-concours a une date d'ouverture légale et un règlement déposé chez un huissier. Une mise en production non maîtrisée pendant l'opération aurait des conséquences juridiques.

Le passage au déploiement continu est envisagé à l'horizon 18 mois, conditionné aux indicateurs de la partie C.1.

### Adaptation aux trois types de projets

La contrainte n° 7 impose que le workflow gère tous les projets de l'agence. La généricité repose sur un principe simple : le pipeline est décrit dans le dépôt du projet, pas dans le serveur CI.

| Type de projet | Étapes spécifiques | Artefact produit |
|---|---|---|
| Site vitrine HTML/CSS | Minification CSS et JS, compression et redimensionnement des images, validation HTML | Image Docker Nginx servant les fichiers statiques |
| Site administrable en PHP, NodeJS, Python ou Ruby | Installation des dépendances, tests unitaires et d'intégration, migrations de base de données, build applicatif | Image Docker applicative, plus base de données |
| Application mobile hybride | Build multiplateforme, tests unitaires, signature | Artefact d'application archivé et versionné |

Trois dépôts de démonstration accompagnent donc le projet client dans le SCM, chacun avec son propre `Jenkinsfile`. C'est ce qui prouve la généricité du workflow au lieu de se contenter de l'affirmer.

## D.2 Choix techniques

### Méthode de sélection

Quatre critères ont été appliqués à chaque brique.

| Critère | Exigence |
|---|---|
| Licence | Open source, contrainte n° 6. Toute exception doit être justifiée |
| Empreinte | Consommation mémoire compatible avec un hébergement raisonnable, pour le coût comme pour la RSE |
| Maturité | Projet actif, documenté, avec une communauté. L'agence doit pouvoir se dépanner seule |
| Compétence interne | Cohérent avec le positionnement open source de l'agence depuis 2007 |

### Les briques retenues

| Rôle | Solution | Licence | Justification |
|---|---|---|---|
| Conteneurisation | Docker | Open source | Imposé par la contrainte n° 2. Assure la reproductibilité des environnements, dysfonctionnement n° 4 |
| Système d'exploitation | Distribution Linux | Open source | Imposé par la contrainte n° 1 |
| Reverse proxy | Traefik | Open source, MIT | Découverte automatique des conteneurs et certificats TLS automatiques, indispensable puisque chaque outil du workflow doit exposer son propre sous-domaine |
| SCM | Gitea | Open source, MIT | Répond à la contrainte n° 3. Retenu contre GitLab CE pour son empreinte mémoire, quelques centaines de Mo contre plusieurs Go, sur une infrastructure qui héberge aussi la CI, les métriques et trois environnements. L'argument vaut pour la RSE comme pour le coût |
| Serveur d'intégration continue | Jenkins | Open source | Imposé par la contrainte n° 3. Ses agents conteneurisés permettent d'exécuter chaque build dans un environnement neuf et jetable |
| Registry d'images | Registry privé auto-hébergé | Open source | Contrainte n° 4c. Auto-hébergé plutôt qu'un service tiers, pour garder la maîtrise des données et éviter une dépendance externe |
| Tests unitaires et d'intégration | Vitest | Open source | Cohérent avec la stack du projet client, avec des rapports au format JUnit exploitables par Jenkins |
| Tests fonctionnels | Playwright | Open source | Exécute les parcours réels sur l'environnement déployé, dont la saisie d'un code par un joueur |
| Tests de performance | k6 | Open source | Nécessaire pour valider le comportement avec 500 000 codes en base |
| Analyse de qualité et de sécurité | Analyse statique, scan de dépendances et d'images | Open source | Pratiques DevSecOps décrites en C.2 |
| Métriques | Prometheus et Grafana | Open source | Contrainte n° 3. Prometheus collecte, Grafana visualise et alerte. Support des indicateurs de C.1 |
| Logs centralisés | Agrégateur de logs | Open source | Complète les métriques. Sans logs, une alerte ne se diagnostique pas |
| Base de données | PostgreSQL | Open source, licence PostgreSQL | Contrainte n° 6 respectée. Licence approuvée par l'OSI, plus permissive encore que la GPL de MariaDB citée en exemple par la direction. Nécessaire pour indexer 500 000 codes |
| Sauvegardes | Sauvegarde chiffrée, incrémentale, externalisée | Open source | Contrainte n° 8, détaillée en D.3 |

### Une exclusion assumée

Aucun service SaaS propriétaire n'entre dans le workflow. Cela vaut en particulier pour les services de cache de build hébergés, séduisants sur le plan des performances, mais qui contreviendraient à la contrainte n° 6 et créeraient une dépendance externe. Le cache de build est donc auto-hébergé, sur volume persistant.

### Standards et bonnes pratiques associés

Une brique sans convention d'usage ne produit aucun bénéfice. Chaque outil est donc accompagné d'un standard opposable.

#### GitFlow

| Branche | Rôle | Automatisation associée |
|---|---|---|
| `main` | État de la production | Un tag déclenche le déploiement en production, après validation |
| `develop` | Intégration continue | Un merge déclenche le déploiement automatique en dev |
| `feature/*` | Une fonctionnalité | Build et tests sur chaque commit |
| `release/*` | Stabilisation avant livraison | Déploiement automatique en préproduction |
| `hotfix/*` | Correctif urgent | Pipeline accéléré |

GitFlow a été préféré à un modèle plus léger pour une raison liée au métier. Une agence maintient simultanément plusieurs versions livrées à des clients différents, et doit pouvoir produire un correctif urgent sans embarquer les développements en cours. Un modèle à branche unique conviendrait à un produit déployé en continu, pas à un portefeuille de projets clients.

#### Autres standards

| Domaine | Standard retenu | Effet |
|---|---|---|
| Messages de commit | Convention de nommage structurée | Historique lisible, génération automatique du journal des versions |
| Protection des branches | `main` et `develop` non poussables directement | Toute modification passe par une revue |
| Revue de code | Au moins une validation avant fusion | Diffusion des connaissances, réduction du facteur bus |
| Configuration du pipeline | `Jenkinsfile` versionné dans le dépôt du projet | Réponse à la contrainte n° 5, voir ci-dessous |
| Gestion des secrets | Aucun secret dans le dépôt, injection par variables d'environnement | Un dépôt compromis n'expose aucun accès |
| Versionnement des images | Tag correspondant au commit, jamais `latest` en production | Un déploiement reste identifiable et réversible |

Le `Jenkinsfile` mérite qu'on s'y arrête, parce qu'il répond directement à la contrainte n° 5. La configuration vit dans le dépôt du projet, donc sous le contrôle des développeurs et soumise à la revue de code, tandis que l'administration du serveur Jenkins reste réservée à l'équipe plateforme décrite en C.3.

## D.3 Hébergement et backups

### Dimensionnement

Le workflow doit faire cohabiter en permanence le reverse proxy, le SCM, Jenkins et ses agents, le registry, les métriques et les logs, plus trois environnements complets, dev, préproduction et production, comportant chacun l'application, sa base de données et son cache.

| Poste | Besoin estimé | Justification |
|---|---|---|
| Processeur | 8 vCPU | Les builds constituent l'usage le plus intensif, et plusieurs pipelines peuvent s'exécuter en parallèle |
| Mémoire vive | 32 Go, minimum viable à 16 Go | Poste dimensionnant. Les builds applicatifs sont gourmands et trois environnements complets tournent en continu |
| Disque | 500 Go SSD NVMe | Images Docker, historique du registry, bases de données, rétention des métriques |
| Bande passante | 1 Gbit/s, trafic non limité | Transferts d'images entre la CI et le registry |
| Sauvegarde | Espace externalisé d'au moins 1 To | Voir la politique de rétention plus bas |

> Si le budget impose de descendre sous 32 Go, la répartition retenue est de séparer sur deux serveurs, l'un pour le workflow (SCM, CI, registry, métriques), l'autre pour les environnements gérés. Cette séparation a d'ailleurs un mérite propre : une saturation des builds ne peut plus dégrader la production d'un client.

### Niveaux de service

| Indicateur | Engagement recherché | Conséquence d'un manquement |
|---|---|---|
| SLA, taux de disponibilité | Au moins 99,9 % sur l'infrastructure | Environ 8 h 45 d'indisponibilité annuelle tolérée |
| GTR, garantie de temps de rétablissement | 4 h ouvrées au maximum | Au-delà, la production d'un client est engagée |
| GTI, garantie de temps d'intervention | 1 h au maximum | Délai de prise en charge |

Une précision utile pour le client : le SLA de l'hébergeur ne porte que sur son infrastructure. La disponibilité applicative dépend de nos propres choix, d'où les redémarrages automatiques des conteneurs, les sondes de santé et les alertes décrites en D.2.

### Politique de sauvegarde

La contrainte n° 8 demande que l'intégralité du workflow et des projets gérés soit sauvegardée automatiquement.

| Périmètre | Contenu | Fréquence | Rétention |
|---|---|---|---|
| Dépôts Git | Tout le code de l'agence | Quotidienne | 30 jours, plus 12 mensuelles |
| Configuration Jenkins | Jobs, identifiants, plugins | Quotidienne | 30 jours |
| Registry d'images | Images de production | Hebdomadaire | 3 mois |
| Bases de données de production | Données clients | Quotidienne, avec journal de transactions | 30 jours, plus 12 mensuelles |
| Bases de préproduction et de dev | Jeux de test | Hebdomadaire | 7 jours |
| Volumes de métriques | Historique Prometheus | Hebdomadaire | 3 mois |
| Fichiers de configuration | Compose, variables d'environnement | À chaque modification, car versionnés | Illimitée |

La règle du 3-2-1 s'applique : trois copies de chaque donnée, sur deux supports différents, dont une hors site. Sans la copie externalisée, une défaillance du serveur emporterait à la fois les données et leurs sauvegardes.

Les sauvegardes sont chiffrées au repos, et la clé conservée en dehors du serveur sauvegardé. Elles contiennent en effet des données personnelles soumises au RGPD, celles des comptes des participants au jeu-concours.

### Restauration

Une sauvegarde non testée n'est pas une sauvegarde. C'est le point sur lequel l'agence a le plus à corriger, puisque le dysfonctionnement n° 2 du diagnostic ne dit pas seulement que les backups sont absents, il dit qu'ils ne sont jamais vérifiés.

| Objectif | Valeur cible | Signification |
|---|---|---|
| RPO, perte de données maximale | 24 h en dev et préproduction, 15 min en production | Justifie le journal de transactions sur la base de production |
| RTO, délai de remise en service | 4 h pour le workflow, 2 h pour un projet client | Détermine le niveau d'automatisation des procédures |

Un test de restauration est réalisé chaque mois sur l'environnement de préproduction. Il est chronométré et consigné. Les procédures de sauvegarde et de restauration sont formalisées en BPMN dans la partie G, le sujet exigeant explicitement la restauration pour les trois environnements.
