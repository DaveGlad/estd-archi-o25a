# E. Diagramme d'infrastructure complet du workflow

Cette partie décrit l'infrastructure réelle du workflow : les services qui la composent, la façon dont ils sont isolés les uns des autres, les ports qu'ils exposent et les protocoles qu'ils utilisent pour communiquer.

## E.1 Principes d'architecture

Quatre règles ont guidé la construction de cette infrastructure.

**Un seul point d'entrée.** Tout le trafic venant d'internet passe par le reverse proxy, sur les ports 80 et 443 uniquement. Aucun autre port n'est ouvert vers l'extérieur. Les interfaces d'administration de Jenkins, de Gitea ou de Grafana ne sont donc jamais joignables directement, ce qui réduit fortement la surface exposée.

**Des réseaux cloisonnés.** Les conteneurs sont répartis dans des réseaux Docker distincts. Un conteneur ne peut parler qu'aux services de son propre réseau. Concrètement, l'application de l'environnement de développement n'a aucun moyen d'atteindre la base de données de production, même en cas de compromission.

**Aucune base de données exposée.** PostgreSQL et Redis n'ont pas de port publié sur l'hôte. Ils ne sont joignables que depuis les conteneurs du même réseau, en utilisant le nom du service comme nom d'hôte.

**Le chiffrement s'arrête au proxy.** Traefik termine le TLS et obtient les certificats automatiquement. Derrière lui, les échanges se font en HTTP simple à l'intérieur d'un réseau privé qui ne sort jamais de la machine. C'est un compromis assumé : chiffrer aussi les communications internes apporterait peu ici, et coûterait en complexité comme en consommation processeur.

## E.2 Vue d'ensemble

```
                            INTERNET
                                │
                    80/tcp HTTP │ 443/tcp HTTPS
                                ▼
          ┌─────────────────────────────────────────┐
          │              TRAEFIK                    │
          │   reverse proxy, terminaison TLS        │
          │   redirection 80 vers 443               │
          └────┬───────────┬──────────┬─────────────┘
               │           │          │
     réseau    │           │          │   réseau     réseau     réseau
     workflow  │           │          │   dev        preprod    prod
       ┌───────┴───┬───────┴──┬───────┴───┐
       ▼           ▼          ▼           ▼
  ┌─────────┐ ┌─────────┐ ┌────────┐ ┌─────────┐
  │  GITEA  │ │ JENKINS │ │REGISTRY│ │ GRAFANA │
  │  :3000  │ │  :8080  │ │ :5000  │ │  :3000  │
  └────┬────┘ └────┬────┘ └────▲───┘ └────┬────┘
       │           │           │          │
       │  webhook  │  push     │          │ requêtes
       │  HTTP     │  HTTPS    │          │ PromQL
       │           │           │          ▼
       │      ┌────▼─────┐     │     ┌──────────┐
       │      │  AGENTS  │─────┘     │PROMETHEUS│
       │      │ JENKINS  │           │  :9090   │
       │      │ éphémères│           └────┬─────┘
       │      └────┬─────┘                │ scrape
       └───────────┘                      │ HTTP
                   │                      │
                   │ déploiement          │
    ┌──────────────┼──────────────────────┼──────────────┐
    ▼              ▼                      ▼              ▼
┌────────┐   ┌──────────┐          ┌──────────┐   ┌──────────┐
│  DEV   │   │ PREPROD  │          │   PROD   │   │  BACKUP  │
│api web │   │ api web  │          │ api web  │   │ planifié │
│admin   │   │ admin    │          │ admin    │   │          │
│pg redis│   │ pg redis │          │ pg redis │   └────┬─────┘
└────────┘   └──────────┘          └──────────┘        │
                                                        ▼
                                              stockage externalisé
                                                 (hors site)
```

## E.3 Sous-domaines exposés

Le sujet demande un sous-domaine par outil. Voici la répartition, en reprenant la convention de nommage imposée pour la classe et le groupe.

