# Intégration continue

**Responsable** : R3, avec R4 sur le pipeline du site vitrine.
**Échéance** : 20 septembre pour le premier pipeline, 18 octobre pour les trois.

## Ce qui doit vivre ici

| Fichier | Rôle |
|---|---|
| `Jenkinsfile` de référence, commenté | Modèle à copier dans chaque dépôt projet |
| Configuration des agents conteneurisés | Images de build, volumes, cache |
| Scripts de déploiement | Appelés par les étapes du pipeline |
| Configuration des rapports | Publication et archivage au format JUnit |

## La contrainte la plus structurante

Point 5 de l'expression de besoin : « La configuration du workflow devra être modifiable par les développeurs sans qu'ils aient accès au CI en passant par exemple via les jenkinsfiles. »

Cela veut dire que le `Jenkinsfile` vit dans le dépôt du projet, pas dans Jenkins. Un développeur modifie son pipeline par une merge request, relue comme n'importe quel autre code.

## Les trois pipelines à produire

Le point 7 impose que le workflow s'adapte à tous les projets de l'agence :

1. Site vitrine HTML et CSS, avec minification et compression
2. Site administrable, avec tests, migrations et déploiement
3. Application mobile hybride, avec build et signature

Trois dépôts de démonstration accompagnent donc le projet client. C'est ce qui prouve la généricité au lieu de l'affirmer.

## Ce que la CI doit prendre en charge

Le point 4 liste sept responsabilités : optimisation des assets, déploiement automatique en dev, stockage des images construites, déploiement automatique en préproduction, déploiement en production, exécution des tests, envoi et stockage des rapports. Toutes doivent être visibles dans les pipelines.
