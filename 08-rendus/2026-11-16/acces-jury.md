---
title: "Accès site internet et comptes divers"
subtitle: "ESTD ARCHI O25A, Groupe 1. Thé Tip Top, par Furious Ducks"
date: "19 novembre 2026"
lang: fr
---

Projet étudiant fictif. La société Thé Tip Top et l'agence Furious Ducks sont des supports
de formation. Aucun achat, aucune réservation et aucune participation réelle ne peut être
effectué sur ce site.

## Tous les accès en un coup d'oeil

| Quoi | Adresse | Identifiant | Mot de passe |
|---|---|---|---|
| Site public | <https://srv1581779.hstgr.cloud> | 4 comptes ci-dessous | `MotDePasse2026!` |
| Back-office | <https://srv1581779.hstgr.cloud/backoffice> | `admin@theetiptop.fr` | `MotDePasse2026!` |
| API, documentation | <https://srv1581779.hstgr.cloud/docs> | clé `X-Api-Key` | voir § Tester l'API |
| Jenkins | <https://srv1581779.hstgr.cloud/ci> | `admin` | `rTRMwmsrry6HLByK68I1` |
| Gitea | <https://srv1581779.hstgr.cloud/git> | `gitea-admin` | `UuvUi5LlYaTEsUF0mZH0` |
| Grafana | <https://srv1581779.hstgr.cloud/grafana> | `admin` | `V5xC2k2dv1k4emoGYkth` |
| Code source | <https://github.com/DaveGlad/estd-archi-o25a> | aucun, dépôt public | aucun |
| Trello | <https://trello.com/b/6ZYwiaW8/projet-the-tiptop> | aucun, tableau public | aucun |
| Cahier des charges | <https://docs.google.com/document/d/1EvdQg0d10Yi70kN47ExMLsjHmC8vhL_RpZHuF9y_Otw/edit> | compte Google | lecture partagée |
| Spécifications techniques | <https://docs.google.com/document/d/1DLrvM9LSZkpNnpW76hh1MlRw12kMtWCKnA8sOFqi4SM/edit> | compte Google | lecture partagée |
| Maquettes Figma | <https://www.figma.com/design/CkO6KsKKatpJPP2ky53WOO/Design---Site-The-Tip-TOP> | compte Figma | lecture partagée |
| Google Analytics | <https://analytics.google.com> | voir § Analytics | voir § Analytics |

Chaque identifiant de ce tableau a été testé le 19 novembre : bon mot de passe accepté,
mauvais mot de passe refusé, accès anonyme refusé.

## Te connecter

Tout tient sur une seule adresse, en HTTPS. Le mot de passe est le même pour les quatre
comptes : **MotDePasse2026!**

### Pour les deux comptes clients

Va sur <https://srv1581779.hstgr.cloud/connexion> et saisis l'un des deux :

| Identifiant | Profil |
|---|---|
| `camille.rousseau@example.fr` | Cliente, a déjà joué des codes, acceptait les offres commerciales |
| `theo.marchand@example.fr` | Client, a refusé les offres commerciales |

Après connexion tu arrives sur l'accueil. Les pages **Participer** et **Mon compte**
deviennent accessibles depuis le menu.

Tu peux aussi créer ton propre compte sur
<https://srv1581779.hstgr.cloud/inscription>, par formulaire ou avec Google ou Facebook.

### Pour l'administrateur et l'employé

Va sur <https://srv1581779.hstgr.cloud/backoffice>. Tu es renvoyé vers la page de
connexion du back-office, qui est une page distincte de celle du site public.

| Identifiant | Tu atterris sur | Tu y fais quoi |
|---|---|---|
| `admin@theetiptop.fr` | `/backoffice/admin` | Statistiques, export emailing, tirage au sort, paramétrage |
| `sofia.legrand@theetiptop.fr` | `/backoffice/employe` | Recherche client, consultation des gains, remise d'un lot |

Chaque rôle est envoyé à son espace automatiquement. Essaie d'ouvrir `/backoffice/admin`
avec le compte employé : tu es renvoyé vers l'espace boutique. C'est le cloisonnement des
rôles, et il tient côté serveur, pas dans l'affichage.

Ces quatre comptes servent à la démonstration. Les données derrière sont fabriquées.

## Un parcours en cinq minutes

1. Ouvre <https://srv1581779.hstgr.cloud>. Tu vois le jeu, les cinq lots, les dix boutiques.
2. Connecte-toi en `camille.rousseau@example.fr`, puis va sur **Participer**.
3. Saisis un des codes du paragraphe suivant. Ton lot s'affiche tout de suite.
4. Va dans **Mon compte**, onglet **Mes gains**. Le lot y est, avec sa date limite.
5. Déconnecte-toi, connecte-toi en `admin@theetiptop.fr` sur `/backoffice`. Ta participation
   compte dans les statistiques.
