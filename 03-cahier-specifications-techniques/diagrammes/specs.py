"""
The seven diagrams, declared once.

Each node is `Node(key, kind, label, lane, col, row)`. `kind` drives the shape and
therefore the BPMN meaning:

    start    thin circle, start event
    end      thick circle, end event
    error    thick circle, red, end on failure
    task     rounded rectangle
    auto     rounded rectangle, green, task performed by the workflow with no human
    human    rounded rectangle, amber, task performed by a person
    gateway  diamond with a cross, exclusive gateway
    call     rounded rectangle, double border, call to another process of this part

`lane` is the pool the node sits in, `col` its position from left to right, `row` the
line inside the lane when a lane needs more than one.

The content is a transcription of `../sections/G-procedures-bpmn.md` and
`../sections/E-diagramme-infrastructure.md`. Change the text there and here together,
or the dossier will say one thing and the figure another.
"""

from generate import Diagram, Node as N

# ---------------------------------------------------------------- E. infrastructure
#
# Not a process but a map, so no pool: the lanes here are network segments, which is
# what the brief asks to see ("l'intégralité des services de votre workflow ainsi que
# les ports et différents protocoles de communications").

E_INFRA = Diagram(
    'E-infrastructure',
    "Figure 1 — Infrastructure du workflow : services, ports et protocoles",
    ['Internet', 'Réseau proxy', 'Réseau workflow', 'Réseau metrics',
     'Réseaux d\'environnement', 'Hors site'],
    [
        # Placed above the service each one reaches, so both entry flows are plain
        # vertical drops. Side by side they produced two detours whose labels landed on
        # top of each other.
        N('net', 'start', 'Internet', 'Internet', 1),
        N('dev_poste', 'human', 'Poste développeur\ngit push', 'Internet', 3),

        N('traefik', 'task', 'TRAEFIK\nreverse proxy, terminaison TLS\n80 → 443',
          'Réseau proxy', 1),
        N('ssh', 'task', 'SSH hôte\n22/tcp, par clé,\nfiltrage d\'adresses', 'Réseau proxy', 3),

        N('gitea', 'auto', 'GITEA\n:3000 HTTP web\n:2222 SSH Git', 'Réseau workflow', 0),
        N('jenkins', 'auto', 'JENKINS\n:8080 HTTP\n:50000 TCP agents', 'Réseau workflow', 1),
        N('agents', 'auto', 'AGENTS JENKINS\néphémères, socket\nDocker en UNIX', 'Réseau workflow', 2),
        N('registry', 'auto', 'REGISTRY\n:5000 HTTP\nimages signées', 'Réseau workflow', 3),

        N('prom', 'auto', 'PROMETHEUS\n:9090 HTTP\nscrape toutes les 15 s', 'Réseau metrics', 1),
        N('grafana', 'auto', 'GRAFANA\n:3000 HTTP\nrequêtes PromQL', 'Réseau metrics', 0),
        # Columns 3 and 4, not 2 and 3: column 2 is the lane the deployment flow crosses
        # on its way from the agents down to production, and a box there sits under it.
        N('nodeexp', 'auto', 'Exportateur système\n:9100 HTTP', 'Réseau metrics', 3),
        N('cadv', 'auto', 'Exportateur conteneurs\n:8080 HTTP', 'Réseau metrics', 4),

        N('envdev', 'task', 'DEV\napi web admin :3000\npg :5432 · redis :6379',
          "Réseaux d'environnement", 0),
        N('envpre', 'task', 'PRÉPRODUCTION\napi web admin :3000\npg :5432 · redis :6379',
          "Réseaux d'environnement", 1),
        N('envprod', 'task', 'PRODUCTION\napi web admin :3000\npg :5432 · redis :6379',
          "Réseaux d'environnement", 2),
        N('backup', 'auto', 'SAUVEGARDE\nplanifiée, chiffrée',
          "Réseaux d'environnement", 3),

        N('offsite', 'end', 'Stockage externalisé', 'Hors site', 3),
    ],
    [
        ('net', 'traefik', '443/tcp HTTPS'),
        ('dev_poste', 'ssh', '22/tcp SSH'),
        ('traefik', 'gitea', 'HTTP'),
        ('traefik', 'jenkins', 'HTTP'),
        ('traefik', 'registry', 'HTTPS'),
        ('traefik', 'grafana', 'HTTP'),
        ('gitea', 'jenkins', 'webhook HTTP'),
        ('jenkins', 'agents', 'JNLP 50000/tcp'),
        ('agents', 'registry', 'push HTTPS'),
        ('prom', 'nodeexp', 'scrape HTTP'),
        ('prom', 'cadv', 'scrape HTTP'),
        ('grafana', 'prom', 'PromQL HTTP'),
        ('agents', 'envdev', 'déploiement'),
        ('agents', 'envpre', 'déploiement'),
        ('agents', 'envprod', 'déploiement'),
        ('envprod', 'backup', 'dump'),
        ('backup', 'offsite', 'SFTP chiffré'),
    ],
    note=("Seuls 80, 443 et 22 sont ouverts vers internet. Tout le reste ne circule qu'à "
          "l'intérieur des réseaux Docker, qui sont étanches entre eux."),
)

