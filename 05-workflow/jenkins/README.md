# Intégration continue

**Responsable** : R3, avec R4 sur le pipeline du site vitrine.

## La contrainte la plus structurante

Point 5 de l'expression de besoin : « La configuration du workflow devra être modifiable
par les développeurs sans qu'ils aient accès au CI en passant par exemple via les
jenkinsfiles. »

Conséquence directe : **le `Jenkinsfile` vit dans le dépôt du projet, pas dans Jenkins.**
Un développeur modifie son pipeline par une merge request, relue comme n'importe quel
autre code, et personne n'a besoin d'un compte sur le serveur d'intégration pour cela.
L'administration de Jenkins reste à l'équipe plateforme décrite au CST partie C.3.

## Les trois pipelines

Le point 7 impose que le workflow s'adapte à tous les projets de l'agence. Trois formes de
projet, trois pipelines — et c'est ce qui **prouve** la généricité au lieu de l'affirmer.

| Projet | Fichier | Où il vit réellement |
|---|---|---|
| Site administrable (le client Thé Tip Top) | — | `06-app/theetiptop-contest/Jenkinsfile` |
| Site vitrine HTML/CSS | `Jenkinsfile.site-vitrine` | À copier à la racine de `demo-site-vitrine` |
| Application mobile hybride | `Jenkinsfile.app-mobile` | À copier à la racine de `demo-app-mobile` |

Les deux fichiers de démonstration sont ici parce que leurs dépôts sont séparés ; celui du
client est à la racine de son monorepo, exactement là où la contrainte n° 5 demande qu'il
soit.

### Ce que chaque forme impose de différent

| | Vitrine | Site administrable | Mobile |
|---|---|---|---|
| Optimisation des assets | **Tout le build** : minification HTML/CSS/JS, AVIF/WebP, pré-compression | Faite par Next.js et webpack pendant le build | Bundle Metro |
| Tests | Validation HTML, liens morts, Lighthouse | Unitaires, intégration (vraie base), fonctionnels sur l'environnement déployé | Unitaires, puis parcours sur émulateur |
| Artefact | Image Nginx | Trois images Docker | **`.aab` / `.ipa` signés** — pas une image |
| Déploiement | Automatique en dev, validé en prod | Automatique en dev et préprod, validé en prod | **Pas de déploiement** : mise à jour OTA, puis piste de test |

La troisième colonne est celle qui casse les hypothèses confortables des deux autres, et le
dire vaut mieux que de prétendre qu'elle rentre dans le même moule :

- l'artefact n'est pas une image Docker, donc « stocker les images construites »
  (exigence 4c) devient « archiver et versionner les binaires signés », et le registry n'y
  joue aucun rôle ;
- on n'« déploie » pas une application, on l'**installe** ;
- **iOS ne peut pas se construire dans un conteneur Linux.** La chaîne d'outils d'Apple
  exige macOS. La réponse honnête est un agent macOS ; sans lui, l'étape est marquée
  *UNSTABLE* avec un message, et non silencieusement verte. Un pipeline qui annonce un
  succès pour quelque chose qu'il n'a pas fait est pire que celui qui admet le manque.

## Les sept responsabilités du point 4

| # | Exigence | Où elle est traitée |
|---|---|---|
| a | Optimisation des assets | Étape `Optimise assets` (vitrine) ; intégrée au build Next.js et webpack (client) |
| b | Déploiement automatique en dev | `Deploy to dev`, sur merge dans `develop` |
| c | Stockage des images construites | `Push to registry`, registry auto-hébergé |
| d | Déploiement automatique en préproduction | `Deploy to preprod`, sur merge dans `release/*` |
| e | Déploiement en production | `Approve production` puis `Deploy to production`, sur tag |
| f | Tests unitaires et fonctionnels | `Quality gates`, `Integration tests`, `Functional tests on dev` |
| g | Envoi et stockage des rapports | Bloc `post`, `junit` + `archiveArtifacts` + `publishHTML` |

### Pourquoi la production n'est pas entièrement automatique

Le sujet laisse le niveau d'automatisation à notre appréciation, et voici la ligne tracée :
**tout est automatique jusqu'à la production, la franchir est une décision que quelqu'un
signe.**

La raison est métier, pas technique. Le jeu dure trente jours sur des codes **déjà imprimés
sur des tickets dans la poche des clients**. Un déploiement défaillant ne se rattrape pas
par un correctif : les codes sont dehors, et un joueur dont le code a été consommé à tort
ne peut pas recommencer.

## Les agents

| Label | Image | Pour |
|---|---|---|
| `docker` | Hôte avec le socket Docker | Build d'images, scan, déploiement |
| *(par stage)* | `node:24-alpine` | Installation, lint, types, tests unitaires |
| *(par stage)* | `mcr.microsoft.com/playwright:v1.65.0-noble` | Tests fonctionnels |
| `macos` | Agent physique | Build iOS **uniquement** |

Aucun `agent` global dans les pipelines : une étape qui ne fait que du `docker` n'a pas à
transporter 400 Mo de chaîne d'outils Node, et le socket Docker n'est monté que là où il
sert réellement.

### Caches persistants

| Volume | Contenu | Pourquoi |
|---|---|---|
| `nx-cache` | Cache de build Nx | Tâche W18. Auto-hébergé : un cache distribué en SaaS violerait l'exigence n° 6 |
| `npm-cache` | Paquets npm | Sinon chaque build retélécharge tout l'arbre de dépendances |
| `gradle-cache` | Dépendances Android | Un build Android à froid dépasse 20 minutes |
| `trivy-cache` | Base de vulnérabilités | Téléchargée une fois par jour plutôt qu'à chaque image |

Ce n'est pas qu'une question de vitesse : la bande passante économisée est de l'énergie
non consommée, à chaque build, ce qui relève de la démarche RSE que le sujet demande de
prendre en compte.

## Les identifiants attendus dans Jenkins

Aucun secret n'est dans les dépôts. Chaque pipeline les demande par identifiant :

| Identifiant | Type | Utilisé par |
|---|---|---|
| `registry-credentials` | utilisateur / mot de passe | Les trois pipelines |
| `android-keystore` | fichier | Mobile |
| `android-keystore-password` | texte secret | Mobile |
| `android-key-alias` | texte secret | Mobile |
| `ios-certificate` | fichier | Mobile |
| `ios-certificate-password` | texte secret | Mobile |
| `ios-provisioning-profile` | fichier | Mobile |
| `expo-token` | texte secret | Mobile |
| `google-play-service-account` | fichier | Mobile |

Le keystore Android est effacé du plan de travail immédiatement après signature, succès ou
échec : un keystore laissé là est lu par le job suivant qui atterrit sur cet agent, et
permet de publier une application qui se fait passer pour celle du client.

## Le shallow clone, et pourquoi il est désactivé

`skipDefaultCheckout(true)` puis un checkout explicite avec `shallow: false`. Jenkins clone
en profondeur 1 par défaut, et `nx affected` a besoin de la base de comparaison : sans
l'historique, il ne trouve pas le point de divergence et **reconstruit tout**, en silence.
Le pipeline reste vert, simplement trois fois plus lent, ce qui est la pire forme de
régression — personne ne la cherche. C'est la tâche W19 du backlog.