6. Connecte-toi en `sofia.legrand@theetiptop.fr`. Cherche « rousseau », ouvre la fiche,
   marque le lot comme remis.

## Codes de démonstration

Des codes réels, pris dans le pool de 500 000. Chacun donne un coffret découverte à 69 €.

| Code | Lot |
|---|---|
| `M38JD2FLCR` | Coffret découverte à 69 € |
| `Z205U67MY1` | Coffret découverte à 69 € |
| `85UDNRFI0A` | Coffret découverte à 69 € |
| `MRBN4OP42N` | Coffret découverte à 69 € |
| `KZ17UKAGP7` | Coffret découverte à 69 € |
| `W15BJ2PVQJ` | Coffret découverte à 69 € |

Un code ne se joue qu'une fois. Rejoue-le, le site te dit quand il a été utilisé et par
qui. C'est la garantie centrale du jeu, tenue par la base de données et non par le code
applicatif.

## Ce que le site fait

| Parcours | Adresse |
|---|---|
| Présentation du jeu et des lots | `/jeu-concours` et `/jeu-concours/lots` |
| Règlement déposé chez l'huissier | `/jeu-concours/reglement` |
| Inscription par formulaire, Google ou Facebook | `/inscription` |
| Saisie d'un code | `/participer` |
| Historique des gains | `/mon-compte/gains` |
| Droits RGPD | `/mon-compte/confidentialite` |
| Mentions légales et CGU | `/mentions-legales` et `/cgu` |

Dans le back-office :

- Le tableau de bord compte les tickets fournis, les tickets utilisés, les lots gagnés, et
  répartit les gagnants par sexe et par âge.
- L'export emailing sort un CSV des clients qui ont consenti, et d'eux seuls.
- Le tirage au sort du gros lot tourne côté serveur. Un participant égale une chance, quel
  que soit son nombre de codes joués.
- L'espace boutique laisse l'employé chercher un client et marquer un lot remis. Il ne voit
  ni sa date de naissance ni ses préférences commerciales.

## Tester l'API

L'API sert trois consommateurs : le site, le back-office, et les caisses des dix boutiques.
Les endpoints caisse préparent aussi le futur site de vente en ligne.

Documentation interactive : <https://srv1581779.hstgr.cloud/docs>. Tu y lis chaque
endpoint, ses paramètres et ses réponses, et tu les appelles depuis la page.

### Les clés des consommateurs

| Consommateur | En-tête | Clé |
|---|---|---|
| Caisses magasin | `X-Api-Key` | `ddc920d92fae8c0c173805950c54bea9bf81a1250188e35a` |
| Futur e-commerce | `X-Api-Key` | `19af2ca5ba6680762ccb0d56d7f39af0cb2040e0a3054b46` |

Deux clés et pas une seule, pour que l'une puisse être révoquée sans couper l'autre.

### Trois appels qui montrent le métier

Ce que voit une caisse, sans jamais apprendre le lot qu'elle imprime :

```
curl -H "X-Api-Key: ddc920d92fae8c0c173805950c54bea9bf81a1250188e35a" \
  https://srv1581779.hstgr.cloud/v1/pos/contest
```

Un ticket à 49,00 € pile, refusé. Le règlement dit « une somme supérieure à 49 € », donc
la comparaison est stricte :

```
curl -X POST https://srv1581779.hstgr.cloud/v1/pos/codes/dispense \
  -H "X-Api-Key: ddc920d92fae8c0c173805950c54bea9bf81a1250188e35a" \
  -H "Content-Type: application/json" \
  -d '{"channel":"IN_STORE","storeId":"cmwiyethi000g0uoblwjuhoj6","purchaseAmountCents":4900}'
```

L'identifiant ci-dessus est celui de la boutique de Nice. La liste complète est sur
<https://srv1581779.hstgr.cloud/v1/stores>, sans authentification.

Le même appel à `4901` délivre un code. C'est la démonstration que « une somme supérieure
à 49 € » se lit au sens strict.

Sans clé, tout endpoint caisse répond 401.

## Ce que tu peux vérifier en base

| Mesure | Valeur |
|---|---|
| Codes en base | 500 000 |
| Répartition | 60 / 20 / 10 / 6 / 4 %, exacte |
| Codes mal formés | 0 |
| Codes sans chiffre ou sans lettre | 0 |
| Doublons | 0 |
| Boutiques | 10, dont Nice ouverte le jour du lancement |
| Participations de démonstration | 2 037, sur 1 203 clients |
| Lots déjà remis | 1 244 |