# ---------------------------------------------------------------- G.1 activity

G1 = Diagram(
    'G1-activite',
    "Figure 2 — Cycle de vie d'une fonctionnalité, du besoin à la production",
    [],
    [
        N('A', 'start', 'Story sélectionnée\nen sprint planning', '', 0, 0),
        N('B', 'human', 'Créer la branche feature', '', 0, 1),
        N('C', 'human', 'Développer et committer', '', 0, 2),
        N('D', 'human', 'Ouvrir une merge request\nvers develop', '', 0, 3),
        N('E', 'gateway', 'Revue de code\napprouvée ?', '', 0, 4),
        N('F', 'auto', 'Merge sur develop', '', 0, 5),
        N('G', 'call', 'Processus G.2\nDéploiement dev', '', 0, 6),
        N('H', 'gateway', 'Build vert et\ntests E2E OK ?', '', 0, 7),
        N('I', 'task', 'Story conforme à la\nDefinition of Done', '', 0, 8),
        N('J', 'gateway', 'Fin de sprint ?', '', 0, 9),
        N('K', 'human', 'Créer la branche release', '', 0, 10),
        N('L', 'call', 'Processus G.3\nDéploiement préproduction', '', 0, 11),
        N('M', 'human', 'Sprint review avec le client', '', 0, 12),
        N('Nx', 'gateway', 'Recette validée ?', '', 0, 13),
        N('O', 'human', 'Correctifs sur\nla branche release', '', 1, 13),
        N('P', 'call', 'Processus G.4\nDéploiement production', '', 0, 14),
        N('Q', 'end', 'Fonctionnalité\nen production', '', 0, 15),
    ],
    [
        ('A', 'B', ''), ('B', 'C', ''), ('C', 'D', ''), ('D', 'E', ''),
        ('E', 'C', 'Non'), ('E', 'F', 'Oui'), ('F', 'G', ''), ('G', 'H', ''),
        ('H', 'C', 'Non'), ('H', 'I', 'Oui'), ('I', 'J', ''),
        ('J', 'A', 'Non'), ('J', 'K', 'Oui'), ('K', 'L', ''), ('L', 'M', ''),
        ('M', 'Nx', ''), ('Nx', 'O', 'Non'), ('O', 'L', ''),
        ('Nx', 'P', 'Oui'), ('P', 'Q', ''),
    ],
    note=("La passerelle « Build vert et tests E2E OK ? » est ce qui rend la Definition of "
          "Done vérifiable au lieu de déclarative : code écrit ne vaut pas story terminée."),
)

# ---------------------------------------------------------------- G.2 deploy dev

