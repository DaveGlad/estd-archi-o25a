# Provisionnement du serveur

**Responsable** : R3.
**Échéance** : 6 septembre.

## À quoi sert ce dossier

Automatiser la préparation du serveur, pour que l'infrastructure soit reproductible et non montée à la main en SSH.

C'est ce qui permet de répondre honnêtement à la question « et si le serveur brûle ? » : on rejoue le playbook, on restaure les sauvegardes, le workflow repart.

## Ce qui doit vivre ici

| Élément | Contenu |
|---|---|
| Inventaire | Les serveurs cibles, sans mot de passe en clair |
| Rôle socle | Mises à jour, utilisateurs, clés SSH, pare-feu, durcissement |
| Rôle Docker | Installation du moteur, des réseaux et des volumes |
| Rôle sauvegarde | Planification, chiffrement, envoi hors site |
| Variables chiffrées | Aucun secret en clair dans le dépôt |

## Si le temps manque

Ce dossier n'est pas exigé par le sujet, il est un plus. Si le planning se tend, un script shell documenté et versionné remplit la même fonction de traçabilité, à condition qu'il soit réellement rejouable.

Ce qui n'est en revanche pas négociable, c'est que la configuration du serveur ne soit pas seulement dans la tête de celui qui l'a montée.