La répartition n'est pas statistique. Le vecteur de lots est construit, mélangé, puis tiré.
Un script la recompte en base et sort en erreur à la moindre différence.

Sans navigateur :

```
curl -I https://srv1581779.hstgr.cloud
curl -s https://srv1581779.hstgr.cloud/health
curl -s https://srv1581779.hstgr.cloud/v1/contest
curl -s https://srv1581779.hstgr.cloud/v1/prizes
```

## Les dossiers

| Document | Où le lire |
|---|---|
| Cahier des charges | <https://docs.google.com/document/d/1EvdQg0d10Yi70kN47ExMLsjHmC8vhL_RpZHuF9y_Otw/edit?usp=sharing> |
| Cahier des spécifications techniques | <https://docs.google.com/document/d/1DLrvM9LSZkpNnpW76hh1MlRw12kMtWCKnA8sOFqi4SM/edit> |
| Maquettes Figma | <https://www.figma.com/design/CkO6KsKKatpJPP2ky53WOO/Design---Site-The-Tip-TOP> |

Le dépôt Git garde les sources de ces dossiers, partie par partie, dans
`02-cahier-des-charges` et `03-cahier-specifications-techniques`.

## Le dépôt de code

| | |
|---|---|
| Hébergeur | GitHub |
| Adresse | <https://github.com/DaveGlad/estd-archi-o25a> |
| Visibilité | **Public** |
| Identifiant | Aucun. Le dépôt se lit sans compte GitHub |
| Propriétaire du compte | `DaveGlad` |

Le dépôt est public. Tu cliques sur le lien, tu lis tout : le code, les deux dossiers, le
workflow, l'historique des commits. Tu n'as besoin ni de compte ni de mot de passe.

Branches GitFlow : `main` pour la production, `develop` pour l'intégration, puis
`feature/*`, `release/*` et `hotfix/*`.

| Dossier | Contenu |
|---|---|
| `01-pilotage` | Backlog, décisions, planning, répartition |
| `02-cahier-des-charges` | Le cahier des charges |
| `03-cahier-specifications-techniques` | Le CST |
| `04-design` | Logo, charte graphique, maquettes |
| `05-workflow` | Docker, Jenkins, métriques, sauvegardes |
| `06-app` | Le code du site : API, site public, back-office |

## Le serveur et le workflow

| | |
|---|---|
| Machine | VPS Hostinger, Debian 13, 2 vCPU, 8 Go |
| Adresse IP | 147.79.115.185 |
| Accès | Clé SSH, compte non root, connexion par mot de passe coupée |
| Certificat | Let's Encrypt, renouvelé par Traefik |
| Conteneurs en production | api, web, admin, postgres, redis, deux exportateurs de métriques |

### Ce qui tourne aujourd'hui

- Le site, l'API et le back-office, en production, derrière HTTPS.
- Grafana, avec son tableau de bord alimenté par les métriques de l'API.
- Gitea et le registry d'images.
- Les tests, lancés à la main et tous verts : 69 unitaires, 32 d'intégration, 53
  fonctionnels, et 3 scénarios de charge k6 qui tiennent leurs six seuils sur 2 492
  itérations.

### Ce qui est écrit et pas encore exécuté

Les trois pipelines sont dans le dépôt, un par forme de projet : site administrable, site
vitrine HTML et CSS, application mobile hybride. **Aucun n'a encore tourné.** Jenkins est
arrêté le temps d'une correction de sécurité, et il n'est pas encore relié à un dépôt.

Le déploiement en production d'aujourd'hui, je l'ai fait à la main avec
`05-workflow/jenkins/scripts/deploy.sh`, le script que le pipeline appelle. Les images ont
été construites sur le serveur, pas par la CI.

Ce que les pipelines feront une fois branchés :

- Optimisation des assets pendant le build.
- Déploiement automatique en dev sur fusion dans `develop`.
- Stockage des images construites dans le registry.
- Déploiement automatique en préproduction sur fusion dans `release/*`.
- Déploiement en production sur étiquette, après validation humaine.
- Publication et archivage des rapports JUnit à chaque build.

### Où lire les rapports de tests

Les rapports sont générés au format JUnit dans `reports/junit/` du dépôt, à chaque
exécution :

| Fichier | Contenu |
|---|---|
| `reports/junit/vitest.xml` | Tests unitaires et d'intégration |
| `reports/junit/playwright.xml` | Tests fonctionnels, trois navigateurs |
| `reports/junit/k6.xml` | Tests de charge, un cas par seuil |

Tu peux les régénérer toi-même depuis `06-app/theetiptop-contest` :

```
npm run test
npm run test:integration
npm run test:e2e
npm run test:perf
```

