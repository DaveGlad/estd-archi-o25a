# Sauvegardes et restauration

Exigence n° 8 du sujet : « Vous devrez automatiser le backup de **l'intégralité** de votre
workflow et des projets gérés avec ce dernier. »

Les deux moitiés comptent. Sauvegarder les bases clientes en perdant Jenkins laisserait
l'agence avec des données qu'elle ne sait plus déployer ; sauvegarder Jenkins en perdant
les bases lui laisserait un pipeline et rien à livrer.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `backup.sh` | Sauvegarde quotidienne et mensuelle, chiffrée, externalisée |
| `restore-test.sh` | **Restauration réelle** dans un conteneur jetable, avec contrôles métier |
| `notify-failure.sh` | Alerte l'astreinte quand une des tâches échoue |
| `systemd/` | Les unités et leurs minuteries. Voir le README du dossier |

## Ce qui est sauvegardé

| Élément | Format | Pourquoi |
|---|---|---|
| PostgreSQL des 3 environnements | `pg_dump -Fc` | Format custom, compressé, **restaurable table par table**, ce qu'on veut réellement à 3 h du matin quand une seule table a été vidée |
| Gitea | `gitea dump` | Le code source de tous les projets. La seule perte à laquelle l'agence ne pourrait pas remédier |
| Jenkins | `tar` de `JENKINS_HOME` | Jobs, identifiants, plugins. **Sans l'historique des builds** : des dizaines de Go de journaux pour des artefacts déjà au registry |
| Registry | `tar` du stockage | Redondant en théorie, mais seulement si Gitea et Jenkins sont revenus d'abord. Raccourcit une panne de plusieurs heures à quelques minutes |
| Grafana et Prometheus | `tar` du volume | Petit, et pénible à refaire de mémoire au moment précis où on a besoin de visibilité |

## Chiffrement et externalisation

L'archive est **chiffrée avant de quitter la machine**. Elle contient la table des clients
d'un jeu-concours, noms, courriels, dates de naissance, donc une copie en clair chez un
hébergeur de stockage serait une violation RGPD en attente d'un bucket mal configuré.

`age` plutôt que GPG : une clé, pas de trousseau, pas d'agent, et une procédure de
restauration qu'une personne fatiguée peut suivre correctement.

> **La clé privée doit exister ailleurs que sur cette machine.** Une clé qui n'existe
> que sur le serveur détruit rend la sauvegarde parfaitement inutile. C'est l'erreur
> classique du chiffrement de sauvegardes, et elle ne se découvre qu'au sinistre.

## Rétention

| Jeu | Conservation | Ce qu'il couvre |
|---|---|---|
| Quotidien | 30 jours | L'erreur humaine, la migration ratée, la table vidée |
| Mensuel | 12 mois | La **corruption lente**. Un défaut constaté en mars a pu commencer en janvier, et 30 jours d'historique ne contiendraient que des copies du dégât |

## Le test de restauration

C'est une tâche distincte de la sauvegarde (W14 et non W13), et ce n'est pas de la
bureaucratie : **une sauvegarde jamais restaurée est une hypothèse.** Les deux pannes sont
différentes, « nous n'avons pas de copie » et « nous avons une copie inutilisable », et
la seconde ne se découvre qu'en situation de crise si rien ne la teste.

`restore-test.sh` restaure dans un conteneur créé pour l'occasion et détruit ensuite. Il ne
touche jamais une base vivante : un exercice de restauration qui peut casser la production
est un exercice que personne ne lance.

Quatre contrôles métier, chacun cassé par une corruption plausible qui laisserait pourtant
l'archive parfaitement valide aux yeux de PostgreSQL :

1. **Le pool est entier**, comparé au compte enregistré *au moment de la sauvegarde*, pas
   à une constante qui pourrait dériver.
2. **La répartition 60/20/10/6/4 %**, une restauration qui perd des lignes inégalement
   donne une base qui s'ouvre et interroge très bien, et un jeu qui ne correspond plus au
   règlement déposé chez l'huissier.
3. **Aucune participation orpheline**, des lots que personne ne peut réclamer.
4. **L'index unique sur `code` est présent**, une restauration « réussie » sans lui
   laisserait rejouer deux fois le même code, c'est-à-dire la seule garantie sur laquelle
   repose toute l'application.

Le **RTO est mesuré ici et nulle part ailleurs**. Un objectif de temps de reprise écrit
dans un cahier des charges est une intention ; ce script est le seul endroit où le projet
apprend le chiffre réel.

## Exécution manuelle

```bash
# Une sauvegarde, tout de suite
sudo -E /opt/theetiptop/backup/backup.sh daily

# Vérifier la dernière sauvegarde mensuelle
sudo -E /opt/theetiptop/backup/restore-test.sh monthly

# Vérifier une sauvegarde précise
sudo -E /opt/theetiptop/backup/restore-test.sh daily 2026-11-14T03-15-02Z.tar.gz.age
```

Les scripts se comportent exactement de la même façon lancés à la main que par systemd.
C'est délibéré : **une procédure de sauvegarde que personne ne sait exécuter est une
procédure que personne ne sait vérifier.**

## Restaurer pour de vrai

Procédure complète en cas de sinistre, dans l'ordre :

```bash
# 1. Récupérer et déchiffrer
rclone copy s3:dsp5-archi-o25a-backups/daily/<stamp>.tar.gz.age .
age -d -i /etc/theetiptop/backup-key.txt <stamp>.tar.gz.age | tar xzf -

# 2. Gitea d'abord, sans le code source, rien d'autre ne se reconstruit
docker compose -f compose.workflow.yml up -d gitea-db
docker exec -i gitea gitea restore --file /tmp/gitea.tar.gz

# 3. Jenkins
docker run --rm -v jenkins-home:/target -v "$PWD:/src" alpine:3 \
  tar xzf /src/jenkins-home.tar.gz -C /target

# 4. Les bases applicatives, production en dernier
docker exec -i theetiptop-prod-postgres-1 \
  pg_restore -U theetiptop -d theetiptop --clean --if-exists --no-owner < postgres-prod.dump

# 5. Contrôler avant de rouvrir au public
cd 06-app/theetiptop-contest && npm run codes:verify
```

L'étape 5 n'est pas optionnelle. Rouvrir le jeu sur une base dont la répartition a dérivé
reviendrait à distribuer des lots qui ne correspondent plus au règlement déposé.
