# Métriques, journaux et alertes

Exigence n° 3 du sujet : le workflow doit comporter des métriques. Le dysfonctionnement
n° 7 de l'état des lieux est qu'il n'y en a aucune, Furious Ducks apprend ses pannes par
ses clients.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `prometheus.yml` | Ce qui est collecté, et à quelle fréquence |
| `alerts.yml` | Les règles. Une par situation pour laquelle on se lève |
| `alertmanager.yml` | Où partent les alertes, et à quelle urgence |
| `blackbox.yml` | Sondes **depuis l'extérieur** |
| `promtail.yml` | Collecte des journaux de conteneurs vers Loki |
| `grafana/` | Sources de données et tableaux de bord, provisionnés par fichier |

## La règle éditoriale

**Chaque règle de `alerts.yml` est une situation pour laquelle quelqu'un se lève.** C'est
toute la politique. Un système à quarante règles entraîne l'équipe à ignorer la
notification, et celle qui comptait arrive dans le même canal muet que les trente-neuf
autres.

Chaque alerte porte un `summary` (ce qui est cassé) et une `description` (quoi en faire).
Une alerte qui ne dit pas quoi faire est une notification, pas une alerte.

## Ce que seule l'application peut dire

CPU, mémoire, redémarrages de conteneurs : `node_exporter` et `cAdvisor` les fournissent
sans rien demander au code. Ce que **seule** l'application peut publier, c'est l'état du
jeu-concours, et c'est le module `apps/api/src/modules/metrics/` qui s'en charge.

| Métrique | La question à laquelle elle répond |
|---|---|
| `theetiptop_codes_available` | Les codes vont-ils tenir les trente jours ? Le pool **ne peut pas** être réapprovisionné |
| `theetiptop_participations_total{outcome}` | Est-ce nous qui cassons le parcours du joueur, ou les joueurs qui rejouent des tickets ? |
| `theetiptop_codes_dispensed_total{channel}` | À quelle vitesse le pool se vide, et une caisse a-t-elle cessé d'appeler l'API ? |
| `theetiptop_prizes_redeemed_total` | Les lots arrivent-ils réellement entre les mains des gagnants ? |
| `http_request_duration_seconds` | Quelle latence sur le parcours que tout le jeu sert ? |

Les six issues de la saisie sont comptées **séparément**, pas en total. Une montée de
`ALREADY_USED`, ce sont des clients qui rejouent un ticket ; une montée de `ERROR`, c'est
nous. Un compteur unique masquerait la seconde dans la première.

### Le libellé par gabarit de route, jamais par URL

`http_request_duration_seconds` est étiqueté `/v1/participations/:id`, pas
`/v1/participations/clx7a…`. Étiqueter par URL créerait **une série temporelle par
participation**, et c'est la façon classique de faire tomber un serveur Prometheus avec sa
propre instrumentation. Les 404 sont regroupées sous `unmatched` pour la même raison : un
scanner qui parcourt le site en créerait des milliers.

## La sonde externe

Tous les autres collecteurs interrogent depuis l'intérieur du réseau et ne peuvent donc
**pas** voir un certificat expiré, une erreur DNS ou un routage de proxy vers le mauvais
conteneur. `blackbox-exporter` répond à la seule question que pose un client : est-ce que
le site s'affiche.

C'est aussi lui qui expose la date d'expiration TLS, que lit l'alerte
`CertificateExpiringSoon`. Cette alerte ne surveille pas vraiment l'expiration, Traefik
renouvelle automatiquement à 30 jours, elle surveille le **renouvellement** : si elle se
déclenche, c'est qu'ACME échoue depuis deux semaines.

## Les journaux, dans le même outil

Sans journaux, une alerte ne se diagnostique pas. Loki et Prometheus sont tous deux sources
de données Grafana, donc un pic sur une courbe est à un clic des lignes qui l'ont produit.
Le projet compose devient une étiquette, pour que les journaux de production et ceux de
préproduction ne soient pas lus côte à côte par erreur pendant un incident.

## Les sauvegardes remontent ici aussi

`backup.sh` et `restore-test.sh` écrivent dans le collecteur `textfile` de
`node_exporter`. Trois alertes en découlent : sauvegarde périmée, test de restauration en
échec, test de restauration non exécuté depuis 45 jours.

C'est ce qui transforme « la tâche de sauvegarde a cessé de tourner », découvert au
moment d'une restauration, en une alerte du jour même.

## Tableaux de bord provisionnés, pas cliqués

`grafana/dashboards/jeu-concours.json` est versionné. Un tableau de bord construit dans
l'interface vit dans un volume, disparaît avec lui, et ne passe pas en revue de code.
`allowUiUpdates: false` refuse les modifications depuis le navigateur plutôt que de les
écraser silencieusement au redémarrage suivant.

## Vérifier la configuration avant de la déployer

```bash
docker run --rm -v "$PWD:/w" -w /w prom/prometheus:v3.1.0 \
  promtool check config prometheus.yml

docker run --rm -v "$PWD:/w" -w /w prom/prometheus:v3.1.0 \
  promtool check rules alerts.yml

docker run --rm -v "$PWD:/w" -w /w prom/alertmanager:v0.28.0 \
  amtool check-config alertmanager.yml
```

Une règle avec une erreur de syntaxe n'empêche pas Prometheus de démarrer : elle est
simplement ignorée. L'alerte n'existe pas et rien ne le signale.
