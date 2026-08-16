# Emailing

**Responsable** : R2, gabarit graphique fourni par R4.
**Échéance** : 30 septembre.

## Ce que le sujet exige

> « Dans le cadre de votre projet, vous devrez obligatoirement créer un compte gratuit sur le prestataire préconisé afin de le lier au site internet. Un template de mail (newsletter, promotionnel ou autre) devra également avoir été créé en respectant vos préconisations marketing et visuelles mais également le RGPD. »

## Ce qui doit vivre ici

| Fichier | Contenu |
|---|---|
| `prestataire.md` | Choix justifié, fonctionnalités, tarif, localisation des données |
| `types-de-mails.md` | Promotionnel, transactionnel, newsletter. Origine de la base, contenus, fréquence |
| `template/` | Le gabarit exporté, plus sa capture pour le dossier |
| `conformite-rgpd.md` | Consentement, mention de désinscription, mentions légales du pied de mail |
| `acces.md` | Identifiants, à reporter dans le document d'accès du 16 novembre |

## Le point RGPD à ne pas rater

La base ne peut contenir que les participants ayant explicitement consenti à recevoir des communications. Ce consentement est distinct de l'acceptation du règlement du jeu, et il est horodaté. Le modèle de données le prévoit déjà, champs `marketingConsent` et `marketingConsentAt`.

Chaque envoi doit comporter un lien de désinscription fonctionnel et l'identité de l'expéditeur.