G2 = Diagram(
    'G2-deploiement-dev',
    "Figure 3 — Déploiement en développement, entièrement automatique",
    ['Développeur', 'Gitea', 'Jenkins', 'Environnement dev'],
    [
        N('A', 'start', 'Merge request\napprouvée', 'Développeur', 0),
        N('B', 'human', 'Merge sur develop', 'Développeur', 1),

        N('C', 'auto', 'Enregistrer le commit', 'Gitea', 2),
        N('D', 'auto', 'Émettre le webhook', 'Gitea', 3),

        N('E', 'auto', 'Démarrer un agent\nconteneurisé', 'Jenkins', 0, 0),
        N('F', 'auto', 'Checkout du code\net du Jenkinsfile', 'Jenkins', 1, 0),
        N('G', 'auto', 'Installer les dépendances\ncache monté en volume', 'Jenkins', 2, 0),
        N('H', 'auto', 'Analyse statique\ndétection de secrets', 'Jenkins', 3, 0),
        N('I', 'gateway', 'Analyse\nconforme ?', 'Jenkins', 4, 0),
        N('J', 'auto', 'Tests unitaires', 'Jenkins', 0, 1),
        N('K', 'gateway', 'Tests OK ?', 'Jenkins', 1, 1),
        N('L', 'auto', "Tests d'intégration", 'Jenkins', 2, 1),
        N('M', 'gateway', 'Tests OK ?', 'Jenkins', 3, 1),
        N('Nn', 'auto', 'Build applicatif\nminification des assets', 'Jenkins', 4, 1),
        N('O', 'auto', "Construire l'image\ntag = hash du commit", 'Jenkins', 0, 2),
        N('P', 'auto', "Scanner l'image", 'Jenkins', 1, 2),
        N('Q', 'gateway', 'Vulnérabilité\ncritique ?', 'Jenkins', 2, 2),
        N('R', 'auto', "Publier l'image\nau registry", 'Jenkins', 3, 2),
        N('Z1', 'error', 'Build rouge\nnotification équipe', 'Jenkins', 4, 2),

        N('S', 'auto', "Récupérer l'image\ndepuis le registry", 'Environnement dev', 0, 0),
        N('T', 'auto', 'Appliquer les migrations', 'Environnement dev', 1, 0),
        N('U', 'auto', 'Redémarrer les conteneurs', 'Environnement dev', 2, 0),
        N('V', 'auto', 'Sonde de santé', 'Environnement dev', 3, 0),
        N('W', 'gateway', 'Service\ndisponible ?', 'Environnement dev', 4, 0),
        N('X', 'auto', 'Tests fonctionnels E2E', 'Environnement dev', 0, 1),
        N('Y', 'gateway', 'E2E OK ?', 'Environnement dev', 1, 1),
        N('AA', 'auto', 'Publier et archiver\nles rapports', 'Environnement dev', 2, 1),
        N('AB', 'end', 'Déploiement dev réussi\nnotification', 'Environnement dev', 3, 1),
        N('Z2', 'error', "Retour à l'image\nprécédente, notification", 'Environnement dev', 4, 1),
    ],
    [
        ('A', 'B', ''), ('B', 'C', ''), ('C', 'D', ''), ('D', 'E', ''),
        ('E', 'F', ''), ('F', 'G', ''), ('G', 'H', ''), ('H', 'I', ''),
        ('I', 'Z1', 'Non'), ('I', 'J', 'Oui'),
        ('J', 'K', ''), ('K', 'Z1', 'Non'), ('K', 'L', 'Oui'),
        ('L', 'M', ''), ('M', 'Z1', 'Non'), ('M', 'Nn', 'Oui'),
        ('Nn', 'O', ''), ('O', 'P', ''), ('P', 'Q', ''),
        ('Q', 'Z1', 'Oui'), ('Q', 'R', 'Non'),
        ('R', 'S', ''), ('S', 'T', ''), ('T', 'U', ''), ('U', 'V', ''), ('V', 'W', ''),
        ('W', 'Z2', 'Non'), ('W', 'X', 'Oui'),
        ('X', 'Y', ''), ('Y', 'Z1', 'Non'), ('Y', 'AA', 'Oui'), ('AA', 'AB', ''),
    ],
    note=("Le tag de l'image reprend le hash du commit, donc on sait à tout instant quelle "
          "version exacte tourne. Le retour arrière sur échec de la sonde est automatique."),
)

# ---------------------------------------------------------------- G.3 deploy preprod

