import type { Metadata } from 'next';
import { Container } from '@theetiptop-contest/ui/container';
import { Alert } from '@theetiptop-contest/ui/alert';
import { Card, CardBody, CardHeader, CardTitle } from '@theetiptop-contest/ui/card';
import { Stat } from '@theetiptop-contest/ui/stat';
import { daysUntil, formatCount, formatDate, formatPrice } from '@theetiptop-contest/ui/utils';
import {
  getContest,
  getDraw,
  getGrandPrize,
  getStats,
} from '@theetiptop-contest/api-client/server';

import { DrawPanel } from '../../../components/back-office/draw-panel';

export const metadata: Metadata = {
  title: 'Tirage au sort',
  robots: { index: false, follow: false },
};

const STEPS = [
  'Extraction de la liste des participants distincts. Une personne ayant joué vingt codes apparaît une seule fois.',
  'Tri déterministe de la liste sur l’identifiant, puis calcul de son empreinte SHA-256, conservée comme preuve.',
  'Génération de la graine aléatoire depuis le générateur du système, puis enregistrement : c’est elle qui permet de rejouer le tirage à l’identique.',
  'Tirage exécuté côté serveur, en présence de l’huissier.',
  'Édition du procès-verbal, puis notification du gagnant.',
];

export default async function TiragePage() {
  const [contest, grandPrize, stats, draw] = await Promise.all([
    getContest(),
    getGrandPrize(),
    getStats(),
    getDraw(),
  ]);

  const daysLeft = daysUntil(contest.endsAt);
  const stillOpen = contest.isOpen;

  return (
    <Container className="py-10">
      <header className="mb-8">
        <h1 className="font-serif text-3xl">Tirage au sort du gros lot</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          {grandPrize.label}, d&apos;une valeur de {formatPrice(grandPrize.valueCents)},
          attribué à la clôture du jeu sous le contrôle de {contest.bailiffName}.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Participants éligibles"
          value={formatCount(stats.participants)}
          hint="Comptes distincts, et non les participations"
        />
        <Stat label="Clôture du jeu" value={formatDate(contest.endsAt)} />
        <Stat
          label="Statut"
          value={draw ? 'Effectué' : stillOpen ? 'En attente' : 'Prêt'}
          hint={
            draw
              ? `Le ${formatDate(draw.executedAt)}`
              : stillOpen
                ? `Disponible dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`
                : 'Le jeu est clos'
          }
        />
      </div>

      <Card className="mt-6 max-w-3xl">
        <CardHeader>
          <CardTitle>Déroulé du tirage</CardTitle>
        </CardHeader>
        <CardBody className="space-y-5">
          <ol className="space-y-4 text-sm">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="text-fg-muted">{step}</span>
              </li>
            ))}
          </ol>

          <Alert tone="info" title="Pourquoi conserver la graine et l'empreinte">
            <p>
              La graine permet de rejouer le tirage et d&apos;obtenir exactement le même
              résultat. L&apos;empreinte prouve que la liste des participants n&apos;a pas
              été modifiée après coup. Sans ces deux éléments, un tirage ne peut pas être
              vérifié, donc pas défendu en cas de contestation.
            </p>
            <p className="mt-2">
              À la différence de la graine de génération des 500 000 codes, celle du tirage
              est conservée en clair : elle décrit une opération déjà terminée, et la
              connaître ne permet rien d&apos;autre que de recalculer un résultat déjà
              public.
            </p>
          </Alert>

          <DrawPanel initialDraw={draw} />
        </CardBody>
      </Card>

      <Card className="mt-6 max-w-3xl">
        <CardHeader>
          <CardTitle>Équité du tirage</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-sm text-fg-muted">
          <p>
            L&apos;assiette du tirage est l&apos;ensemble des{' '}
            <strong>participants distincts</strong>, et non l&apos;ensemble des
            participations. Un client ayant joué quarante codes a une chance, exactement
            comme celui qui en a joué un.
          </p>
          <p>
            C&apos;est une exigence explicite du sujet, et la différence tient à un
            <code className="mx-1 font-mono">DISTINCT</code> dans la requête. Le test
            automatisé de l&apos;équité du tirage vérifie précisément ce point.
          </p>
        </CardBody>
      </Card>
    </Container>
  );
}
