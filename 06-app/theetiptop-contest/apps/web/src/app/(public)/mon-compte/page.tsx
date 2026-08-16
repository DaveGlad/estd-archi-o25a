import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Gift } from 'lucide-react';
import { PrizeStatusBadge } from '../../../components/account/prize-status';
import { Alert } from '../../../components/ui/alert';
import { ButtonLink } from '../../../components/ui/button';
import { Card, CardBody } from '../../../components/ui/card';
import { Stat } from '../../../components/ui/stat';
import {
  MOCK_TODAY,
  currentUser,
  getPrize,
  participationsOf,
} from '../../../lib/mock';
import { daysUntil, formatDate, formatPrice } from '../../../lib/utils';

export const metadata: Metadata = { title: 'Mes gains' };

export default function MesGainsPage() {
  const user = currentUser();
  const items = participationsOf(user.id);
  const toClaim = items.filter((p) => p.prizeStatus === 'TO_CLAIM');
  const totalValue = items.reduce((sum, p) => sum + getPrize(p.prizeId).valueCents, 0);

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

      {toClaim.length > 0 && (
        <Alert tone="warning" title={`${toClaim.length} lot(s) en attente de retrait`}>
          <p>
            Présentez-vous dans la boutique de votre choix avec une pièce
            d&apos;identité, ou demandez l&apos;envoi en ligne depuis le détail du
            gain. Date limite le {formatDate(toClaim[0].claimDeadline)}, soit dans{' '}
            {daysUntil(toClaim[0].claimDeadline, MOCK_TODAY)} jours.
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
              <p className="text-fg-muted">
                Vous n&apos;avez pas encore joué de code.
              </p>
              <ButtonLink href="/participer">Saisir mon premier code</ButtonLink>
            </CardBody>
          </Card>
        ) : (
          <ul className="mt-5 space-y-4">
            {items.map((participation) => {
              const prize = getPrize(participation.prizeId);
              return (
                <li key={participation.id}>
                  <Card>
                    <CardBody className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-serif text-xl">{prize.label}</h3>
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
                            À réclamer avant le{' '}
                            {formatDate(participation.claimDeadline)}
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
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