G3 = Diagram(
    'G3-deploiement-preprod',
    "Figure 4 — Déploiement en préproduction, automatique, avec anonymisation",
    ['Jenkins', 'Préproduction', 'Équipe projet'],
    [
        N('A', 'start', 'Création de la\nbranche release', 'Jenkins', 0, 0),
        N('B', 'call', "Pipeline identique à G.2\njusqu'à la publication", 'Jenkins', 1, 0),
        N('C', 'gateway', 'Pipeline vert ?', 'Jenkins', 2, 0),
        N('Z', 'error', 'Build rouge\nnotification équipe', 'Jenkins', 3, 0),

        N('D', 'auto', 'Copier la base de\nproduction de la veille', 'Préproduction', 0, 0),
        N('E', 'auto', 'Anonymiser les\ndonnées personnelles', 'Préproduction', 1, 0),
        N('F', 'auto', 'Appliquer les migrations', 'Préproduction', 2, 0),
        N('G', 'auto', 'Déployer les conteneurs', 'Préproduction', 3, 0),
        N('H', 'auto', 'Sonde de santé', 'Préproduction', 4, 0),
        N('I', 'gateway', 'Service\ndisponible ?', 'Préproduction', 0, 1),
        N('Y', 'error', 'Retour arrière\nnotification', 'Préproduction', 1, 1),
        N('J', 'auto', 'Tests fonctionnels E2E', 'Préproduction', 2, 1),
        N('K', 'auto', 'Tests de performance\ncharge sur 500 000 codes', 'Préproduction', 3, 1),
        N('L', 'gateway', 'Seuils\nrespectés ?', 'Préproduction', 4, 1),

        N('M', 'auto', 'Publier les rapports', 'Équipe projet', 2),
        N('Nn', 'human', 'Notifier le chef de projet', 'Équipe projet', 3),
        N('O', 'end', 'Préproduction prête\npour la sprint review', 'Équipe projet', 4),
    ],
    [
        ('A', 'B', ''), ('B', 'C', ''), ('C', 'Z', 'Non'), ('C', 'D', 'Oui'),
        ('D', 'E', ''), ('E', 'F', ''), ('F', 'G', ''), ('G', 'H', ''), ('H', 'I', ''),
        ('I', 'Y', 'Non'), ('I', 'J', 'Oui'), ('J', 'K', ''), ('K', 'L', ''),
        ('L', 'Z', 'Non'), ('L', 'M', 'Oui'), ('M', 'Nn', ''), ('Nn', 'O', ''),
    ],
    note=("L'anonymisation n'est pas une précaution de confort : la préproduction est "
          "accessible au client, elle ne doit jamais contenir de données réelles. RGPD."),
)

# ---------------------------------------------------------------- G.4 deploy prod

G4 = Diagram(
    'G4-deploiement-prod',
    "Figure 5 — Déploiement en production, le seul processus avec une décision humaine",
    ['Équipe projet', 'Jenkins', 'Production'],
    [
        N('A', 'start', 'Recette client validée', 'Équipe projet', 0, 0),
        N('B', 'human', 'Merge de release\nvers main', 'Équipe projet', 1, 0),
        N('C', 'human', 'Poser un tag de version', 'Équipe projet', 2, 0),
        N('F', 'gateway', 'Validation chef de projet\net Product Owner', 'Équipe projet', 4, 0),
        N('G', 'error', 'Déploiement annulé\nmotif consigné', 'Équipe projet', 0, 1),

        N('D', 'auto', "Préparer l'artefact\nde production", 'Jenkins', 3, 0),
        N('Ee', 'auto', 'Notification :\ndéploiement en attente', 'Jenkins', 3, 1),
        N('H', 'gateway', 'Créneau de\ndéploiement ouvert ?', 'Jenkins', 4, 1),
        N('I', 'auto', "Mise en file d'attente", 'Jenkins', 0, 2),

        N('J', 'auto', 'Sauvegarde immédiate\nbase et volumes', 'Production', 0, 0),
        N('K', 'gateway', 'Sauvegarde\nvérifiée ?', 'Production', 1, 0),
        N('L', 'error', 'Déploiement bloqué\nalerte plateforme', 'Production', 2, 0),
        N('M', 'auto', 'Activer la page\nde maintenance', 'Production', 3, 0),
        N('Nn', 'auto', 'Appliquer les migrations', 'Production', 4, 0),
        N('O', 'gateway', 'Migrations OK ?', 'Production', 0, 1),
        N('Q', 'auto', "Déployer la\nnouvelle image", 'Production', 1, 1),
        N('R', 'auto', 'Sonde de santé', 'Production', 2, 1),
        N('S', 'gateway', 'Service\ndisponible ?', 'Production', 3, 1),
        N('T', 'auto', 'Tests de fumée\nparcours critiques', 'Production', 4, 1),
        N('U', 'gateway', 'Parcours OK ?', 'Production', 0, 2),
        N('V', 'auto', 'Désactiver la maintenance', 'Production', 1, 2),
        N('W', 'auto', 'Surveillance renforcée\n30 minutes', 'Production', 2, 2),
        N('X', 'gateway', 'Alerte\ndéclenchée ?', 'Production', 3, 2),
        N('P', 'call', 'Processus G.6\nRestauration production', 'Production', 4, 2),
        N('Yy', 'end', 'Mise en production réussie\nconsignation au journal', 'Production', 4, 3),
    ],
    [
        ('A', 'B', ''), ('B', 'C', ''), ('C', 'D', ''), ('D', 'Ee', ''), ('Ee', 'F', ''),
        ('F', 'G', 'Refusée'), ('F', 'H', 'Accordée'),
        ('H', 'I', 'Non'), ('I', 'H', ''), ('H', 'J', 'Oui'),
        ('J', 'K', ''), ('K', 'L', 'Non'), ('K', 'M', 'Oui'),
        ('M', 'Nn', ''), ('Nn', 'O', ''), ('O', 'P', 'Non'), ('O', 'Q', 'Oui'),
        ('Q', 'R', ''), ('R', 'S', ''), ('S', 'P', 'Non'), ('S', 'T', 'Oui'),
        ('T', 'U', ''), ('U', 'P', 'Non'), ('U', 'V', 'Oui'),
        ('V', 'W', ''), ('W', 'X', ''), ('X', 'P', 'Oui'), ('X', 'Yy', 'Non'),
    ],
    note=("Quatre garde-fous : sauvegarde vérifiée avant toute modification, migrations jouées "
          "avant le basculement, tests de fumée, surveillance renforcée pendant 30 minutes."),
)

