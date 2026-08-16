# D.5 Emailing

## Ce que ce pilier apporte

C'est le seul canal que la marque possède réellement. Un abonné Instagram appartient à Instagram, et un changement d'algorithme peut faire disparaître une audience construite en deux ans. Une adresse de courriel obtenue avec consentement appartient à Thé Tip Top.

C'est aussi le canal qui donne son vrai sens à l'opération. Le jeu distribue des lots, ce qui est un coût. Il constitue en échange une base de contacts qualifiés, ce qui est un actif. Cet actif servira au lancement du site de vente en ligne.

| Objectif | Indicateur |
|---|---|
| Constituer la base | 25 000 consentements, objectif SMART n° 2 |
| Réduire les lots non réclamés | Taux de remise à 70 %, objectif SMART n° 4 |
| Préparer le site marchand | Base réutilisable au lancement |
| Fidéliser après le jeu | Taux d'ouverture maintenu au-delà de décembre |

## Les types de mails à mettre en place

### Mails transactionnels

Déclenchés par une action du client. Ils ne nécessitent pas de consentement marketing, puisqu'ils relèvent de l'exécution du jeu.

| Mail | Déclencheur | Contenu |
|---|---|---|
| Vérification de l'adresse | Création de compte par formulaire | Lien de confirmation, valable 48 heures |
| Confirmation de participation | Saisie d'un code valide | Le lot gagné, la date limite de réclamation, le lien vers l'espace personnel |
| Confirmation de remise | Enregistrement de la remise par un employé | Récapitulatif, date, boutique |
| Réinitialisation de mot de passe | Demande du client | Lien à usage unique |
| Notification de gain du gros lot | Tirage au sort | Annonce, modalités de remise, mention du contrôle par l'huissier |

### Mails de rappel

Ils relèvent encore de l'exécution du jeu, mais leur fréquence doit rester mesurée.

| Mail | Déclencheur | Contenu |
|---|---|---|
| Rappel avant date limite | J-10 avant la fin de la période de réclamation, si le lot n'est pas retiré | Rappel du lot, de la date limite, des boutiques les plus proches |
| Dernier rappel | J-3 | Même contenu, formulation plus directe |

Ces deux mails servent directement l'objectif de 70 % de lots remis. Sans eux, le taux de non-réclamation d'un jeu-concours est structurellement élevé.

### Mails de communication

Ils exigent le consentement marketing, distinct de l'acceptation du règlement.

| Mail | Fréquence | Contenu |
|---|---|---|
| Lettre d'information | Mensuelle | Un conseil, une nouveauté, une coulisse. Pas de catalogue |
| Bienvenue | Une fois, après consentement | Présentation de la maison, du fait main, du bio |
| Bilan de l'opération | Une fois, fin décembre | Chiffres du jeu, remerciements, annonce du site marchand à venir |

## Origine de la base

| Source | Volume attendu | Base légale |
|---|---|---|
| Inscriptions au jeu avec consentement marketing | 25 000 | Consentement explicite et horodaté |
| Inscriptions au jeu sans consentement | 15 000 | Transactionnel uniquement, jamais de communication |

**Nous n'achetons aucune base.** La trame du cahier des charges évoque cette possibilité, nous l'écartons pour deux raisons. Elle serait contraire à la démarche responsable annoncée par le client. Et elle est juridiquement fragile : le consentement recueilli par un tiers pour son propre compte ne vaut pas consentement pour Thé Tip Top.

## Fréquence d'envoi

| Période | Rythme |
|---|---|
| Pendant le jeu | Transactionnels au fil de l'eau, aucun mail de communication |
| Après la clôture | Les deux rappels, puis le bilan |
| Régime de croisière | Une lettre d'information par mois, jamais davantage |

Le choix de ne rien envoyer de commercial pendant le jeu est délibéré. Le participant vient de donner son adresse, la solliciter immédiatement produirait des désinscriptions et abîmerait la base au moment même où on la constitue.

## Conformité au règlement général sur la protection des données

