import type { Metadata } from 'next';
import { Calendar, Gift, Receipt, ShieldCheck, Sparkles, Store } from 'lucide-react';
import { Container, PageHeader } from '../../../components/layout/container';
import { ButtonLink } from '../../../components/ui/button';
import { Card, CardBody } from '../../../components/ui/card';
import { Alert } from '../../../components/ui/alert';
import { contest } from '../../../lib/mock';
import { formatDate, formatPrice } from '../../../lib/utils';
import {
  JsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from '../../../components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Comment participer',
  description:
    "Tout ticket de caisse de plus de 49 € porte un code à dix caractères. Créez votre compte, saisissez votre code, et découvrez votre lot. 100 % des tickets sont gagnants.",
};

const steps = [
  {
    icon: Receipt,
    title: 'Repérez votre code',
    text: `Pour tout achat de plus de ${formatPrice(contest.minimumPurchaseCents)} en boutique, un code à ${contest.codeLength} caractères est imprimé en bas de votre ticket de caisse ou de votre facture.`,
  },
  {
    icon: Sparkles,
    title: 'Créez votre compte',
    text: "Par formulaire, ou en un clic avec votre compte Google ou Facebook. Il faut être majeur et résider en France métropolitaine.",
  },
  {
    icon: Gift,
    title: 'Saisissez le code',
    text: 'Votre lot apparaît immédiatement à l’écran, et vous recevez une confirmation par courriel.',
  },
  {
    icon: Store,
    title: 'Retirez votre lot',
    text: 'Dans la boutique de votre choix ou en ligne, jusqu’à trente jours après la clôture du jeu.',
  },
];

const faq = [
  {
    q: 'Combien de codes puis-je jouer ?',
    a: 'Autant que vous avez de tickets éligibles. Chaque code ne peut en revanche être joué qu’une seule fois, et un seul compte est autorisé par personne.',
  },
  {
    q: 'Est-ce que tous les tickets sont vraiment gagnants ?',
    a: 'Oui. Les 500 000 codes du jeu ont été générés avant son ouverture, chacun avec son lot déjà attribué. La répartition est fixée par le règlement déposé chez l’huissier.',
  },
  {
    q: 'Jouer plusieurs fois augmente-t-il mes chances au tirage au sort ?',
    a: 'Non. Pour le gros lot, le tirage porte sur les participants et non sur les participations. Une personne ayant joué vingt codes a exactement la même chance qu’une personne en ayant joué un seul.',
  },
  {
    q: 'Que se passe-t-il si j’oublie de retirer mon lot ?',
    a: `Vous avez jusqu’au ${formatDate(contest.claimDeadline)} pour le réclamer. Passé cette date, le lot est perdu et ne peut donner lieu à aucune compensation.`,
  },
  {
    q: 'Puis-je échanger mon lot contre de l’argent ?',
    a: 'Non. Les lots ne peuvent être ni échangés, ni repris, ni faire l’objet d’une contrepartie financière.',
  },
];

export default function JeuConcoursPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Accueil', path: '/' },
          { name: 'Le jeu-concours', path: '/jeu-concours' },
        ])}
      />

      <PageHeader
        eyebrow="Le jeu-concours"
        title="Comment participer"
        intro="Le jeu est ouvert à toute personne majeure résidant en France métropolitaine. Voici le déroulé, du ticket de caisse au retrait du lot."
      />

      <Container className="py-14">
        <ol className="grid gap-5 md:grid-cols-2">
          {steps.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full">
                <CardBody className="flex gap-4">
                  <span className="inline-grid size-11 shrink-0 place-items-center rounded-full bg-muted text-accent-strong">
                    <step.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold tracking-[0.14em] text-fg-muted uppercase">
                      Étape {index + 1}
                    </p>
                    <h2 className="text-lg font-semibold">{step.title}</h2>
                    <p className="text-base text-fg-muted">{step.text}</p>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <Card>
            <CardBody className="space-y-2">
              <Calendar className="size-5 text-accent-strong" aria-hidden="true" />
              <h2 className="font-semibold">Les dates</h2>
              <p className="text-base text-fg-muted">
                Jeu ouvert du {formatDate(contest.startsAt)} au{' '}
                {formatDate(contest.endsAt)}. Réclamation des lots possible jusqu&apos;au{' '}
                {formatDate(contest.claimDeadline)}.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-2">
              <ShieldCheck className="size-5 text-accent-strong" aria-hidden="true" />
              <h2 className="font-semibold">Le contrôle</h2>
              <p className="text-base text-fg-muted">
                Règlement déposé le {formatDate(contest.rulesFiledAt)} auprès de{' '}
                {contest.bailiffName}, huissier de justice, qui contrôle également le
                tirage du gros lot.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-2">
              <Gift className="size-5 text-accent-strong" aria-hidden="true" />
              <h2 className="font-semibold">Les lots</h2>
              <p className="text-base text-fg-muted">
                Cinq lots répartis sur {contest.plannedCodeCount.toLocaleString('fr-FR')}{' '}
                codes, plus une année de thé tirée au sort à la clôture.
              </p>
            </CardBody>
          </Card>
        </div>

        <section aria-labelledby="questions" className="mt-16">
          <h2 id="questions" className="font-serif text-3xl">
            Questions fréquentes
          </h2>
          <dl className="mt-8 divide-y divide-border border-t border-border">
            {faq.map((item) => (
              <div key={item.q} className="py-6">
                <dt className="text-lg font-medium">{item.q}</dt>
                <dd className="mt-2 max-w-3xl text-base text-fg-muted">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-12 space-y-6">
          <Alert tone="info" title="Un doute sur les modalités ?">
            <p>
              Le règlement complet fait foi. Il précise les conditions de
              participation, la liste des lots et les modalités du tirage au sort.
            </p>
          </Alert>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/participer" size="lg">
              Saisir mon code
            </ButtonLink>
            <ButtonLink href="/jeu-concours/reglement" variant="secondary" size="lg">
              Lire le règlement
            </ButtonLink>
          </div>
        </div>
      </Container>
    </>
  );
}
