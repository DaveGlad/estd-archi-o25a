import { ArrowRight, Gift, Leaf, MapPin, Receipt, Sparkles } from 'lucide-react';
import { ButtonLink } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardBody } from '../../components/ui/card';
import { Container } from '../../components/layout/container';
import {
  MOCK_TODAY,
  contest,
  getGrandPrize,
  getTicketPrizes,
  stores,
} from '../../lib/mock';
import { daysUntil, formatDate, formatPrice } from '../../lib/utils';
import {
  JsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from '../../components/seo/json-ld';
import {
  Grain,
  LeafOrnament,
  SteamOrnament,
} from '../../components/layout/ornaments';

const steps = [
  {
    icon: Receipt,
    title: 'Achetez en boutique',
    text: "Tout ticket de caisse ou facture de plus de 49 € porte un code à dix caractères.",
  },
  {
    icon: Sparkles,
    title: 'Saisissez votre code',
    text: 'Créez votre compte en quelques secondes, puis entrez le code de votre ticket.',
  },
  {
    icon: Gift,
    title: 'Récupérez votre lot',
    text: 'En boutique ou en ligne, dans les trente jours qui suivent la fin du jeu.',
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

      <section className="relative isolate overflow-hidden border-b border-border bg-surface">
        <Grain />
        <LeafOrnament className="pointer-events-none absolute -top-16 -right-24 hidden h-[460px] w-[380px] lg:block" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-accent/8 blur-3xl"
        />

        <Container className="relative grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <Badge tone="accent">
              <Leaf className="size-3.5" aria-hidden="true" />
              Ouverture de notre dixième boutique à {newStore?.city}
            </Badge>

            <h1 className="mt-5 font-serif leading-[1.06] text-[clamp(2.5rem,1.4rem+4.4vw,4rem)]">
              100 % des tickets sont gagnants.
              <span className="block text-accent-strong">Le vôtre aussi.</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg text-fg-muted">
              Pour fêter notre arrivée à {newStore?.city}, chaque ticket de caisse de
              plus de {formatPrice(contest.minimumPurchaseCents)} porte un code
              gagnant. Infuseur, boîte de thé, coffret découverte, et une année de thé
              à gagner au tirage au sort.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/participer" size="lg">
                Saisir mon code
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/jeu-concours/lots" size="lg" variant="secondary">
                Voir les lots
              </ButtonLink>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-6">
              <div>
                <dt className="text-sm text-fg-muted">Jours restants</dt>
                <dd className="font-serif text-2xl">{daysLeft}</dd>
              </div>
              <div>
                <dt className="text-sm text-fg-muted">Codes en jeu</dt>
                <dd className="font-serif text-2xl">
                  {contest.plannedCodeCount.toLocaleString('fr-FR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-fg-muted">Boutiques</dt>
                <dd className="font-serif text-2xl">{stores.length}</dd>
              </div>
            </dl>
          </div>

          <Card className="overflow-hidden">
            <div className="relative overflow-hidden bg-primary px-7 py-8 text-primary-fg">
              <SteamOrnament className="pointer-events-none absolute -top-2 right-6 h-24 w-32 text-primary-fg" />
              <p className="relative text-xs font-semibold tracking-[0.14em] uppercase opacity-85">
                Le gros lot
              </p>
              <p className="mt-2 font-serif text-3xl">{grandPrize.label}</p>
              <p className="mt-1 text-sm opacity-90">
                D&apos;une valeur de {formatPrice(grandPrize.valueCents)}
              </p>
            </div>
            <CardBody className="space-y-4">
              <p className="text-sm text-fg-muted">{grandPrize.description}</p>
              <ul className="space-y-2.5 text-sm">
                <li className="flex gap-2.5">
                  <span aria-hidden="true" className="text-accent-strong">
                    •
                  </span>
                  Tirage au sort le {formatDate(contest.endsAt)}, sous le contrôle de{' '}
                  {contest.bailiffName}.
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden="true" className="text-accent-strong">
                    •
                  </span>
                  Une seule chance par participant, quel que soit le nombre de codes
                  joués.
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden="true" className="text-accent-strong">
                    •
                  </span>
                  Règlement déposé le {formatDate(contest.rulesFiledAt)}.
                </li>
              </ul>
            </CardBody>
          </Card>
        </Container>
      </section>

      <section aria-labelledby="comment-participer">
        <Container className="py-16 sm:py-20">
          <h2 id="comment-participer" className="font-serif text-3xl">
            Comment participer
          </h2>
          <p className="mt-2 max-w-2xl text-fg-muted">
            Trois étapes, deux minutes, et aucun achat supplémentaire.
          </p>

          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <Card className="h-full">
                  <CardBody className="space-y-3">
                    <span className="inline-grid size-11 place-items-center rounded-full bg-muted text-accent-strong">
                      <step.icon className="size-5" aria-hidden="true" />
                    </span>
                    <p className="text-xs font-semibold tracking-[0.14em] text-fg-muted uppercase">
                      Étape {index + 1}
                    </p>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="text-sm text-fg-muted">{step.text}</p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="les-lots" className="border-y border-border bg-surface">
        <Container className="py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="les-lots" className="font-serif text-3xl">
                Les lots à gagner
              </h2>
              <p className="mt-2 text-fg-muted">
                Cinq lots, répartis sur les {contest.plannedCodeCount.toLocaleString('fr-FR')}{' '}
                codes du jeu.
              </p>
            </div>
            <ButtonLink href="/jeu-concours/lots" variant="secondary">
              Tout voir
            </ButtonLink>
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ticketPrizes.map((prize) => (
              <li key={prize.id}>
                <Card className="h-full">
                  <CardBody className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <Badge tone="accent">{prize.targetPercentage} % des tickets</Badge>
                      <span className="text-sm text-fg-muted">
                        {formatPrice(prize.valueCents)}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl">{prize.label}</h3>
                    <p className="text-sm text-fg-muted">{prize.description}</p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="nos-boutiques">
        <Container className="py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <h2 id="nos-boutiques" className="font-serif text-3xl">
                Dix boutiques, une même exigence
              </h2>
              <p className="mt-3 text-fg-muted">
                Nos thés sont bio et assemblés à la main dans notre atelier. Depuis
                notre première boutique parisienne jusqu&apos;à celle de{' '}
                {newStore?.city}, nous ne vendons que ce dont nous connaissons
                l&apos;origine.
              </p>
              <ButtonLink href="/boutiques" variant="secondary" className="mt-6">
                <MapPin className="size-4" aria-hidden="true" />
                Trouver une boutique
              </ButtonLink>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {stores.slice(0, 6).map((store) => (
                <li key={store.id}>
                  <Card className="p-4">
                    <p className="font-medium">{store.name}</p>
                    <p className="mt-0.5 text-sm text-fg-muted">
                      {store.postalCode} {store.city}
                    </p>
                    {store.isNew && (
                      <Badge tone="success" className="mt-2">
                        Nouvelle boutique
                      </Badge>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}