| Service | Sous-domaine | Accès |
|---|---|---|
| Page d'accueil du workflow | `wk-archi-o25a-15M-G{n}.fr` | Public, présentation |
| Gitea | `git.wk-archi-o25a-15M-G{n}.fr` | Authentifié |
| Jenkins | `jenkins.wk-archi-o25a-15M-G{n}.fr` | Authentifié, équipe plateforme |
| Registry | `registry.wk-archi-o25a-15M-G{n}.fr` | Authentifié |
| Grafana | `grafana.wk-archi-o25a-15M-G{n}.fr` | Authentifié |
| Prometheus | `prometheus.wk-archi-o25a-15M-G{n}.fr` | Authentifié, lecture seule |
| Traefik (tableau de bord) | `proxy.wk-archi-o25a-15M-G{n}.fr` | Authentifié, équipe plateforme |
| Application, dev | `dev.dsp5-archi-o25a-15M-G{n}.fr` | Restreint à l'équipe |
| Application, préproduction | `preprod.dsp5-archi-o25a-15M-G{n}.fr` | Équipe et client |
| Application, production | `dsp5-archi-o25a-15M-G{n}.fr` | Public |

## E.4 Ports et protocoles

### Ce qui est ouvert vers internet

| Port | Protocole | Service | Rôle |
|---|---|---|---|
| 80 | HTTP | Traefik | Redirection vers 443 et validation des certificats |
| 443 | HTTPS | Traefik | Tout le trafic applicatif et d'administration |
| 22 | SSH | Hôte | Administration, restreint par filtrage d'adresses et par clé |

Rien d'autre. C'est le point le plus important de cette architecture.

### Ce qui circule à l'intérieur

| Service | Port interne | Protocole | Qui l'appelle |
|---|---|---|---|
| Gitea, interface web | 3000 | HTTP | Traefik |
| Gitea, SSH Git | 2222 | SSH | Développeurs, via redirection sur le port 22 de l'hôte ou via HTTPS |
| Jenkins, interface web | 8080 | HTTP | Traefik |
| Jenkins, canal des agents | 50000 | TCP (JNLP) | Agents Jenkins uniquement, jamais exposé |
| Registry | 5000 | HTTP | Traefik, agents Jenkins |
| Prometheus | 9090 | HTTP | Traefik, Grafana |
| Grafana | 3000 | HTTP | Traefik |
| Exportateur de métriques système | 9100 | HTTP | Prometheus |
| Exportateur de métriques conteneurs | 8080 | HTTP | Prometheus |
| API applicative | 3000 | HTTP | Traefik, applications web et admin |
| Application web | 3000 | HTTP | Traefik |
| Application admin | 3000 | HTTP | Traefik |
| PostgreSQL | 5432 | TCP | API uniquement, même réseau |
| Redis | 6379 | TCP | API uniquement, même réseau |
| Socket Docker | fichier local | UNIX | Traefik en lecture seule, agents Jenkins |

Le même numéro de port revient plusieurs fois, par exemple 3000 pour Gitea, Grafana et les applications. Ce n'est pas un conflit : chaque conteneur possède sa propre pile réseau, et le proxy les distingue par leur nom de service dans le réseau Docker.

## E.5 Cloisonnement réseau

| Réseau Docker | Contient | Peut joindre |
|---|---|---|
| `proxy` | Traefik | Tous les réseaux, c'est son rôle |
| `workflow` | Gitea, Jenkins, agents, registry | `proxy`, et les réseaux d'environnement pour déployer |
| `metrics` | Prometheus, Grafana, exportateurs | `proxy`, lecture des métriques des autres réseaux |
| `env-dev` | api, web, admin, postgres, redis de développement | `proxy` seulement |
| `env-preprod` | les mêmes, en préproduction | `proxy` seulement |
| `env-prod` | les mêmes, en production | `proxy` seulement |

Les trois réseaux d'environnement sont totalement étanches entre eux. Un incident ou une compromission sur l'environnement de développement ne donne aucun accès à la base de production, ce qui est indispensable puisque cette dernière contient des données personnelles de participants au jeu-concours.

