import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CalendarClock, ShieldCheck, Ticket } from 'lucide-react';
import { Container, PageHeader } from '@theetiptop-contest/ui/container';
import { Card, CardBody } from '@theetiptop-contest/ui/card';
import { daysUntil, formatDate, formatPrice } from '@theetiptop-contest/ui/utils';
import { getContest, getCurrentUser } from '@theetiptop-contest/api-client/server';

import { CodeForm } from '../../../components/participation/code-form';

export const metadata: Metadata = {
  title: 'Saisir mon code',
  description:
    'Entrez le code à dix caractères figurant sur votre ticket de caisse et découvrez immédiatement le lot que vous avez gagné.',
};

export default async function ParticiperPage() {
  const [user, contest] = await Promise.all([getCurrentUser(), getContest()]);

  // Playing a code requires an account: the participation is attached to a customer, and
  // the prize has to be claimable by somebody. `next` is carried through so a visitor who
  // arrived here from a receipt lands back on this page after signing in, rather than on a
  // generic home page having lost what they were doing.
  if (!user) redirect('/connexion?next=/participer');

  const daysLeft = daysUntil(contest.endsAt);

  return (
    <>
      <PageHeader
        eyebrow="Participer"
        title={`Bonjour ${user.firstName}, tentez votre code`}
        intro="Saisissez le code imprimé sur votre ticket de caisse. Votre lot s'affiche immédiatement."
      />

      <Container className="grid gap-10 py-14 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <CodeForm
          codeLength={contest.codeLength}
          minimumPurchaseCents={contest.minimumPurchaseCents}
        />

        <aside className="space-y-5">
          <Card>
            <CardBody className="space-y-5 text-base">
              <div className="flex gap-3">
                <Ticket className="mt-0.5 size-5 shrink-0 text-accent-strong" aria-hidden="true" />
                <div>
                  <p className="font-medium">Où trouver mon code</p>
                  <p className="mt-1 text-fg-muted">
                    En bas de votre ticket de caisse ou de votre facture, sous le
                    montant total. Il ne figure que sur les achats de plus de{' '}
                    {formatPrice(contest.minimumPurchaseCents)}.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 size-5 shrink-0 text-accent-strong" aria-hidden="true" />
                <div>
                  <p className="font-medium">
                    {contest.isOpen
                      ? `Il reste ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`
                      : contest.isPlayable
                        ? 'Le jeu est clos, la saisie reste ouverte'
                        : 'La saisie est terminée'}
                  </p>
                  <p className="mt-1 text-fg-muted">
                    {contest.isOpen ? 'Le jeu ferme le' : 'Le jeu a fermé le'}{' '}
                    {formatDate(contest.endsAt)}, mais vous pouvez saisir vos codes et
                    réclamer vos lots jusqu&apos;au {formatDate(contest.claimDeadline)}.
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
