import type { Metadata } from 'next';
import { Download } from 'lucide-react';
import { Container, PageHeader } from '@theetiptop-contest/ui/container';
import { Button } from '@theetiptop-contest/ui/button';
import { Alert } from '@theetiptop-contest/ui/alert';
import { getContest, getGrandPrize, getTicketPrizes } from '@theetiptop-contest/api-client/server';
import { formatCount, formatDate, formatPrice } from '@theetiptop-contest/ui/utils';

export const metadata: Metadata = {
  title: 'Règlement du jeu',
  description:
    'Règlement complet du Grand Jeu Thé Tip Top, déposé auprès de Maître Arnaud Rick, huissier de justice.',
};

export default async function ReglementPage() {
  const [contest, ticketPrizes, grandPrize] = await Promise.all([
    getContest(),
    getTicketPrizes(),
    getGrandPrize(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Le jeu-concours"
        title="Règlement du jeu"
        intro={`Déposé le ${formatDate(contest.rulesFiledAt ?? contest.startsAt)} auprès de ${contest.bailiffName}, huissier de justice.`}
      />
      <Container className="py-14">
        <Button variant="secondary">
          <Download className="size-4" aria-hidden="true" />
          Télécharger le règlement en PDF
        </Button>

        <div className="rich-text mt-10">
          <h2>Article 1, organisateur</h2>
          <p>
            La société Thé Tip Top, société anonyme au capital de 150 000 €, dont le
            siège est situé 18 rue Léon Frot, 75011 Paris, organise un jeu-concours
            gratuit intitulé « {contest.name} ».
          </p>

          <h2>Article 2, durée</h2>
          <p>
            Le jeu se déroule du {formatDate(contest.startsAt)} au{' '}
            {formatDate(contest.endsAt)} inclus. Les participants disposent ensuite de
            trente jours, soit jusqu&apos;au {formatDate(contest.claimDeadline)}, pour
            réclamer leur lot.
          </p>

          <h2>Article 3, conditions de participation</h2>
          <p>
            Le jeu est ouvert à toute personne physique majeure résidant en France
            métropolitaine, à l&apos;exclusion des membres du personnel de la société
            organisatrice et de leur famille proche.
          </p>
          <p>
            Pour participer, il convient de réaliser un achat d&apos;un montant
            supérieur à {formatPrice(contest.minimumPurchaseCents)} dans l&apos;une des
            boutiques Thé Tip Top pendant la période du jeu. Un code à{' '}
            {contest.codeLength} caractères figure alors sur le ticket de caisse ou la
            facture. La participation s&apos;effectue en saisissant ce code sur le site
            après création d&apos;un compte.
          </p>
          <p>
            Une seule inscription par personne est autorisée. Chaque code ne peut être
            joué qu&apos;une seule fois.
          </p>

          <h2>Article 4, dotation</h2>
          <p>
            {formatCount(contest.plannedCodeCount)} codes sont mis en jeu.
            Tous sont gagnants. Ils ont été générés avant l&apos;ouverture du jeu, avec
            leur lot déjà attribué, selon la répartition suivante :
          </p>
          <ul>
            {ticketPrizes.map((prize) => (
              <li key={prize.id}>
                {prize.targetPercentage} % des codes, soit{' '}
                {(prize.targetQuantity ?? 0).toLocaleString('fr-FR')} lots :{' '}
                {prize.label.toLowerCase()}, d&apos;une valeur de{' '}
                {formatPrice(prize.valueCents)}.
              </li>
            ))}
          </ul>
          <p>
            S&apos;y ajoute un gros lot unique, {grandPrize.label.toLowerCase()},
            d&apos;une valeur de {formatPrice(grandPrize.valueCents)}, attribué par
            tirage au sort.
          </p>

          <h2>Article 5, tirage au sort du gros lot</h2>
          <p>
            À l&apos;issue du jeu, un tirage au sort est effectué parmi l&apos;ensemble
            des participants afin de désigner le gagnant du gros lot. Ce tirage est
            réalisé par l&apos;application côté serveur, sous le contrôle de{' '}
            {contest.bailiffName}.
          </p>
          <p>
            <strong>
              Le nombre de participations d&apos;un client n&apos;augmente pas ses
              chances de gagner.
            </strong>{' '}
            Le tirage porte sur les participants et non sur les participations.
          </p>

          <h2>Article 6, remise des lots</h2>
          <p>
            Les lots sont retirés en boutique ou en ligne, dans la limite du délai
            indiqué à l&apos;article 2. Ils ne peuvent être ni échangés, ni repris, ni
            faire l&apos;objet d&apos;une contrepartie financière. Tout lot non réclamé
            à l&apos;issue du délai est perdu.
          </p>

          <h2>Article 7, données personnelles</h2>
          <p>
            Les données collectées sont nécessaires à la gestion du jeu et à
            l&apos;attribution des lots. Leur traitement est décrit dans la politique
            de confidentialité accessible depuis le site.
          </p>

          <h2>Article 8, fraude</h2>
          <p>
            Toute tentative de fraude entraîne l&apos;exclusion immédiate du
            participant et l&apos;annulation de l&apos;ensemble de ses participations,
            sans préjudice des poursuites éventuelles.
          </p>

          <h2>Article 9, dépôt et consultation</h2>
          <p>
            Le présent règlement est déposé auprès de {contest.bailiffName}, huissier
            de justice. Il peut être consulté et téléchargé gratuitement depuis cette
            page pendant toute la durée du jeu.
          </p>

          <h2>Article 10, acceptation</h2>
          <p>
            La participation au jeu implique l&apos;acceptation pleine et entière du
            présent règlement.
          </p>
        </div>

        <div className="mt-8 max-w-3xl">
          <Alert tone="info">
            <p>
              Projet étudiant fictif. Ce règlement est un document pédagogique, il n&apos;a
              fait l&apos;objet d&apos;aucun dépôt réel et n&apos;a aucune valeur
              juridique.
            </p>
          </Alert>
        </div>
      </Container>
    </>
  );
}