Une fois Jenkins branché, ces mêmes fichiers apparaissent dans l'onglet **Tests** de
chaque build, avec la courbe de tendance.

### Sauvegardes

Les scripts et les minuteries systemd sont dans `05-workflow/backup`. Ils ne sont pas
encore installés sur le serveur : la sauvegarde part hors site, et il manque l'espace de
stockage distant.

### Les services en ligne

| Service | Adresse | Identifiant | Mot de passe |
|---|---|---|---|
| Gitea | <https://srv1581779.hstgr.cloud/git> | `gitea-admin` | `UuvUi5LlYaTEsUF0mZH0` |
| Grafana | <https://srv1581779.hstgr.cloud/grafana> | `admin` | `V5xC2k2dv1k4emoGYkth` |
| Registry d'images | interne au serveur | `ci` | `hXdEkEbWvkbToaE2QnXa` |
| Jenkins | <https://srv1581779.hstgr.cloud/ci> | `admin` | `rTRMwmsrry6HLByK68I1` |

Comment entrer dans chacun :

- **Grafana** : la page s'ouvre sur un écran de connexion. Une fois dedans, menu
  **Dashboards**, dossier **Thé Tip Top**, tableau **Jeu-concours**. Il montre les codes
  restants, les saisies par issue, la latence de l'API et les lots remis.
- **Jenkins** : la page s'ouvre sur **Sign in**. Une fois dedans, tu vois les trois
  pipelines déclarés. Ils n'ont pas encore de build, leurs dépôts ne sont pas branchés.
- **Gitea** : la page s'ouvre sur **Sign In**, en haut à droite. L'instance est vide, elle
  attend la migration des dépôts depuis GitHub.
- **Registry** : pas d'interface web et pas d'adresse publique, voir ci-dessous.

Le registry n'a pas d'adresse publique, et c'est voulu. `docker login` et `docker push`
s'adressent à `/v2/` à la racine d'un hôte, sans préfixe possible. Jenkins l'atteint par le
réseau interne, et c'est son seul client.

Dans Jenkins, les trois pipelines sont déjà déclarés : `theetiptop-contest`,
`demo-site-vitrine` et `demo-app-mobile`. Ils attendent leurs dépôts dans Gitea.

Le contrôleur ne porte aucun exécuteur. Les builds partent sur des agents jetables. Il
détient les identifiants et le socket Docker, donc y exécuter du code de projet
reviendrait à donner le serveur à n'importe quel `Jenkinsfile`.

Ces quatre comptes ont été testés un par un : bon mot de passe accepté, mauvais mot de
passe refusé, accès anonyme refusé.

## Analytics et gestion de projet

### Google Analytics

| | |
|---|---|
| Console | <https://analytics.google.com> |
| Compte | Thé Tip Top, ID `416403635` |
| Propriété | Thé Tip Top, site jeu-concours, ID `564458132` |
| Fuseau et devise | France, euro |
| Flux Web | Thé Tip Top, site public |
| Identifiant de mesure | `G-ZD73MP4G1E` |
| Compte Google | *à compléter* |

La propriété est créée et rattachée à <https://srv1581779.hstgr.cloud>. Elle ne reçoit pas
encore de données : la balise n'est pas posée sur le site.

Elle ne le sera pas sans consentement. La CNIL demande que les cookies de mesure ne se
chargent qu'après un accord explicite, et le site a déjà sa page de gestion des cookies.
La balise sera donc appelée par le bandeau de consentement, pas par le `<head>`.

Les quatre événements prévus au cahier des charges, partie D :

- Vue de page.
- Envoi du formulaire d'inscription.
- Clic sur l'appel à l'action principal.
- Participation au jeu, avec le lot gagné en paramètre.

Compte 24 à 48 heures entre la pose de la balise et les premières données visibles.

### Gestion de projet

| | |
|---|---|
| Outil | Trello |
| Tableau | <https://trello.com/b/6ZYwiaW8/projet-the-tiptop> |
| Identifiant | *à compléter* |

Le backlog est versionné dans `01-pilotage/BACKLOG.md`. Le fichier
`01-pilotage/backlog.csv` s'importe directement dans Trello ou Notion, avec les colonnes
Titre, Étiquette, Responsable, Deadline et Statut.

## Le nom de domaine

L'adresse ci-dessus est celle du serveur. Le sujet demande un domaine portant le numéro de
classe et le numéro de groupe : `dsp5-archi-o25a-15M-G1.fr` pour le site et
`wk-archi-o25a-15M-G1.fr` pour le workflow. Leur achat est en cours. Le basculement ne
coupera pas le service : l'adresse est une variable de déploiement, pas une valeur écrite
dans le code.
