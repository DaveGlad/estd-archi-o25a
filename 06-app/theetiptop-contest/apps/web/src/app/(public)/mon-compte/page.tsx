import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Gift } from 'lucide-react';
import { PrizeStatusBadge } from '@theetiptop-contest/ui/prize-status';
import { Alert } from '@theetiptop-contest/ui/alert';
import { ButtonLink } from '@theetiptop-contest/ui/button';
import { Card, CardBody } from '@theetiptop-contest/ui/card';
import { Stat } from '@theetiptop-contest/ui/stat';
import { daysUntil, formatDate, formatPrice } from '@theetiptop-contest/ui/utils';
import { getMyParticipations } from '@theetiptop-contest/api-client/server';

export const metadata: Metadata = { title: 'Mes gains' };

export default async function MesGainsPage() {
  // The prize is embedded in each participation by the API, so no second lookup per row —
  // the mock needed `getPrize(p.prizeId)` because it held them in separate collections.
  const items = await getMyParticipations();

  const toClaim = items.filter((participation) => participation.prizeStatus === 'TO_CLAIM');
  const totalValue = items.reduce((sum, participation) => sum + participation.prize.valueCents, 0);

  // The earliest deadline, not the first row's: the list is sorted newest-first, so
  // `toClaim[0]` is the one with the most time left, which is the wrong thing to warn about.
  const nextDeadline = toClaim
    .map((participation) => participation.claimDeadline)
    .sort()
    .at(0);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Codes joués" value={String(items.length)} />
        <Stat
          label="Lots à réclamer"
          value={String(toClaim.length)}
          hint={toClaim.length > 0 ? 'Pensez à les retirer avant la date limite' : undefined}
          icon={<Gift className="size-4" aria-hidden="true" />}
        />
        <Stat label="Valeur totale gagnée" value={formatPrice(totalValue)} />
      </div>

      {nextDeadline && (
        <Alert tone="warning" title={`${toClaim.length} lot(s) en attente de retrait`}>
          <p>
            Présentez-vous dans la boutique de votre choix avec une pièce
            d&apos;identité, ou demandez l&apos;envoi en ligne depuis le détail du gain.
            Date limite le {formatDate(nextDeadline)}, soit dans{' '}
            {daysUntil(nextDeadline)} jours.
          </p>
        </Alert>
      )}

      <section aria-labelledby="historique">
        <h2 id="historique" className="font-serif text-2xl">
          Historique de mes gains
        </h2>

        {items.length === 0 ? (
          <Card className="mt-5">
            <CardBody className="space-y-4 text-center">
              <p className="text-fg-muted">Vous n&apos;avez pas encore joué de code.</p>
              <ButtonLink href="/participer">Saisir mon premier code</ButtonLink>
            </CardBody>
          </Card>
        ) : (
          <ul className="mt-5 space-y-4">
            {items.map((participation) => (
              <li key={participation.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-serif text-xl">{participation.prize.label}</h3>
                        <PrizeStatusBadge status={participation.prizeStatus} />
                      </div>
                      <p className="text-sm text-fg-muted">
                        Code{' '}
                        <span className="font-mono tracking-wider">
                          {participation.ticketCode}
                        </span>{' '}
                        joué le {formatDate(participation.createdAt)}
                      </p>
                      {participation.prizeStatus === 'TO_CLAIM' && (
                        <p className="text-sm text-fg-muted">
                          À réclamer avant le {formatDate(participation.claimDeadline)}
                        </p>
                      )}
                      {participation.redemption && (
                        <p className="text-sm text-fg-muted">
                          Remis le {formatDate(participation.redemption.issuedAt)}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/mon-compte/gains/${participation.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium underline"
                    >
                      Voir le détail
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
