---
title: "Accès site internet et comptes divers"
subtitle: "ESTD ARCHI O25A, Groupe 1. Thé Tip Top, par Furious Ducks"
date: "16 novembre 2026"
lang: fr
---

Projet étudiant fictif. La société Thé Tip Top et l'agence Furious Ducks sont des supports
de formation. Aucun achat, aucune réservation et aucune participation réelle ne peut être
effectué sur ce site.

## Te connecter

Tout tient sur une seule adresse, en HTTPS.

| | |
|---|---|
| Site public | <https://srv1581779.hstgr.cloud> |
| Back-office | <https://srv1581779.hstgr.cloud/backoffice> |
| Documentation de l'API | <https://srv1581779.hstgr.cloud/docs> |

Le mot de passe est le même pour les quatre comptes : **MotDePasse2026!**

| Rôle | Identifiant | Tu vas où | Tu vois quoi |
|---|---|---|---|
| Administrateur | `admin@theetiptop.fr` | `/backoffice` | Statistiques, export emailing, tirage au sort |
| Employé boutique | `sofia.legrand@theetiptop.fr` | `/backoffice` | Recherche client, remise d'un lot |
| Cliente | `camille.rousseau@example.fr` | Site public | Ses gains, saisie de code, droits RGPD |
| Client | `theo.marchand@example.fr` | Site public | Second compte, pour voir le cloisonnement |

Ces comptes servent à la démonstration. Les données derrière sont fabriquées.

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
| `SQ5HZQ10Z7` | Coffret découverte à 69 € |
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

Ce que le workflow automatise :

- Optimisation des assets pendant le build.
- Déploiement automatique en dev sur fusion dans `develop`.
- Stockage des images construites dans un registry auto-hébergé.
- Déploiement automatique en préproduction sur fusion dans `release/*`.
- Déploiement en production sur étiquette, après validation humaine.
- 69 tests unitaires, 32 tests d'intégration, 53 tests fonctionnels.
- 3 scénarios de charge k6, 2 492 itérations, six seuils sur six tenus.
- Rapports JUnit publiés et archivés par Jenkins.
- Sauvegardes quotidiennes et mensuelles, chiffrées, envoyées hors site.
- Test de restauration mensuel, avec quatre contrôles métier.

Trois pipelines, un par forme de projet : site administrable, site vitrine HTML et CSS,
application mobile hybride.

### Les services en ligne

| Service | Adresse | Identifiant | Mot de passe |
|---|---|---|---|
| Gitea | <https://srv1581779.hstgr.cloud/git> | `gitea-admin` | `UuvUi5LlYaTEsUF0mZH0` |
| Grafana | <https://srv1581779.hstgr.cloud/grafana> | `admin` | `V5xC2k2dv1k4emoGYkth` |
| Registry d'images | interne au serveur | `ci` | `hXdEkEbWvkbToaE2QnXa` |
| Jenkins | <https://srv1581779.hstgr.cloud/ci> | `admin` | remise en service en cours |

Dans Grafana, ouvre le dossier **Thé Tip Top**, tableau **Jeu-concours**. Il montre les
codes restants, les saisies par issue, la latence de l'API et les lots remis.

Le registry n'a pas d'adresse publique, et c'est voulu. `docker login` et `docker push`
s'adressent à `/v2/` à la racine d'un hôte, sans préfixe possible. Jenkins l'atteint par le
réseau interne, et c'est son seul client.

Gitea finit son installation. Le compte ci-dessus est prêt à être activé.

Jenkins est arrêté le temps d'une correction. L'image officielle n'installe ses greffons
qu'à la construction, pas au démarrage. Sans greffons, la configuration as code ne se
charge pas, donc aucun contrôle d'accès ne s'applique, et le contrôleur accepte tout le
monde alors qu'il a le socket Docker. Je l'ai coupé dès le constat. Il revient avec ses
greffons intégrés à l'image.

## Google Analytics et gestion de projet

| | |
|---|---|
| Google Analytics | *à compléter* |
| Gestion de projet | Trello, <https://trello.com/b/6ZYwiaW8/projet-the-tiptop> |

Le backlog est versionné dans `01-pilotage/BACKLOG.md`. Le fichier
`01-pilotage/backlog.csv` s'importe directement dans Trello ou Notion, avec les colonnes
Titre, Étiquette, Responsable, Deadline et Statut.

## Le nom de domaine

L'adresse ci-dessus est celle du serveur. Le sujet demande un domaine portant le numéro de
classe et le numéro de groupe : `dsp5-archi-o25a-15M-G1.fr` pour le site et
`wk-archi-o25a-15M-G1.fr` pour le workflow. Leur achat est en cours. Le basculement ne
coupera pas le service : l'adresse est une variable de déploiement, pas une valeur écrite
dans le code.
