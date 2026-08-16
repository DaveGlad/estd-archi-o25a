# Sprint 01, les deux dossiers, 15 au 31 août 2026

Un seul objectif : déposer le 31 août à 9h le cahier des charges et le cahier des spécifications techniques, conformes au plan imposé.

Une règle à garder en tête tout du long : aucune section ne doit rester vide. Une section courte mais présente et justifiée vaut infiniment mieux qu'une section manquante, parce que la grille d'évaluation fonctionne comme une checklist.

## Répartition des rôles

Le groupe compte 4 personnes. Ces rôles servent aussi de maîtrise d'œuvre dans le comité de pilotage du cahier des charges.

| Rôle | Périmètre | Fichiers |
|---|---|---|
| R1, chef de projet | CDC parties A, I, J : comité de pilotage, matrices, Gantt, devis, TJM. Pilotage du Trello et comptes rendus | `02-.../sections/A,I,J`, `01-pilotage/` |
| R2, communication digitale | CDC parties B, C, D : veille, benchmark, cibles, stratégie digitale, SEO, SMO, emailing, analytics | `02-.../sections/B,C,D`, `07-marketing/`, `09-recherche/` |
| R3, technique | CDC parties E et F, plus la totalité du CST : UML, MCD, workflow, infrastructure, BPMN, coûts | `02-.../sections/E,F`, `03-.../` |
| R4, design et UX | CDC parties G et H : logo, UX mapping, zoning, wireframes, maquettes, charte, mentions légales, CGU | `02-.../sections/G,H`, `04-design/` |

R3 est le seul à porter deux dossiers. En contrepartie, les trois autres prennent en charge la relecture croisée du 29 août.

## J0, samedi 15 août, débloquer l'administratif et cadrer

- [ ] Écrire au formateur au sujet des rendus du 26 mai et du 29 juin, demander s'ils sont encore recevables, et les déposer le jour même
- [ ] Réunion de groupe de 2 heures : rôles, disponibilités réelles jusqu'au 31, canal de communication
- [ ] Créer le Trello ou le Notion en accès public et y importer `BACKLOG.md`
- [ ] Créer le dépôt Git du projet, dossiers compris, et donner accès à tout le monde
- [ ] Installer GanttProject sur au moins un poste
- [ ] Rédiger le premier compte rendu de réunion dans `01-pilotage/comptes-rendus/`

## J1, dimanche 16 août, les décisions structurantes

Rien n'avance tant que ces points ne sont pas tranchés. Tout se consigne dans `DECISIONS.md`.

- [ ] Identité juridique de Furious Ducks : forme, capital, siège, SIREN, SIRET, RCS, APE, TVA, storytelling, valeurs
- [ ] Comité de pilotage : 3 personnes minimum côté client, plus la maîtrise d'œuvre, avec coordonnées, horaires, congés et suppléants
- [ ] Stack du site : front, back, base de données, API, avec les justifications
- [ ] Briques du workflow : distribution Linux, hébergeur, reverse proxy, SCM, CI, registry, tests, métriques, backups
- [ ] Méthodologie : Scrum ou Kanban, cadence, cérémonies
- [ ] TJM : grille de salaires par rôle, charges patronales et salariales, marge de l'agence, taux horaire, avec la feuille de calcul en annexe

## J2, lundi 17 août, la recherche

- [ ] Étude de marché : marché du thé en France, bio, e-commerce, jeux-concours. Sources publiques, datées de moins de 5 ans, liens complets
- [ ] Contraintes légales du jeu-concours : règlement, huissier, obligations d'affichage, RGPD, loterie publicitaire
- [ ] Sélection des 3 concurrents, 2 directs et 1 indirect, et lancement des audits
- [ ] Plan de veille rédigé : types, objectifs, axes, sources, outils dont ceux d'IA, diffusion, fréquence
- [ ] Questionnaire rédigé et diffusé, 2 à 3 interviews planifiées

## J3, mardi 18 août, le benchmark

C'est la journée la plus chargée du cahier des charges. Pour chacun des 3 concurrents, les 5 audits.

