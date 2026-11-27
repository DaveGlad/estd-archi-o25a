# Mise en ligne

> Exigence du sujet : « Le site internet et le workflow devront **obligatoirement** être
> mis en ligne pour la soutenance et rester disponibles au minimum jusqu'à la date du jury
> de validation. »

## Les deux noms de domaine

Le sujet impose **deux domaines distincts**, chacun portant le numéro de classe suivi du
numéro de groupe :

| Rôle | Forme imposée | Valeur du projet |
|---|---|---|
| Workflow et ses outils | `wk-archi-<classe>-G<groupe>.fr` | `wk-archi-o25a-15m-g3.fr` |
| Site du jeu-concours | `dsp5-archi-<classe>-G<groupe>.fr` | `dsp5-archi-o25a-15m-g3.fr` |

> **Ces deux valeurs sont encore des hypothèses.** Au 15 novembre 2026, ni l'un ni
> l'autre n'est déposé, `dig` ne renvoie ni enregistrement A ni serveur de noms. Le
> numéro de groupe et le format de classe doivent être confirmés avant achat, puis
> substitués partout (voir « Changer les domaines » plus bas).

### Les sous-domaines à prévoir

| Domaine | Sous-domaine | Sert |
|---|---|---|
| `wk-archi-…` | `git.` | Gitea |
| | `ci.` | Jenkins |
| | `registry.` | Registry d'images |
| | `metrics.` | Grafana |
| `dsp5-archi-…` | *(apex)* | Site public |
| | `www.` | Redirection permanente vers l'apex |
| | `api.` | API v1 |
| | `admin.` | Back-office |

Tous en `A` vers l'IP du VPS. Le sujet demande explicitement « des sous-domaines pour
chaque outil utilisé (Jenkins, Prometheus…) ».

## L'ordre, et pourquoi il compte

### 1. Le DNS, avant Traefik

Let's Encrypt valide la possession du nom **en interrogeant le nom lui-même**. Une demande
de certificat émise avant que le DNS ne résolve échoue, et les échecs comptent dans le
quota : cinq par heure et par domaine. Démarrer Traefik trop tôt coûte donc une heure
d'attente, pas une minute.

Vérifier avant d'aller plus loin :

```bash
dig +short dsp5-archi-o25a-15m-g3.fr A
dig +short api.dsp5-archi-o25a-15m-g3.fr A
dig +short ci.wk-archi-o25a-15m-g3.fr A
```

### 2. Le socle

```bash
scp 05-workflow/bootstrap/bootstrap-vps.sh root@<ip>:/root/
ssh root@<ip> 'bash /root/bootstrap-vps.sh deploy'
```

Docker, pare-feu, durcissement SSH, réseaux, arborescence, swap. Idempotent : il se
rejoue sans rien casser, ce qui compte parce que la première exécution d'un script de
socle n'est presque jamais la seule.

> Le script **refuse de redémarrer sshd** si la configuration est invalide. Une erreur de
> syntaxe dans `sshd_config` met la machine hors d'atteinte définitivement : le démon ne
> redémarre pas et il ne reste que la console de l'hébergeur.

### 3. Les secrets

Sur l'hôte, jamais dans le dépôt :

```
/etc/theetiptop/backup.env                   BACKUP_REMOTE, BACKUP_AGE_RECIPIENT, BACKUP_AGE_KEY
/etc/theetiptop/alerting/oncall-webhook      URL du canal d'astreinte
/etc/theetiptop/alerting/platform-webhook    URL du canal plateforme
/etc/theetiptop/alerting/smtp-password       mot de passe SMTP
/etc/theetiptop/registry/htpasswd            identifiants du registry
05-workflow/.env.workflow                    depuis .env.workflow.example
05-workflow/docker/.env.prod                 depuis .env.deploy.example
```

Le fichier du registry se génère une fois, en **bcrypt**, le registry refuse tout autre
algorithme :

```bash
sudo install -d -m 700 /etc/theetiptop/registry
docker run --rm --entrypoint htpasswd httpd:2 -Bbn ci '<mot-de-passe>' \
  | sudo tee /etc/theetiptop/registry/htpasswd > /dev/null
```

Le même couple identifiant / mot de passe est ensuite déposé dans Jenkins sous
l'identifiant `registry-credentials`, que les trois pipelines réclament.

```bash
openssl rand -base64 32   # BETTER_AUTH_SECRET, mots de passe PostgreSQL et Redis, Grafana
openssl rand -hex 32      # IP_HASH_SALT
age-keygen -o /etc/theetiptop/backup-key.txt
```

> `IP_HASH_SALT` est généré **une fois par environnement** et ne tourne pas : le changer
> rend incomparables tous les hachages d'IP déjà enregistrés sur les participations.
>
> La **clé privée `age` doit exister ailleurs que sur ce serveur**. Une clé qui n'existe
> que sur la machine détruite rend les sauvegardes parfaitement inutiles.

### 4. Le workflow, puis les environnements

```bash
docker compose -f 05-workflow/compose.workflow.yml --env-file 05-workflow/.env.workflow up -d
```