| Exigence | Mise en œuvre |
|---|---|
| Consentement libre | La case de consentement marketing est décochée par défaut, et son refus n'empêche pas de jouer |
| Consentement spécifique | Elle est distincte de l'acceptation du règlement du jeu, qui est une case séparée |
| Consentement éclairé | La finalité est écrite en clair à côté de la case |
| Consentement horodaté | Champs `marketingConsent` et `marketingConsentAt` du modèle de données |
| Retrait aussi simple que l'accord | Lien de désinscription dans chaque envoi, et bascule dans l'espace personnel |
| Information de l'expéditeur | Identité et adresse postale de Thé Tip Top dans le pied de chaque mail |
| Durée de conservation | Jusqu'au retrait du consentement, comme indiqué dans la politique de confidentialité |
| Droits des personnes | Accès, rectification et effacement depuis l'espace personnel |

Le point sur le décochage par défaut n'est pas un détail de confort. Une case précochée invalide le consentement, ce qui rendrait la totalité de la base inexploitable.

## Prestataire préconisé

| Critère | Exigence |
|---|---|
| Hébergement des données | Union européenne, pour simplifier la conformité |
| Volume | Doit absorber 40 000 contacts et des pics d'envoi transactionnel |
| Transactionnel et marketing | Les deux dans le même outil, pour ne pas dupliquer la base |
| Interface de programmation | Nécessaire pour déclencher les mails depuis l'API du site |
| Gestion du consentement | Champs personnalisés et segmentation par consentement |
| Modèles de mail | Éditeur permettant de respecter la charte graphique |
| Coût | Offre gratuite suffisante pour la maquette du projet, offre payante à chiffrer pour la production |

> Le choix nominatif du prestataire et son coût sont à arrêter par R2, sur la base de ces critères. Le sujet demande d'indiquer le prestataire préconisé et son coût. Le nom retenu et le tarif doivent figurer ici avant l'export.

## Le gabarit de courriel

| Élément | Spécification |
|---|---|
| Largeur | 600 pixels, standard des clients de messagerie |
| En-tête | Logo sur fond clair, hauteur 60 pixels |
| Typographie | Police système en repli, les fontes de la charte n'étant pas chargées par tous les clients |
| Couleurs | Vert de la marque pour les boutons, fond papier, jamais de texte en laiton clair |
| Bouton d'action | Un seul par mail, en table HTML et non en image |
| Images | Toujours accompagnées d'un attribut alt, le mail devant rester lisible images bloquées |
| Version texte | Systématique, exigée par les filtres anti-spam |
| Pied de page | Identité de l'expéditeur, adresse postale, lien de désinscription, lien vers la politique de confidentialité |
| Mode sombre | Testé, les clients de messagerie inversent les couleurs de façon imprévisible |

## Indicateurs de suivi

| Indicateur | Cible | Source |
|---|---|---|
| Taux de délivrabilité | Supérieur à 98 % | Prestataire |
| Taux d'ouverture, transactionnel | Supérieur à 60 % | Prestataire |
| Taux d'ouverture, lettre d'information | Supérieur à 25 % | Prestataire |
| Taux de clic | Supérieur à 3 % | Prestataire |
| Taux de désinscription | Inférieur à 0,5 % par envoi | Prestataire |
| Taux de plainte | Inférieur à 0,1 % | Prestataire |
| Lots réclamés après rappel | À mesurer avant et après l'envoi | Back-office |

Le dernier indicateur est le plus intéressant à présenter au client, parce qu'il chiffre directement l'apport du canal : le nombre de lots réclamés grâce au mail de rappel, donc le nombre de clients revenus en boutique.

## Les livrables concrets attendus

Le sujet impose deux réalisations.

| Livrable | État |
|---|---|
| Un compte créé chez le prestataire préconisé, lié au site | À faire, R2, échéance 30 septembre |
| Un gabarit de mail respectant la charte et le règlement sur les données | À faire, R2 avec R4 pour le visuel, échéance 30 septembre |

Les identifiants sont à reporter dans le document d'accès du 16 novembre.