## E.6 Les flux, dans l'ordre où ils se produisent

Le trajet d'un changement de code, depuis le poste du développeur jusqu'à la production.

| # | Flux | Origine et destination | Protocole et port | Déclencheur |
|---|---|---|---|---|
| 1 | Envoi du code | Poste développeur vers Gitea | SSH 22 ou HTTPS 443 | `git push` |
| 2 | Notification | Gitea vers Jenkins | HTTP interne 8080 | Webhook sur le push |
| 3 | Démarrage d'un agent | Jenkins vers le démon Docker | Socket UNIX | Début de pipeline |
| 4 | Récupération du code | Agent vers Gitea | HTTP interne 3000 | Étape de checkout |
| 5 | Publication de l'image | Agent vers registry | HTTPS 443 | Build réussi et scan conforme |
| 6 | Déploiement | Agent vers le démon Docker | Socket UNIX | Merge sur `develop` ou `release/*` |
| 7 | Récupération de l'image | Démon Docker vers registry | HTTPS 443 | Démarrage des conteneurs |
| 8 | Tests fonctionnels | Agent vers l'environnement déployé | HTTPS 443 | Après déploiement |
| 9 | Publication des rapports | Agent vers Jenkins | HTTP interne 8080 | Fin de pipeline |
| 10 | Collecte des métriques | Prometheus vers les exportateurs | HTTP interne 9100 et 8080 | Toutes les 15 secondes |
| 11 | Consultation | Grafana vers Prometheus | HTTP interne 9090 | À la demande |
| 12 | Alerte | Prometheus vers messagerie | HTTPS 443 sortant | Seuil dépassé |
| 13 | Sauvegarde | Conteneur de sauvegarde vers stockage externe | HTTPS 443 sortant | Planification quotidienne |

Le flux 2 mérite une remarque. C'est lui qui rend l'intégration réellement continue : sans ce webhook, il faudrait que Jenkins interroge le dépôt à intervalles réguliers, ce qui allongerait le délai de retour et consommerait des ressources pour rien la plupart du temps.

## E.7 Volumes persistants

Les conteneurs sont jetables, les données ne le sont pas. Ce tableau liste ce qui doit survivre à la destruction d'un conteneur, et donc ce que la sauvegarde doit couvrir.

| Volume | Contenu | Sauvegardé |
|---|---|---|
| `gitea_data` | Dépôts Git, configuration, comptes | Quotidien |
| `jenkins_home` | Jobs, identifiants, historique des builds | Quotidien |
| `registry_data` | Images Docker publiées | Hebdomadaire |
| `prometheus_data` | Historique des métriques | Hebdomadaire |
| `grafana_data` | Tableaux de bord et alertes | Hebdomadaire |
| `pg_data_prod` | Base de production | Quotidien, plus journal de transactions |
| `pg_data_preprod`, `pg_data_dev` | Bases des autres environnements | Hebdomadaire |
| `traefik_certs` | Certificats TLS | Quotidien |

## E.8 Ce que le schéma laisse volontairement de côté

Deux points méritent d'être signalés au client plutôt que passés sous silence.

Le premier concerne la haute disponibilité. L'architecture proposée tient sur une seule machine, ou deux si le dimensionnement de la partie D.3 impose la séparation. Il n'y a donc pas de redondance : une panne matérielle interrompt le service jusqu'à restauration, dans les limites du RTO annoncé. Une architecture redondée multiplierait le coût par deux au minimum, pour un bénéfice qui ne se justifie pas au démarrage. Le sujet pourra être réexaminé quand le workflow gérera l'ensemble du portefeuille de l'agence.

Le second concerne le poste de travail des développeurs. Il n'apparaît pas dans le schéma d'infrastructure parce qu'il n'en fait pas partie, mais il reste le point d'entrée de la chaîne. Sa sécurisation, en particulier la gestion des clés SSH, relève des procédures décrites en partie G.
