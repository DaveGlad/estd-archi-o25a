# Modèle de données

Les schémas Prisma ont été **déplacés dans le monorepo**, à leur place définitive :

```
06-app/theetiptop-contest/prisma/schema/
```

Un fichier par domaine, conformément à la convention `deal-israel` :
`base` · `user` · `auth` · `contest` · `prize` · `ticket-code` · `participation` · `store` · `draw`.

## Pourquoi le déplacement

Le chemin de sortie du client généré (`generator client { output = … }`) est relatif au
dossier du schéma. Tant que les schémas vivaient hors du monorepo, ce chemin pointait à
côté de `apps/api`. Les migrations Prisma, elles, doivent de toute façon être versionnées
au même endroit que le code qui les joue, puisque c'est le pipeline Jenkins qui les
applique avant chaque déploiement.

## Correspondance avec le cahier des charges

Le MCD en français et le tableau de correspondance des identifiants figurent dans
`02-cahier-des-charges/sections/E5-mcd-mld.md`. Le MLD est dérivé de ces schémas.

## Migrations

```
06-app/theetiptop-contest/prisma/migrations/
```

Versionnées, rejouables, appliquées par la CI sur dev, preprod-QA puis prod.
