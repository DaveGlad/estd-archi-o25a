import type { Metadata } from 'next';
import { Container, PageHeader } from '@theetiptop-contest/ui/container';
import { Badge } from '@theetiptop-contest/ui/badge';
import { ButtonLink } from '@theetiptop-contest/ui/button';
import { Card, CardBody } from '@theetiptop-contest/ui/card';
import { Bar } from '@theetiptop-contest/ui/bar';
import {
  formatCount,
  formatDate,
  formatPrice,
} from '@theetiptop-contest/ui/utils';
import {
  getContest,
  getGrandPrize,
  getTicketPrizes,
} from '@theetiptop-contest/api-client/server';

export const metadata: Metadata = {
  title: 'Les lots à gagner',
  description:
    'Infuseur, boîte de thé détox, thé signature, coffrets découverte à 39 et 69 €, et une année de thé au tirage au sort. Découvrez la répartition des 500 000 lots.',
};

/** The largest share, 60%, so every bar is read against the same scale. */
const LARGEST_SHARE = 60;

export default async function LotsPage() {
  // Three independent reads: fetched concurrently rather than awaited one after the other,
  // which would make the page's time-to-first-byte their sum.
  const [contest, ticketPrizes, grandPrize] = await Promise.all([
    getContest(),
    getTicketPrizes(),
    getGrandPrize(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Le jeu-concours"
        title="Les lots à gagner"
        intro={`Les ${formatCount(contest.plannedCodeCount)} codes du jeu ont été générés avant son ouverture, chacun avec son lot déjà attribué. La répartition ci-dessous est celle du règlement déposé chez l'huissier.`}
      />

      <Container className="py-14">
        <ul className="grid gap-6 lg:grid-cols-2">
          {ticketPrizes.map((prize) => (
            <li key={prize.id}>
              <Card className="h-full">
                <CardBody className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge tone="accent">
                      {prize.targetPercentage} % des tickets
                    </Badge>
                    <span className="text-sm text-fg-muted">
                      Valeur {formatPrice(prize.valueCents)}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-serif text-2xl">{prize.label}</h2>
                    <p className="mt-2 text-base text-fg-muted">
                      {prize.description}
                    </p>
                  </div>

                  <Bar
                    label="Part des codes"
                    value={prize.targetPercentage ?? 0}
                    max={LARGEST_SHARE}
                    caption={`${formatCount(prize.targetQuantity ?? 0)} lots`}
                  />
                </CardBody>
              </Card>
            </li>
          ))}

          <li>
            <Card className="h-full overflow-hidden">
              <div className="bg-primary px-6 py-6 text-primary-fg">
                <p className="text-xs font-semibold tracking-[0.14em] uppercase opacity-85">
                  Le gros lot
                </p>
                <h2 className="mt-2 font-serif text-2xl">{grandPrize.label}</h2>
                <p className="mt-1 text-sm opacity-90">
                  Valeur {formatPrice(grandPrize.valueCents)}
                </p>
              </div>
              <CardBody className="space-y-3 text-base text-fg-muted">
                <p>{grandPrize.description}</p>
                <p>
                  Tirage effectué à la clôture du jeu, le{' '}
                  {formatDate(contest.endsAt)}, sous le contrôle de{' '}
                  {contest.bailiffName}. Le nombre de participations
                  n&apos;augmente pas les chances de gagner.
                </p>
              </CardBody>
            </Card>
          </li>
        </ul>

        <section
          aria-labelledby="repartition"
          className="mt-16 rounded-[var(--radius)] border border-border bg-surface p-8"
        >
          <h2 id="repartition" className="font-serif text-2xl">
            La répartition en un coup d&apos;œil
          </h2>
          <p className="mt-2 max-w-3xl text-base text-fg-muted">
            Ces pourcentages ne sont pas indicatifs. Ils sont garantis par la
            génération des codes, effectuée avant l&apos;ouverture du jeu, et
            vérifiés par un recomptage en base de données dont le rapport est
            conservé.
          </p>

          <div className="mt-8 space-y-5">
            {ticketPrizes.map((prize) => (
              <Bar
                key={prize.id}
                label={prize.label}
                value={prize.targetPercentage ?? 0}
                max={LARGEST_SHARE}
                caption={`${prize.targetPercentage} %, soit ${formatCount(prize.targetQuantity ?? 0)} lots`}
              />
            ))}
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink href="/participer" size="lg">
            Saisir mon code
          </ButtonLink>
          <ButtonLink
            href="/jeu-concours/reglement"
            variant="secondary"
            size="lg"
          >
            Lire le règlement
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