# ---------------------------------------------------------------- G.5 backup

G5 = Diagram(
    'G5-sauvegarde',
    "Figure 6 — Sauvegarde de la production, planifiée et sans intervention humaine",
    ['Planificateur', 'Production', 'Stockage hors site', 'Équipe plateforme'],
    [
        N('A', 'start', 'Planificateur,\n2 h du matin', 'Planificateur', 0),

        N('B', 'auto', 'Dump de la base', 'Production', 1, 0),
        N('C', 'auto', 'Archiver le journal\nde transactions', 'Production', 2, 0),
        N('D', 'auto', 'Archiver les volumes\napplicatifs', 'Production', 3, 0),
        N('Ee', 'auto', 'Archiver la configuration\nGitea, Jenkins, registry', 'Production', 4, 0),
        N('F', 'auto', 'Calculer les empreintes', 'Production', 0, 1),
        N('G', 'auto', "Chiffrer l'archive", 'Production', 1, 1),

        N('H', 'auto', 'Transférer hors site', 'Stockage hors site', 2, 0),
        N('I', 'gateway', 'Transfert\nréussi ?', 'Stockage hors site', 3, 0),
        N('J', 'auto', 'Nouvelle tentative,\n3 fois', 'Stockage hors site', 4, 0),
        N('K', 'gateway', 'Toujours\nen échec ?', 'Stockage hors site', 0, 1),
        N('M', 'auto', "Vérifier l'empreinte\nà distance", 'Stockage hors site', 1, 1),
        N('Nn', 'gateway', 'Archive\nintègre ?', 'Stockage hors site', 2, 1),
        N('O', 'auto', 'Purger les archives\nhors rétention', 'Stockage hors site', 3, 1),
        N('P', 'auto', 'Publier les métriques\nde sauvegarde', 'Stockage hors site', 4, 1),

        N('L', 'error', 'Alerte critique\néquipe plateforme', 'Équipe plateforme', 0),
        N('Q', 'end', 'Sauvegarde terminée', 'Équipe plateforme', 4),
    ],
    [
        ('A', 'B', ''), ('B', 'C', ''), ('C', 'D', ''), ('D', 'Ee', ''), ('Ee', 'F', ''),
        ('F', 'G', ''), ('G', 'H', ''), ('H', 'I', ''),
        ('I', 'J', 'Non'), ('J', 'K', ''), ('K', 'L', 'Oui'), ('K', 'M', 'Non'),
        ('I', 'M', 'Oui'), ('M', 'Nn', ''), ('Nn', 'L', 'Non'), ('Nn', 'O', 'Oui'),
        ('O', 'P', ''), ('P', 'Q', ''),
    ],
    note=("Le journal de transactions est archivé toutes les 15 minutes, et c'est lui qui tient "
          "le RPO de 15 minutes : le dump quotidien seul plafonnerait la perte à 24 heures."),
)

