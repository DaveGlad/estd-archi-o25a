import type { Metadata } from 'next';
import { CalendarClock, ShieldCheck, Ticket } from 'lucide-react';
import { Container, PageHeader } from '../../../components/layout/container';
import { Card, CardBody } from '../../../components/ui/card';
import { CodeForm } from '../../../components/participation/code-form';
import { MOCK_TODAY, contest, currentUser } from '../../../lib/mock';
import { daysUntil, formatDate } from '../../../lib/utils';

export const metadata: Metadata = {
  title: 'Saisir mon code',
  description:
    'Entrez le code à dix caractères figurant sur votre ticket de caisse et découvrez immédiatement le lot que vous avez gagné.',
};

export default function ParticiperPage() {
  const user = currentUser();
  const daysLeft = daysUntil(contest.endsAt, MOCK_TODAY);

  return (
    <>
      <PageHeader
        eyebrow="Participer"
        title={`Bonjour ${user.firstName}, tentez votre code`}
        intro="Saisissez le code imprimé sur votre ticket de caisse. Votre lot s'affiche immédiatement."
      />

      <Container className="grid gap-10 py-14 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <CodeForm />

        <aside className="space-y-5">
          <Card>
            <CardBody className="space-y-4 text-sm">
              <div className="flex gap-3">
                <Ticket className="mt-0.5 size-5 shrink-0 text-accent-strong" aria-hidden="true" />
                <div>
                  <p className="font-medium">Où trouver mon code</p>
                  <p className="mt-1 text-fg-muted">
                    En bas de votre ticket de caisse ou de votre facture, sous le
                    montant total. Il ne figure que sur les achats de plus de 49 €.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 size-5 shrink-0 text-accent-strong" aria-hidden="true" />
                <div>
                  <p className="font-medium">Il reste {daysLeft} jours</p>
                  <p className="mt-1 text-fg-muted">
                    Le jeu ferme le {formatDate(contest.endsAt)}. Vos lots restent
                    réclamables jusqu&apos;au {formatDate(contest.claimDeadline)}.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent-strong" aria-hidden="true" />
                <div>
                  <p className="font-medium">Un code, une seule fois</p>
                  <p className="mt-1 text-fg-muted">
                    Chaque code ne peut être joué qu&apos;une fois. Le lot associé est
                    fixé depuis l&apos;ouverture du jeu, il ne dépend ni du moment ni
                    de la personne.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </aside>
      </Container>
    </>
  );
}
