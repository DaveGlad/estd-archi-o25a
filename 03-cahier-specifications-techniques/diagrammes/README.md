# Diagrammes du cahier des spécifications techniques

Sept figures, produites à partir d'une source unique. Le sujet en impose deux séries : un diagramme d'infrastructure qui fait apparaître « les ports et différents protocoles de communications », et des diagrammes **BPMN** pour les procédures.

## Ce qu'il y a dans ce dossier

| Fichier | Rôle |
|---|---|
| `specs.py` | **La source.** Les sept diagrammes y sont déclarés : couloirs, objets, flux, étiquettes |
| `generate.py` | Le moteur. Place les objets, route les flux, écrit le `.drawio` et le `.svg` |
| `render-png.ts` | Transforme les SVG en PNG haute définition pour l'insertion dans le dossier |
| `*.drawio` | La source éditable, **c'est ce fichier qu'on importe dans Lucidchart** |
| `*.svg` | Le même rendu, vectoriel |
| `*.png` | Le rendu bitmap à 2×, lisible une fois réduit à la largeur d'une page A4 |

## Les sept figures

| Figure | Fichier | Partie | Couloirs |
|---|---|---|---|
| 1 | `E-infrastructure` | E | Internet, proxy, workflow, metrics, environnements, hors site |
| 2 | `G1-activite` | G.1 | aucun, c'est un diagramme d'activité |
| 3 | `G2-deploiement-dev` | G.2 | Développeur, Gitea, Jenkins, Environnement dev |
| 4 | `G3-deploiement-preprod` | G.3 | Jenkins, Préproduction, Équipe projet |
| 5 | `G4-deploiement-prod` | G.4 | Équipe projet, Jenkins, Production |
| 6 | `G5-sauvegarde` | G.5 | Planificateur, Production, Stockage hors site, Équipe plateforme |
| 7 | `G6-restauration` | G.6 | Qualification, Développement, Préproduction, Production |

## Régénérer

```bash
# 1. Les sources vectorielles
cd 03-cahier-specifications-techniques/diagrammes
python3 generate.py

# 2. Les PNG, via le Chromium que Playwright installe déjà pour les tests du site
cd ../../06-app/theetiptop-contest
NODE_PATH="$PWD/node_modules" npx tsx ../../03-cahier-specifications-techniques/diagrammes/render-png.ts
```

Aucune dépendance supplémentaire. Python de la machine, et le navigateur que le projet embarque déjà.

## Importer dans Lucidchart

Lucidchart lit nativement le format diagrams.net.

1. Dans Lucidchart : **Fichier → Importer un document → diagrams.net (.drawio)**
2. Choisir le `.drawio` voulu
3. Le diagramme arrive éditable : couloirs, formes et flux sont des objets Lucidchart, pas une image

Pour remplacer les formes par celles de la bibliothèque BPMN de Lucidchart, activer la bibliothèque dans le panneau de gauche, puis sélectionner une forme et utiliser **Remplacer la forme**. Ce n'est pas obligatoire : la notation est déjà respectée, voir ci-dessous.

## Pourquoi générer plutôt que dessiner

Les processus sont déjà écrits, couloir par couloir, dans `../sections/G-procedures-bpmn.md`. Les redessiner à la main créerait une deuxième copie, qui divergerait de la première au premier déplacement d'une étape dans le pipeline. Ici la déclaration **est** le diagramme, les deux ne peuvent donc pas se contredire sans que personne ne le voie.

C'est aussi ce qui rend les sept figures homogènes : même palette, même grammaire, même légende, sans avoir à y penser.

## Sur les formes

La grammaire BPMN est respectée.

| Objet | Forme | Sens |
|---|---|---|
| Événement de début | Cercle à trait fin | Ce qui déclenche le processus |
| Tâche | Rectangle arrondi | Une action. Vert pour automatique, ambre pour humaine |
| Passerelle exclusive | Losange marqué d'une croix | Un choix, une seule branche est empruntée |
| Appel de sous-processus | Rectangle à bordure double | Renvoi vers un autre processus de la partie G |
| Événement de fin | Cercle à trait épais | Terminaison normale |
| Fin sur erreur | Cercle à trait épais, rouge | Terminaison sur échec, avec notification |

Les formes sont des primitives, cercle, losange, rectangle, et non les gabarits BPMN de diagrams.net. C'est voulu : un gabarit voyage sous la forme d'un **nom**, et un importateur qui ne connaît pas ce nom dessine un cadre vide. Un rectangle, lui, survit à tous les imports. La légende portée par chaque figure dit la convention, ce qui est exactement ce dont un lecteur a besoin.

## Deux pièges rencontrés, pour mémoire

**Un flux horizontal ne vaut qu'entre deux colonnes voisines.** Sur une portée plus longue il traverse ce qui se trouve entre les deux, et le lecteur voit une flèche qui n'a jamais été déclarée. La première version faisait ainsi croire que l'exportateur système appelait l'exportateur conteneurs, alors que c'est Prometheus qui interroge les deux.

**Les étiquettes se dessinent en dernier.** Dessinées avec leur flux, elles passaient sous les boîtes voisines : l'espace entre deux objets fait 60 pixels, « webhook HTTP » en fait davantage.