# ---------------------------------------------------------------- G.6 restore

G6 = Diagram(
    'G6-restauration',
    "Figure 7 — Restauration, les trois environnements",
    ['Qualification', 'Développement', 'Préproduction', 'Production'],
    [
        N('A', 'start', 'Perte de données\nou incident', 'Qualification', 0),
        N('B', 'human', "Qualifier l'incident\npérimètre et dernier état sain",
          'Qualification', 1),
        N('C', 'gateway', 'Quel\nenvironnement ?', 'Qualification', 2),

        N('D1', 'auto', 'Arrêter les conteneurs', 'Développement', 0),
        N('D2', 'auto', 'Restaurer la dernière\nsauvegarde hebdomadaire', 'Développement', 1),
        N('D3', 'auto', 'Redémarrer et vérifier', 'Développement', 2),
        N('D4', 'end', 'Restauré, aucune\nvalidation requise', 'Développement', 3),

        N('E1', 'human', "Prévenir l'équipe projet", 'Préproduction', 0),
        N('E2', 'auto', 'Arrêter les conteneurs', 'Préproduction', 1),
        N('E3', 'auto', 'Restaurer depuis la\nproduction de la veille', 'Préproduction', 2),
        N('E4', 'auto', 'Anonymiser les\ndonnées personnelles', 'Préproduction', 3),
        N('E5', 'auto', 'Redémarrer, tests E2E', 'Préproduction', 4),
        N('E6', 'end', 'Restauré,\néquipe notifiée', 'Préproduction', 5),

        N('F1', 'human', "Déclarer l'incident\nchef de projet et client", 'Production', 0, 0),
        N('F2', 'auto', 'Activer la page\nde maintenance', 'Production', 1, 0),
        N('F3', 'human', 'Choisir le point de restauration\ndump + rejeu du journal',
          'Production', 2, 0),
        N('F4', 'auto', 'Restaurer sur une\ninstance temporaire', 'Production', 3, 0),
        N('F5', 'gateway', "Contrôles\nd'intégrité OK ?", 'Production', 4, 0),
        N('F6', 'auto', "Reculer d'un point\nde restauration", 'Production', 0, 1),
        N('F7', 'auto', "Basculer sur\nl'instance restaurée", 'Production', 1, 1),
        N('F8', 'auto', 'Tests de fumée', 'Production', 2, 1),
        N('F9', 'gateway', 'Parcours OK ?', 'Production', 3, 1),
        N('F10', 'auto', 'Désactiver la maintenance', 'Production', 4, 1),
        N('F11', 'human', 'Informer le client\ndes données perdues', 'Production', 0, 2),
        N('F12', 'human', 'Post-mortem sous 48 h', 'Production', 1, 2),
        N('F13', 'end', 'Service rétabli', 'Production', 2, 2),
    ],
    [
        ('A', 'B', ''), ('B', 'C', ''),
        ('C', 'D1', 'Développement'), ('D1', 'D2', ''), ('D2', 'D3', ''), ('D3', 'D4', ''),
        ('C', 'E1', 'Préproduction'), ('E1', 'E2', ''), ('E2', 'E3', ''), ('E3', 'E4', ''),
        ('E4', 'E5', ''), ('E5', 'E6', ''),
        ('C', 'F1', 'Production'), ('F1', 'F2', ''), ('F2', 'F3', ''), ('F3', 'F4', ''),
        ('F4', 'F5', ''), ('F5', 'F6', 'Non'), ('F6', 'F4', ''), ('F5', 'F7', 'Oui'),
        ('F7', 'F8', ''), ('F8', 'F9', ''), ('F9', 'F6', 'Non'), ('F9', 'F10', 'Oui'),
        ('F10', 'F11', ''), ('F11', 'F12', ''), ('F12', 'F13', ''),
    ],
    note=("Trois différences : en dev on écrase sans précaution, en préproduction on repasse par "
          "l'anonymisation, en production on restaure sur une instance temporaire avant de basculer."),
)

DIAGRAMS = [E_INFRA, G1, G2, G3, G4, G5, G6]
