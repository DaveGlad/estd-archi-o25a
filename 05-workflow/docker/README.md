# Conteneurisation

**Responsable** : R3.
**Échéance** : 6 septembre pour le socle, 4 octobre pour les trois environnements.

## Ce qui doit vivre ici

| Fichier | Rôle |
|---|---|
| `compose.workflow.yml` | Reverse proxy, SCM, Jenkins, agents, registry, métriques |
| `compose.dev.yml` | Environnement de développement du projet client |
| `compose.preprod.yml` | Environnement de préproduction et de recette |
| `compose.prod.yml` | Environnement de production |
| `Dockerfile` par application | API, site public, back-office |
| `.dockerignore` | À la racine du monorepo. Absent de deal-israel, ce qui embarque `node_modules` dans le contexte de build |
| `prometheus.yml`, configurations Traefik | Configuration des services |

## Contraintes du sujet à respecter

Le point 2 de l'expression de besoin est sans ambiguïté : « Être entièrement basé sur Docker que ce soit les serveurs utiles au workflow ou les serveurs que le workflow devra gérer tels que les serveurs de tests, de préproduction/QA et de productions. »

Le point 6 impose que les applications soient open source, ou libres au pire.

## Rappels d'architecture

Les décisions sont prises et justifiées dans `../../03-cahier-specifications-techniques/sections/D-workflow-cicd.md` et le schéma des flux dans `E-diagramme-infrastructure.md`. Ne pas improviser ici ce qui est déjà arbitré là-bas.

Trois réseaux d'environnement étanches entre eux, seuls les ports 80, 443 et 22 ouverts vers l'extérieur, aucune base de données exposée.
