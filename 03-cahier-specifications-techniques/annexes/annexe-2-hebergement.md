# Annexe 2 : base de calcul des coûts d'hébergement

Le dimensionnement de la partie D.3 appelle 8 vCPU, 32 Go de mémoire vive, 500 Go de SSD NVMe et une bande passante de 1 Gbit/s non limitée, plus 1 To de stockage externalisé chez un second prestataire. Cette annexe montre d'où vient le montant de **1 380 € par an** retenu en partie I.

## 1. Le serveur

Trois offres de serveur dédié ou de VPS haut de gamme répondent au dimensionnement. Les montants sont ceux relevés en novembre 2026, hors promotion d'engagement.

| Prestataire | Offre | Configuration | Mensuel HT | Annuel HT |
|---|---|---|---|---|
| Hébergeur A | VPS haute performance | 8 vCPU, 32 Go, 640 Go NVMe | 89 € | 1 068 € |
| Hébergeur B | Serveur dédié d'entrée de gamme | 6 cœurs physiques, 32 Go, 512 Go NVMe | 95 € | 1 140 € |
| Hébergeur C | Instance cloud à la demande | 8 vCPU, 32 Go, 500 Go SSD | 124 € | 1 488 € |

**Retenu : 1 080 € par an**, soit 90 € par mois, qui est la médiane des trois et correspond au VPS de l'hébergeur A arrondi.

L'instance cloud à la demande est la plus chère des trois et c'est normal : on paie la facturation à l'heure et l'élasticité. Or ce workflow tourne en permanence, 24 heures sur 24, et ne connaît pas de pic saisonnier. L'élasticité ne servirait à rien ici et coûterait 400 € de plus par an.

## 2. Le stockage externalisé

| Prestataire | Offre | Volume | Annuel HT |
|---|---|---|---|
| Stockage objet, classe standard | Facturation à l'usage | 1 To | 230 à 280 € |
| Stockage objet, classe archive | Restitution différée | 1 To | 60 à 90 € |

**Retenu : 240 € par an** pour la classe standard.

La classe archive coûte trois fois moins cher et elle est écartée, pour une raison qui tient au RTO. Une archive à restitution différée se récupère en quelques heures. Le RTO annoncé en D.3 est de 4 heures pour le workflow et de 2 heures pour un projet client : un stockage dont la seule restitution consomme déjà le budget temps complet ne permet pas de tenir cet engagement. L'économie de 160 € par an se paierait au premier sinistre.

**Le second prestataire n'est pas un détail d'organisation.** La règle du 3-2-1 veut une copie hors site, et « hors site » ne signifie pas « sur un autre disque du même fournisseur ». Un incident de facturation, une suspension de compte ou une panne régionale emporteraient les deux copies à la fois.

## 3. Le nom de domaine

| Poste | Annuel HT | Remarque |
|---|---|---|
| Domaine en `.fr` | 12 € | Tarif courant chez un bureau d'enregistrement |
| Sous-domaines | 0 € | Illimités, ce sont des enregistrements DNS |
| Certificats TLS | 0 € | Let's Encrypt, renouvelés automatiquement par le reverse proxy |
| Extensions défensives, `.com` et `.net` | 48 € | Facultatif, retenu ici |
| **Total** | **60 €** | |

Les certificats à zéro euro méritent d'être signalés au client, parce que c'est une ligne qui figure encore souvent dans les devis concurrents. Let's Encrypt délivre des certificats de domaine validé gratuitement, et Traefik les demande et les renouvelle sans intervention. Un certificat payant n'apporterait de différence que pour une validation étendue, laquelle n'a plus d'effet visible dans les navigateurs depuis 2019.

## 4. Les licences

| Brique | Licence | Coût |
|---|---|---|
| Docker Engine | Apache 2.0 | 0 € |
| Traefik | MIT | 0 € |
| Gitea | MIT | 0 € |
| Jenkins | MIT | 0 € |
| Registry Docker | Apache 2.0 | 0 € |
| Prometheus, Grafana, Loki | Apache 2.0 et AGPL | 0 € |
| PostgreSQL | PostgreSQL License | 0 € |
| Redis | BSD 3-Clause pour la version 7.2 retenue | 0 € |
| **Total** | | **0 €** |

Ce zéro n'est pas un artifice de présentation, c'est la contrainte n° 6 du sujet tenue jusqu'au bout. Une chaîne équivalente bâtie sur des produits propriétaires, avec une forge commerciale et une supervision sous licence, se situe entre 4 000 et 12 000 € par an pour une équipe de 45 personnes, selon le nombre d'utilisateurs déclarés.

La ligne Redis appelle une précision d'honnêteté. Redis a changé de licence en 2024 pour une double licence non reconnue comme open source par l'OSI, puis est revenu à l'AGPL en 2025. La version 7.2 retenue ici est antérieure au changement et reste sous licence BSD. Si l'agence devait monter de version, il faudrait réexaminer ce point ou basculer sur Valkey, le fork maintenu par la Linux Foundation.

## 5. Récapitulatif

| Poste | Annuel HT |
|---|---|
| Serveur | 1 080 € |
| Stockage externalisé | 240 € |
| Nom de domaine et extensions | 60 € |
| Licences | 0 € |
| **Total** | **1 380 €** |

C'est le montant repris en partie I.1 et I.2.

## 6. Ce que ce montant ne couvre pas

| Poste | Pourquoi il est hors périmètre |
|---|---|
| Infrastructure des projets clients | Chaque projet a son propre hébergement, facturé au client |
| Postes de travail des équipes | Charge existante de l'agence, antérieure au workflow |
| Temps humain | Compté séparément en I.1 et I.2, au TJM de l'annexe 1 |
| Migration vers deux serveurs | Scénario évoqué en D.3 si la mémoire devait être partagée. Doublerait la ligne serveur, soit 1 080 € de plus par an |
