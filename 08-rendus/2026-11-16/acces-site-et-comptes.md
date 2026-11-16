---
title: "Accès site internet et comptes divers"
subtitle: "ESTD ARCHI O25A — Groupe 1 — Thé Tip Top / Furious Ducks"
date: "16 novembre 2026"
lang: fr
---

> **Projet étudiant fictif.** Le site, la société « Thé Tip Top » et l'agence « Furious
> Ducks » sont des supports de formation. Aucun achat, aucune réservation et aucune
> participation réelle ne peut être effectué.

---

## 1. Site internet du jeu-concours

| | |
|---|---|
| **URL du site public** | `https://theetiptop.nextilabs.com` |
| **URL du back-office** | `https://admin.theetiptop.nextilabs.com` |
| **URL de l'API** | `https://api.theetiptop.nextilabs.com` |
| **Documentation de l'API** | `https://api.theetiptop.nextilabs.com/docs` |
| **Serveur** | VPS Hostinger, Debian 13, `147.79.115.185` |
| **État au 16/11 à 09:00** | Applications déployées et saines sur le serveur. **Publication DNS en cours** — voir § 7 |

Le site est en ligne sur le serveur : les quatre conteneurs applicatifs répondent, la base
contient le jeu, les lots, les dix boutiques et les 500 000 codes. Ce qui reste à l'heure
du rendu est la **mise en service des noms de domaine**, détaillée au paragraphe 7.

### Ce que le site permet de faire

| Parcours | Chemin |
|---|---|
| Présentation du jeu et des lots | `/jeu-concours`, `/jeu-concours/lots` |
| Règlement du jeu | `/jeu-concours/reglement` |
| Inscription par formulaire, Google ou Facebook | `/inscription` |
| Saisie d'un code de ticket | `/participer` |
| Historique de ses gains | `/mon-compte/gains` |
| Droits RGPD : export, retrait de consentement, suppression | `/mon-compte/confidentialite` |

---

## 2. Comptes du site

### 2.1 Administrateur du back-office

| | |
|---|---|
| **URL** | `https://admin.theetiptop.nextilabs.com` |
| **Identifiant** | `admin@theetiptop.fr` |
| **Mot de passe** | *(voir § 8 — transmis séparément)* |

Donne accès aux statistiques du jeu, à l'export des données d'emailing, au tirage au sort
du gros lot et au paramétrage.

> **Pourquoi le mot de passe n'est pas dans le dépôt.** Les comptes de démonstration du
> code source utilisent un mot de passe commun et public ; ils sont **volontairement non
> insérés en production** (`NODE_ENV=production`). Le compte administrateur de production
> a donc un mot de passe propre, généré sur le serveur, qui n'existe dans aucun fichier
> versionné. C'est une décision de sécurité, pas un oubli : le dépôt est lu par les
> examinateurs.

### 2.2 Employé en boutique

| | |
|---|---|
| **URL** | `https://admin.theetiptop.nextilabs.com/employe` |
| **Identifiant** | `sofia.legrand@theetiptop.fr` |
| **Mot de passe** | *(voir § 8)* |
| **Rattachement** | Boutique de Nice Vieille Ville |

Permet de rechercher un client, de consulter ses gains et de marquer un lot comme remis.
Ce compte **ne voit ni la date de naissance ni les préférences commerciales** du client :
la minimisation RGPD s'applique aussi aux écrans internes.

### 2.3 Clients

| Identifiant | Profil |
|---|---|
| `camille.rousseau@example.fr` | Cliente, a joué des codes, opt-in commercial |
| `theo.marchand@example.fr` | Client, opt-out commercial |

Mots de passe au § 8. Ils servent à démontrer la saisie d'un code, l'historique des gains
et les droits RGPD.

### 2.4 Clés d'API des consommateurs non navigateur

L'API sert aussi les caisses des dix boutiques et le futur site e-commerce. Deux clés
distinctes, pour que l'une puisse être révoquée sans couper l'autre :

| Consommateur | En-tête | Clé |
|---|---|---|
| Caisses magasin | `X-Api-Key` | *(voir § 8)* |
| Futur e-commerce | `X-Api-Key` | *(voir § 8)* |

---

## 3. Dépôt de code

| | |
|---|---|
| **Hébergeur** | GitHub |
| **URL** | `https://github.com/DaveGlad/estd-archi-o25a` |
| **Identifiant** | *(à compléter par le groupe)* |
| **Mot de passe / jeton** | *(à compléter par le groupe)* |

Le dépôt contient les deux dossiers, le code applicatif, le workflow et le design.
Modèle de branches **GitFlow** : `main` (production), `develop` (intégration),
`feature/*`, `release/*`, `hotfix/*`.

Un second SCM, **Gitea**, est déployé dans le workflow (§ 4) : c'est lui que le pipeline
Jenkins interroge, conformément à l'exigence d'un workflow entièrement auto-hébergé et
open source.

---

## 4. Services du workflow

| Service | URL | Rôle |
|---|---|---|
| **Jenkins** | `https://ci.wk.nextilabs.com` | Intégration et déploiement continus |
| **Gitea** | `https://git.wk.nextilabs.com` | Gestionnaire de sources auto-hébergé |
| **Registry** | `https://registry.wk.nextilabs.com` | Stockage des images Docker construites |
| **Grafana** | `https://metrics.wk.nextilabs.com` | Métriques, tableaux de bord et alertes |

Identifiants au § 8.

> **Deux domaines distincts**, comme l'impose le document « Informations relatives à la
> mise en ligne » : un pour le workflow, un pour le site du client. Les valeurs
> définitives — `wk-archi-o25a-15M-G{n}.fr` et `dsp5-archi-o25a-15M-G{n}.fr` — sont en
> cours d'acquisition ; voir § 7.

