import { ArrowRight, Leaf, MapPin } from 'lucide-react';
import { ButtonLink } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardInteractive } from '../../components/ui/card';
import {
  Container,
  Eyebrow,
  SectionHeader,
} from '../../components/layout/container';
import {
  Grain,
  LeafOrnament,
  SteamOrnament,
} from '../../components/layout/ornaments';
import {
  JsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from '../../components/seo/json-ld';
import {
  MOCK_TODAY,
  contest,
  getGrandPrize,
  getTicketPrizes,
  stores,
} from '../../lib/mock';
import { daysUntil, formatDate, formatPrice } from '../../lib/utils';

const steps = [
  {
    title: 'Achetez en boutique',
    text: 'Tout ticket de caisse ou facture de plus de 49 € porte un code à dix caractères, imprimé sous le montant total.',
  },
  {
    title: 'Saisissez votre code',
    text: 'Créez votre compte en quelques secondes, par formulaire ou en un clic, puis entrez le code de votre ticket.',
  },
  {
    title: 'Récupérez votre lot',
    text: 'En boutique ou en ligne, jusqu’à trente jours après la clôture du jeu. Aucun achat supplémentaire.',
  },
];

export default function HomePage() {
  const ticketPrizes = getTicketPrizes();
  const grandPrize = getGrandPrize();
  const daysLeft = daysUntil(contest.endsAt, MOCK_TODAY);
  const newStore = stores.find((s) => s.isNew);

  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />

      {/* Héros */}
      <section className="relative isolate overflow-hidden border-b border-border bg-surface">
        <Grain />
        <LeafOrnament className="pointer-events-none absolute -top-20 -right-28 hidden h-[520px] w-[420px] lg:block" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-44 left-1/2 h-96 w-[54rem] -translate-x-1/2 rounded-full bg-accent/8 blur-3xl"
        />

        <Container className="relative grid gap-14 py-16 sm:py-24 lg:grid-cols-[1.12fr_1fr] lg:items-center lg:py-28">
          <div>
            <Badge tone="accent">
              <Leaf className="size-3.5" aria-hidden="true" />
              Ouverture de notre dixième boutique · {newStore?.city}
            </Badge>

            <h1 className="mt-6 font-serif text-[clamp(2.75rem,1.5rem+4.4vw,4.25rem)] leading-[0.98] tracking-[-0.03em]">
              100 % des tickets
              <br />
              sont gagnants.
              <span className="block text-accent-strong">Le vôtre aussi.</span>
            </h1>

            <p className="mt-6 max-w-[46ch] text-[19px] leading-[1.55] text-fg-muted">
              Pour fêter notre arrivée à {newStore?.city}, chaque ticket de caisse de
              plus de {formatPrice(contest.minimumPurchaseCents)} porte un code
              gagnant. Infuseur, boîte de thé, coffret découverte, et une année de
              thé à gagner au tirage au sort.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/participer" size="lg">
                Saisir mon code
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </ButtonLink>
              <ButtonLink href="/jeu-concours/lots" size="lg" variant="secondary">
                Voir les lots
              </ButtonLink>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-8 border-t border-border pt-7">
              {[
                { label: 'Jours restants', value: String(daysLeft) },
                {
                  label: 'Codes en jeu',
                  value: contest.plannedCodeCount.toLocaleString('fr-FR'),
                },
                { label: 'Boutiques', value: String(stores.length) },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-[11px] leading-none font-semibold tracking-[0.1em] text-fg-muted uppercase">
                    {item.label}
                  </dt>
                  <dd className="mt-2.5 font-serif text-[28px] leading-none tracking-[-0.02em] tabular-nums">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Carte du gros lot */}
          <Card className="overflow-hidden">
            <div className="relative overflow-hidden bg-primary px-7 py-8 text-primary-fg">
              <SteamOrnament className="pointer-events-none absolute -top-3 right-5 h-24 w-32 text-primary-fg" />
              <p className="relative text-[11px] leading-none font-semibold tracking-[0.13em] uppercase opacity-80">
                Le gros lot
              </p>
              <p className="relative mt-3 font-serif text-[32px] leading-[1.05] tracking-[-0.02em]">
                {grandPrize.label}
              </p>
              <p className="relative mt-2 text-[15px] opacity-85">
                D&apos;une valeur de {formatPrice(grandPrize.valueCents)}
              </p>
            </div>

            <div className="space-y-5 px-7 py-6">
              <p className="text-[15.5px] leading-[1.6] text-fg-muted">
                {grandPrize.description}
              </p>
              <ul className="space-y-3 border-t border-border pt-5 text-[15px] leading-[1.5]">
                {[
                  `Tirage au sort le ${formatDate(contest.endsAt)}, sous le contrôle de ${contest.bailiffName}.`,
                  'Une seule chance par participant, quel que soit le nombre de codes joués.',
                  `Règlement déposé le ${formatDate(contest.rulesFiledAt)}.`,
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-[9px] block size-1 shrink-0 rounded-full bg-accent-strong"
                    />
                    <span className="text-fg-muted">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </Container>
      </section>

      {/* Comment participer */}
      <section aria-labelledby="comment-participer">
        <Container className="py-20 sm:py-24">
          <SectionHeader
            id="comment-participer"
            eyebrow="Mode d'emploi"
            title="Comment participer"
            intro="Trois étapes, deux minutes, et aucun achat supplémentaire."
          />

          <ol className="mt-12 grid gap-px overflow-hidden rounded-[14px] border border-border bg-border md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="bg-surface p-7">
                <span
                  aria-hidden="true"
                  className="font-serif text-[40px] leading-none tracking-[-0.03em] text-accent-strong/30"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-[19px] leading-[1.3] font-semibold tracking-[-0.01em]">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[15.5px] leading-[1.6] text-fg-muted">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Les lots */}
      <section aria-labelledby="les-lots" className="border-y border-border bg-surface">
        <Container className="py-20 sm:py-24">
          <SectionHeader
            id="les-lots"
            eyebrow="La dotation"
            title="Les lots à gagner"
            intro={`Cinq lots, répartis sur les ${contest.plannedCodeCount.toLocaleString('fr-FR')} codes du jeu.`}
            action={
              <ButtonLink href="/jeu-concours/lots" variant="secondary">
                Tout voir
              </ButtonLink>
            }
          />

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ticketPrizes.map((prize) => (
              <li key={prize.id}>
                <CardInteractive className="flex h-full flex-col p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-serif text-[30px] leading-none tracking-[-0.02em] text-accent-strong">
                      {prize.targetPercentage}
                      <span className="text-[16px]"> %</span>
                    </span>
                    <span className="text-[13px] text-fg-muted tabular-nums">
                      {formatPrice(prize.valueCents)}
                    </span>
                  </div>

                  <h3 className="mt-5 font-serif text-[21px] leading-[1.25] tracking-[-0.015em]">
                    {prize.label}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-[1.55] text-fg-muted">
                    {prize.description}
                  </p>
                </CardInteractive>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Les boutiques */}
      <section aria-labelledby="nos-boutiques">
        <Container className="py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <Eyebrow className="mb-3">La maison</Eyebrow>
              <h2
                id="nos-boutiques"
                className="font-serif text-[clamp(1.6rem,1.2rem+1.4vw,2.125rem)] leading-[1.15] tracking-[-0.02em]"
              >
                Dix boutiques,
                <br />
                une même exigence
              </h2>
              <p className="mt-4 max-w-[46ch] text-[16.5px] leading-[1.6] text-fg-muted">
                Nos thés sont bio et assemblés à la main dans notre atelier. Depuis
                notre première boutique parisienne jusqu&apos;à celle de{' '}
                {newStore?.city}, nous ne vendons que ce dont nous connaissons
                l&apos;origine.
              </p>
              <ButtonLink href="/boutiques" variant="secondary" className="mt-7">
                <MapPin className="size-4" aria-hidden="true" />
                Trouver une boutique
              </ButtonLink>
            </div>

            <ul className="grid gap-px overflow-hidden rounded-[14px] border border-border bg-border sm:grid-cols-2">
              {stores.slice(0, 6).map((store) => (
                <li key={store.id} className="bg-surface px-5 py-4">
                  <p className="text-[15.5px] leading-[1.35] font-medium">
                    {store.name}
                  </p>
                  <p className="mt-1 text-[13.5px] leading-[1.4] text-fg-muted tabular-nums">
                    {store.postalCode} {store.city}
                  </p>
                  {store.isNew && (
                    <Badge tone="success" className="mt-3">
                      Nouvelle
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}