- [ ] Audit technique : langages front et back, performances, responsive et application
- [ ] Audit Green IT : minification, images redimensionnées, nombre de requêtes, plugins, print CSS, caractères standards
- [ ] Audit de référencement : SEO détaillé, SEA, partenariats, réseaux sociaux avec captures, méthode AIDA
- [ ] Audit de design et d'ergonomie : logo, couleurs, typographies, critères de Bastien et Scapin ou de Nielsen
- [ ] Audit d'accessibilité : contrastes, navigation, plugins, sémantique et ARIA, formulaires, selon les 4 principes du WAI
- [ ] Conclusions, points positifs et négatifs retenus
- [ ] Mapping concurrentiel avec des axes justifiés

Outils utiles : Wappalyzer, SEOquake, Semrush, WAVE, GreenIT-Analysis, `ara.numerique.gouv.fr`, PageSpeed. Le sujet recommande de vérifier aussi le code source à la main, ce qui reste le meilleur moyen de ne pas se faire piéger par un outil.

## J4, mercredi 19 août, stratégie et design en parallèle

Pour R2 :

- [ ] SWOT du client, cibles, cœur de cible et cible secondaire avec socio-démographie et motivations
- [ ] Grille d'analyse d'état d'esprit par cible : contexte, grille remplie, hypothèses de fonctionnalités
- [ ] Personas visuels, tableau des acteurs, zone de chalandise avec carte et légende

Pour R4 :

- [ ] 3 concepts de logo, 3 déclinaisons chacun, avec 2 ou 3 phrases d'explication, puis choix du logo final
- [ ] Palette en CMJN, RVB et hexadécimal, contrastes AA vérifiés, typographies et licences

## J5, jeudi 20 août, la stratégie digitale

C'est la partie qui pèse le plus lourd dans la notation du cahier des charges.

- [ ] Objectifs online et offline, piliers, objectifs SMART, ROI, démarche RSE
- [ ] Stratégie éditoriale : ton, contenus, par cible
- [ ] E-réputation et gestion de crise : enjeux, risques, social listening, plan d'action, recours possibles
- [ ] SEO : définition, audit de mots-clés, bonnes pratiques avec un exemple concret pour chacune
- [ ] Rédiger le contenu réel de la page d'accueil et de la page de présentation du concept, balises et liens indiqués
- [ ] SMO : plateformes justifiées, calendrier de publication avec exemples, e-RP, influenceurs, publicités payantes
- [ ] Emailing : types de mails, origine de la base, contenus, fréquence, RGPD, prestataire et coût
- [ ] Analyse de performance : KPI par action, outils, contraintes légales sur les cookies et l'opt-in

## J6, vendredi 21 août, le fonctionnel et le technique

- [ ] Tri de cartes, puis arborescence définitive du site
- [ ] 2 représentations textuelles de cas d'utilisation et 1 use case
- [ ] 2 diagrammes d'activité, sur d'autres fonctionnalités
- [ ] 2 diagrammes de séquence, sur les cas textuels
- [ ] MCD et MLD, en modélisant les codes, les lots, les participations, les utilisateurs, les boutiques, les remises et le tirage
- [ ] Technologies et compatibilité navigateurs, avec les versions minimales
- [ ] Logiciels utilisés pour la gestion de projet, le graphisme, la technique et les audits
- [ ] Tests applicatifs : unitaires, intégration, fonctionnels, performance, outils et export des rapports
- [ ] Hébergement et nom de domaine dans la vraie vie, avec prestataire, offre, coût, justification et stratégie de backups

## J7, samedi 22 août, design et légalité

- [ ] UX mapping : empathy map et experience map
- [ ] Zoning de l'accueil, de la connexion et inscription, et du profil, en desktop, tablette et smartphone
- [ ] Wireframes des mêmes pages, dans les mêmes formats
- [ ] Maquettes des mêmes pages, dans les mêmes formats
- [ ] Charte graphique complète : couleurs, typographies avec licences, images autorisées et refusées
- [ ] Mentions légales et CGU, avec la mention de projet étudiant fictif

## J8, dimanche 23 août, point d'étape

- [ ] Relecture croisée, chacun relit la partie d'un autre
- [ ] Liste des trous restants et réaffectation
- [ ] Compte rendu de réunion

## J9, lundi 24 août, CST parties A, B et C

- [ ] État des lieux : présentation de l'agence, informations juridiques, problématique de Mr Brasletti étoffée, limites du cycle en V
- [ ] Méthodologie à venir : Scrum, Kanban ou XP, fonctionnement, avantages, inconvénients, mise en place, outils
- [ ] DevOps et DevSecOps : définitions, usages, avantages, topologies d'équipe retenues et leur évolution

