import type { Metadata } from 'next';
import { Container } from '../../../../components/layout/container';
import { Alert } from '../../../../components/ui/alert';
import { Button } from '../../../../components/ui/button';
import { Card, CardBody, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Stat } from '../../../../components/ui/stat';
import { MOCK_TODAY, contest, getGrandPrize, stats } from '../../../../lib/mock';
import { daysUntil, formatDate, formatPrice } from '../../../../lib/utils';

export const metadata: Metadata = {
  title: 'Tirage au sort',
  robots: { index: false, follow: false },
};

export default function TiragePage() {
  const grandPrize = getGrandPrize();
  const daysLeft = daysUntil(contest.endsAt, MOCK_TODAY);
  const open = daysLeft > 0;

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
          value={stats.participants.toLocaleString('fr-FR')}
          hint="Comptes distincts, non les participations"
        />
        <Stat label="Clôture du jeu" value={formatDate(contest.endsAt)} />
        <Stat
          label="Statut"
          value={open ? 'En attente' : 'Prêt'}
          hint={open ? `Disponible dans ${daysLeft} jours` : 'Le jeu est clos'}
        />
      </div>

      <Card className="mt-6 max-w-3xl">
        <CardHeader>
          <CardTitle>Déroulé du tirage</CardTitle>
        </CardHeader>
        <CardBody className="space-y-5">
          <ol className="space-y-4 text-sm">
            {[
              'Extraction de la liste des participants distincts. Une personne ayant joué vingt codes apparaît une seule fois.',
              'Tri déterministe de la liste, puis calcul de son empreinte SHA-256, qui sera conservée comme preuve.',
              'Génération et enregistrement de la graine aléatoire, indispensable pour rejouer le tirage à l’identique.',
              'Tirage exécuté côté serveur, en présence de l’huissier.',
              'Édition du procès-verbal, puis notification du gagnant.',
            ].map((step, index) => (
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
              résultat. L&apos;empreinte prouve que la liste des participants n&apos;a
              pas été modifiée après coup. Sans ces deux éléments, un tirage ne peut pas
              être vérifié, donc pas défendu en cas de contestation.
            </p>
          </Alert>

          <Button size="lg" disabled={open}>
            Lancer le tirage
          </Button>
          {open && (
            <p className="text-sm text-fg-muted">
              Le tirage ne peut être lancé qu&apos;après la clôture du jeu, le{' '}
              {formatDate(contest.endsAt)}.
            </p>
          )}
        </CardBody>
      </Card>

      <Card className="mt-6 max-w-3xl">
        <CardHeader>
          <CardTitle>Historique des tirages</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-fg-muted">
            Aucun tirage n&apos;a encore été effectué pour cette opération.
          </p>
        </CardBody>
      </Card>
    </Container>
  );
}
