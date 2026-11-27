# Planification des sauvegardes

Quatre unités systemd, à copier dans `/etc/systemd/system/` sur l'hôte du workflow.

**systemd plutôt que `cron`** : une tâche `cron` qui échoue envoie un courriel que personne
ne lit, et ne laisse aucune trace exploitable. Un service systemd écrit dans le journal,
expose son code de sortie à `systemctl status`, et surtout, c'est l'argument décisif,
`OnFailure=` permet de déclencher une alerte à l'échec. Une sauvegarde qui échoue en
silence est strictement équivalente à une absence de sauvegarde, et c'est le dysfonctionnement
n° 2 de l'état des lieux.

## Installation

```bash
sudo cp *.service *.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now theetiptop-backup-daily.timer
sudo systemctl enable --now theetiptop-backup-monthly.timer
sudo systemctl enable --now theetiptop-restore-test.timer

# Vérifier les prochains déclenchements
systemctl list-timers 'theetiptop-*'
```

## Les quatre unités

| Unité | Déclenchement | Ce qu'elle fait |
|---|---|---|
| `theetiptop-backup-daily` | 03:15 UTC, tous les jours | `backup.sh daily`, conservation 30 jours |
| `theetiptop-backup-monthly` | 04:15 UTC, le 1er du mois | `backup.sh monthly`, conservation 12 mois |
| `theetiptop-restore-test` | 05:00 UTC, le 2 du mois | `restore-test.sh`, **restauration réelle** et contrôles métier |
| `theetiptop-backup-failed@` | sur échec de l'une des trois | Notifie l'astreinte |

Le test de restauration tourne **le lendemain** de la sauvegarde mensuelle, pas le même
jour : il doit vérifier une sauvegarde déjà partie hors site et refroidie, pas celle qui
vient d'être écrite sur le disque local.

## Pendant les trente jours du jeu

Le test passe en hebdomadaire, comme écrit au CDC partie F :

```bash
sudo systemctl edit theetiptop-restore-test.timer
# [Timer]
# OnCalendar=
# OnCalendar=Mon *-*-* 05:00:00
```

C'est la période où une perte de données serait la plus coûteuse : elle porterait sur des
participations que les joueurs **ne peuvent pas rejouer**, leur code étant déjà consommé.

## Les variables d'environnement

Les deux scripts lisent `/etc/theetiptop/backup.env`, qui n'est **pas** dans ce dépôt :

```ini
BACKUP_REMOTE=s3:dsp5-archi-o25a-backups
BACKUP_AGE_RECIPIENT=age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p
BACKUP_AGE_KEY=/etc/theetiptop/backup-key.txt
```

Le fichier est en `0600`, propriété de `root`. La **clé privée de déchiffrement** doit
exister ailleurs aussi, dans le gestionnaire de secrets de l'agence, parce qu'une clé
qui n'existe que sur la machine détruite rend la sauvegarde parfaitement inutile. C'est
l'erreur classique du chiffrement de sauvegardes, et elle ne se découvre qu'au moment du
sinistre.