## J10, mardi 25 août, CST partie D

- [ ] Définitions CI et CD, contraintes du workflow, liste des tâches automatisées justifiées et recontextualisées
- [ ] Choix techniques service par service, avec les standards associés comme GitFlow, les conventions de commit et les branches protégées
- [ ] Hébergement et backups : CPU, RAM, disques, bande passante, SLA, GTR, politique de rétention
- [ ] Vérifier une par une les 8 exigences du sujet et montrer où chacune est traitée

## J11, mercredi 26 août, CST parties E et G

- [ ] Diagramme d'infrastructure complet, avec les ports, les protocoles, les réseaux Docker et les flux
- [ ] BPMN : au moins un diagramme d'activité
- [ ] BPMN : déploiement en dev, en préproduction et en production
- [ ] BPMN : sauvegarde de la production
- [ ] BPMN : restauration en dev, en préproduction et en production
- [ ] Procédures rédigées pour les utilisateurs, lisibles par un développeur qui arrive

## J12, jeudi 27 août, le chiffrage des deux dossiers

- [ ] Les 4 matrices obligatoires : MoSCoW, Eisenhower, RACI ou RASCI, matrice des risques
- [ ] Gantt sous GanttProject, tâches par lots, ressources, jalons, prédécesseurs, pourcentages d'avancement, du brief à la livraison, pour le projet client et pour le workflow
- [ ] Diagramme des ressources, exigé en plus de la timeline
- [ ] Devis principal issu du Gantt, plus les devis optionnels pour la communication, la maintenance et la formation
- [ ] CST partie I : coût de mise en place, coût de maintenance, comparaison chiffrée avec et sans workflow
- [ ] CST partie F : fiche de poste, type de contrat, grille de salaire, plan de formation

## J13, vendredi 28 août, la mise en forme

- [ ] Pages de couverture : mention, nom, date de début, numéro de version, rédacteurs, mentions juridiques en pied de page
- [ ] Sommaires complets avec numéros de page, dans l'ordre exact du plan imposé
- [ ] Pagination 1/100 sur les deux dossiers, en A4 portrait
- [ ] Annexes : questionnaire, retranscriptions d'interviews, calcul du TJM, dans les deux dossiers
- [ ] Sources avec liens complets en bas de page ou en annexe, graphiques lisibles

## J14, samedi 29 août, la relecture croisée

- [ ] Relire section par section contre les checklists `PLAN.md` des deux dossiers, et cocher chaque ligne
- [ ] Traquer les copier-coller, tout doit être reformulé et interprété
- [ ] Vérifier que chaque préconisation est à la fois justifiée et quantifiée
- [ ] Orthographe, et cohérence des chiffres entre le Gantt, les devis et le TJM

## J15, dimanche 30 août, gel et export

- [ ] Plus aucune modification de fond
- [ ] Export PDF et vérification du rendu : polices, images, sauts de page
- [ ] Nommage des fichiers selon la convention imposée
- [ ] Préparer le document d'accès à l'outil d'organisation, avec le lien public
- [ ] En option, le diagramme de Gantt et l'archive de prototypage et maquettage
- [ ] Dépôt de test sur Teams

## J16, lundi 31 août, avant 9h

- [ ] Déposer sur le devoir Teams, sans attendre 8h55
- [ ] Faire une capture d'écran de la confirmation de dépôt
- [ ] Rétrospective de sprint, puis lancement de la phase 2

## Si le retard s'accumule

Voici l'ordre dans lequel sacrifier de la profondeur. Jamais l'existence d'une section, seulement son niveau de détail.

1. Réduire le nombre d'exemples de publications sociales et de mails
2. Ne faire des maquettes haute-fidélité que sur l'accueil, et soigner les wireframes sur le reste
3. Retenir 4 ou 5 chiffres clés bien interprétés plutôt que 15 survolés
4. Faire 2 interviews au lieu de 5, mais correctement retranscrites

À ne jamais couper : le Gantt, les devis, le TJM, les matrices, les diagrammes UML et BPMN, le diagramme d'infrastructure, les mentions légales et les CGU, et les 5 audits des 3 concurrents.