Traefik vit dans cette pile et détient les ports 80 et 443. Les environnements s'attachent
au réseau `edge` qu'il surveille ; les démarrer avant le laisse injoignables.

Attendre les certificats, une minute environ, puis vérifier :

```bash
curl -I https://ci.wk-archi-o25a-15m-g3.fr
docker compose -f 05-workflow/compose.workflow.yml logs traefik | grep -i acme
```

### 5. La base, les 500 000 codes

```bash
./05-workflow/jenkins/scripts/deploy.sh prod <tag>
```

Le service `migrate` s'exécute seul avant les applications, qui attendent sa réussite. Puis,
**une seule fois dans la vie du jeu** :

```bash
docker compose -f 05-workflow/docker/compose.prod.yml --env-file .env.prod -p theetiptop-prod \
  run --rm api node -e "require('./prisma/seed.js')"
docker compose … run --rm api npm run codes:generate   # ≈ 50 s
docker compose … run --rm api npm run codes:verify
```

`codes:generate` **refuse de s'exécuter si le pool existe déjà**. C'est voulu : une seconde
génération casserait la répartition 60/20/10/6/4 % déposée chez l'huissier.

La graine de génération s'affiche **une fois** et n'est pas stockée. La remettre à
l'huissier et au gestionnaire de secrets immédiatement, elle est ce qui permet de rejouer
la génération, et quiconque la détient peut dériver tous les codes et leurs lots.

> `db:seed:demo` ne doit **pas** être joué en production. Il refuse déjà
> `NODE_ENV=production`, mais la règle vaut d'être dite : 1 200 faux clients dans la base
> d'un jeu réel fausseraient les statistiques et l'export emailing.

### 6. Contrôler

```bash
curl -I https://dsp5-archi-o25a-15m-g3.fr
curl -s https://api.dsp5-archi-o25a-15m-g3.fr/health | jq
curl -s https://api.dsp5-archi-o25a-15m-g3.fr/metrics | grep theetiptop_codes_available
```

Et dans Grafana, sur `metrics.wk-archi-…`, le tableau de bord « Jeu-concours ».

## Dimensionnement : ce qui tient, et ce qui ne tient pas

Le CST partie D.3 dimensionne l'ensemble à **32 Go de RAM, minimum viable 16 Go**, et
prévoit explicitement le cas contraire :

> « Si le budget impose de descendre sous 32 Go, la répartition retenue est de séparer sur
> deux serveurs, l'un pour le workflow, l'autre pour les environnements gérés. »

Sur un VPS unique de 8 Go ou moins, **le workflow complet et les trois environnements ne
tiennent pas**. L'arbitrage à assumer, dans cet ordre :

| Priorité | Quoi | Pourquoi |
|---|---|---|
| 1 | Site en production + API + base | C'est ce que le sujet impose en ligne |
| 2 | Traefik et TLS | Sans lui, rien n'est joignable en HTTPS |
| 3 | Jenkins + Gitea | Le workflow doit être démontrable en soutenance |
| 4 | Prometheus + Grafana | Exigence n° 3, mais consultable en différé |
| 5 | Loki | Le premier à sacrifier : utile, pas exigé nommément |
|, | dev et préprod | À ne PAS déployer ici. Les démontrer depuis le pipeline |

`bootstrap-vps.sh` mesure la RAM au démarrage et avertit sous 16 Go plutôt que de laisser
découvrir le problème quand le tueur de mémoire arrête PostgreSQL en pleine écriture.

## Changer les domaines

Les deux noms apparaissent dans une douzaine de fichiers. Une fois le numéro de groupe
confirmé :

```bash
cd /Users/daveglad/Documents/work/estd-archi-o25a
git ls-files -z | xargs -0 sed -i '' \
  -e 's/dsp5-archi-o25a-15m-g3\.fr/<nouveau-domaine-site>/g' \
  -e 's/wk-archi-o25a-15m-g3\.fr/<nouveau-domaine-workflow>/g'
git diff --stat
```

Relire le diff avant de valider : `prometheus.yml` doit garder le domaine **du site** pour
ses cibles applicatives et le domaine **du workflow** pour ses outils. Les mélanger ferait
atterrir Jenkins et Grafana sur l'adresse publique du client.

Les images `web` et `admin` doivent être **reconstruites** après ce changement. Les
variables `NEXT_PUBLIC_*` sont des arguments de build inscrits dans le bundle navigateur :
une image construite avec l'ancien domaine appellera l'ancien domaine, quoi que dise le
`compose` de production.

## Ce que la mise en ligne ne couvre pas

| Point | État |
|---|---|
| Identifiants OAuth Google et Facebook | Le code se désactive proprement sans eux. Les connexions sociales resteront absentes tant qu'ils ne sont pas créés |
| Clés d'API des caisses | `POS_API_KEYS` doit être rempli, sinon les endpoints caisse refusent tout |
| Sauvegarde externalisée | Demande un espace de stockage et un `rclone config` sur l'hôte |
| Mention « projet étudiant fictif » | Déjà présente dans le pied de page et les mentions légales, comme le sujet l'exige |