### Ce que le workflow automatise

| Exigence du sujet | Où |
|---|---|
| Optimisation des assets | Intégrée au build Next.js et webpack ; étape dédiée pour le site vitrine |
| Déploiement automatique en dev | Sur fusion dans `develop` |
| Stockage des images construites | Registry auto-hébergé |
| Déploiement automatique en préproduction | Sur fusion dans `release/*` |
| Déploiement en production | Sur étiquette, **après validation humaine** |
| Tests unitaires et fonctionnels | 69 unitaires, 32 d'intégration, 53 fonctionnels, 3 scénarios de charge |
| Envoi et stockage des rapports | Rapports JUnit publiés et archivés par Jenkins |
| Sauvegardes automatisées | Quotidiennes et mensuelles, chiffrées, externalisées, **avec test de restauration** |

Trois pipelines, un par forme de projet, pour démontrer la généricité : site administrable
(le client), site vitrine HTML/CSS, application mobile hybride.

---

## 5. Google Analytics

| | |
|---|---|
| **Propriété** | *(à créer)* |
| **Identifiant de mesure** | *(à compléter)* |
| **Compte Google** | *(à compléter par le groupe)* |
| **Mot de passe** | *(à compléter par le groupe)* |

Les quatre événements prévus — vue de page, envoi de formulaire, clic sur l'appel à
l'action, participation au jeu — sont décrits au cahier des charges, partie D.

---

## 6. Outil de gestion de projet

| | |
|---|---|
| **Outil** | *(Trello ou Notion, à compléter)* |
| **URL publique** | *(à compléter)* |
| **Identifiant** | *(à compléter)* |
| **Mot de passe** | *(à compléter)* |

Le backlog est versionné dans le dépôt, en `01-pilotage/BACKLOG.md` et
`01-pilotage/backlog.csv` — ce dernier est directement importable dans Trello ou Notion
avec les colonnes `Titre, Étiquette, Responsable, Deadline, Statut`.

---

## 7. État exact de la mise en ligne au 16/11 à 09:00

Par honnêteté, ce que le jury pourra vérifier dès maintenant et ce qui arrive dans la
journée.

### Opérationnel sur le serveur

| Élément | État |
|---|---|
| Serveur préparé : Docker, pare-feu, durcissement SSH, swap | ✅ |
| Images applicatives construites sur la machine cible | ✅ api, web, admin, migrate |
| Schéma de base migré | ✅ 4 migrations appliquées |
| Jeu, 5 lots, gros lot, 10 boutiques | ✅ |
| **500 000 codes** avec répartition 60/20/10/6/4 % | ✅ générés et vérifiés en base |
| Conteneurs applicatifs | ✅ sains, le site répond |

### En cours

| Élément | Ce qui manque |
|---|---|
| **Noms de domaine définitifs** | Le sujet impose un domaine portant le numéro de classe et le numéro de groupe. Le numéro de groupe doit être confirmé pour acheter `wk-archi-o25a-15M-G{n}.fr` et `dsp5-archi-o25a-15M-G{n}.fr` |
| **Enregistrements DNS** | Trois entrées `A` vers `147.79.115.185` suffisent à publier le site sous `nextilabs.com` en attendant |
| **Certificats TLS** | Automatiques dès que le DNS résout : Traefik et Let's Encrypt sont configurés et en attente |

Les enregistrements à créer :

```
theetiptop.nextilabs.com.         A    147.79.115.185
api.theetiptop.nextilabs.com.     A    147.79.115.185
admin.theetiptop.nextilabs.com.   A    147.79.115.185
wk.nextilabs.com.                 A    147.79.115.185
git.wk.nextilabs.com.             A    147.79.115.185
ci.wk.nextilabs.com.              A    147.79.115.185
registry.wk.nextilabs.com.        A    147.79.115.185
metrics.wk.nextilabs.com.         A    147.79.115.185
```

> **Pourquoi l'ordre compte.** Let's Encrypt valide la possession d'un nom en
> l'interrogeant. Une demande émise avant que le DNS ne résolve échoue, et les échecs
> comptent dans un quota de cinq par heure et par domaine. Les certificats sont donc
> demandés **après** la propagation, pas avant.

Une **nouvelle version de ce document** sera remise dès la publication effective, les
remises multiples étant autorisées.

---

## 8. Mots de passe

Les mots de passe et les clés d'API ne figurent pas dans ce document et ne sont pas
versionnés. Ils sont transmis **par le canal séparé convenu avec le formateur**.

Ce n'est pas une précaution de principe : ce document circule par courriel et par la
plateforme de rendu, et il donne accès au back-office d'un site contenant des données
personnelles de clients — noms, adresses électroniques, dates de naissance, historique de
participation. Les diffuser dans le même fichier que les URL reviendrait à publier les
deux moitiés d'une serrure.

| Élément | Transmis |
|---|---|
| Mots de passe des quatre comptes du site | Canal séparé |
| Clés d'API des caisses et de l'e-commerce | Canal séparé |
| Identifiants Jenkins, Gitea, Registry, Grafana | Canal séparé |
| Clé SSH du serveur | Non transmise — accès par clé publique uniquement |

---

## Annexe — vérifier le déploiement

```bash
# Le site public
curl -I https://theetiptop.nextilabs.com

# L'API et son état de santé
curl -s https://api.theetiptop.nextilabs.com/health

# Le jeu en cours, ses dates et son seuil
curl -s https://api.theetiptop.nextilabs.com/v1/contest

# Les métriques exposées pour Prometheus
curl -s https://api.theetiptop.nextilabs.com/metrics | grep theetiptop_codes_available
```
