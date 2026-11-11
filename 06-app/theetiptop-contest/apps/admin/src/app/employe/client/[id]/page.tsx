import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Container } from '@theetiptop-contest/ui/container';
import { PrizeStatusBadge } from '@theetiptop-contest/ui/prize-status';
import { Alert } from '@theetiptop-contest/ui/alert';
import { Card, CardBody } from '@theetiptop-contest/ui/card';
import { daysUntil, formatDate, formatDateTime, formatPrice } from '@theetiptop-contest/ui/utils';
import {
  ApiError,
  getCustomer,
  getStores,
} from '@theetiptop-contest/api-client/server';

import { RedeemButton } from '../../../../components/back-office/redeem-button';
import { requireRole } from '../../../../lib/require-role';

export const metadata: Metadata = {
  title: 'Gains du client',
  robots: { index: false, follow: false },
};

/**
 * No `generateStaticParams` here, unlike the mocked version.
 *
 * Pre-rendering a page per customer would both leak the list of customer ids into the
 * build output and serve one employee's view of a customer from a cache that cannot know
 * whether a prize has since been handed over.
 */
export default async function ClientGainsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // The layout already guards the area; this re-read gives the employee's own store, which
  // is what the handover is recorded against.
  const [employee, stores] = await Promise.all([requireRole('EMPLOYEE', 'ADMIN'), getStores()]);

  let customer;
  try {
    customer = await getCustomer(id);
  } catch (error) {
    if (ApiError.is(error) && error.status === 404) notFound();
    throw error;
  }

  const employeeStore = stores.find((store) => store.id === employee.storeId);

  return (
    <Container className="py-10">
      <Link
        href="/employe"
        className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour à la recherche
      </Link>

      <header className="mt-6 mb-8">
        <h1 className="font-serif text-3xl">
          {customer.firstName} {customer.lastName}
        </h1>
        <p className="mt-1 text-fg-muted">{customer.email}</p>
        <p className="mt-2 text-sm text-fg-muted">
          {customer.participations.length} code
          {customer.participations.length > 1 ? 's' : ''} joué
          {customer.participations.length > 1 ? 's' : ''},{' '}
          <strong className="text-fg">{customer.prizesToClaim}</strong> lot
          {customer.prizesToClaim > 1 ? 's' : ''} à remettre
        </p>
      </header>

      <Alert tone="info" title="Avant de remettre un lot">
        <p>
          Demandez une pièce d&apos;identité au nom du compte. Un lot déjà remis ou expiré
          ne peut plus être délivré.
        </p>
      </Alert>

      {customer.participations.length === 0 ? (
        <Card className="mt-6">
          <CardBody className="py-10 text-center text-fg-muted">
            Ce client n&apos;a encore joué aucun code.
          </CardBody>
        </Card>
      ) : (
        <ul className="mt-6 space-y-4">
          {customer.participations.map((participation) => {
            const daysLeft = daysUntil(participation.claimDeadline);

            return (
              <li key={participation.id}>
                <Card>
                  <CardBody className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="font-serif text-xl">
                            {participation.prize.label}
                          </h2>
                          <PrizeStatusBadge status={participation.prizeStatus} />
                        </div>
                        <p className="mt-1 text-sm text-fg-muted">
                          Valeur {formatPrice(participation.prize.valueCents)}, code{' '}
                          <span className="font-mono tracking-wider">
                            {participation.ticketCode}
                          </span>
                        </p>
                        <p className="text-sm text-fg-muted">
                          Joué le {formatDate(participation.createdAt)}
                          {participation.prizeStatus === 'TO_CLAIM' &&
                            `, à remettre avant le ${formatDate(participation.claimDeadline)}, soit ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>

                    {participation.prizeStatus === 'TO_CLAIM' && (
                      <RedeemButton
                        participationId={participation.id}
                        prizeLabel={participation.prize.label}
                        customerName={`${customer.firstName} ${customer.lastName}`}
                        storeName={employeeStore?.name ?? 'en ligne'}
                      />
                    )}

                    {participation.redemption && (
                      <Alert tone="success" title="Lot déjà remis">
                        <p>
                          Remis le {formatDateTime(participation.redemption.issuedAt)} par{' '}
                          {participation.redemption.issuedByName}
                          {participation.redemption.storeName
                            ? `, boutique ${participation.redemption.storeName}`
                            : ''}
                          .
                        </p>
                      </Alert>
                    )}

                    {participation.prizeStatus === 'EXPIRED' && (
                      <Alert tone="warning" title="Délai de réclamation dépassé">
                        <p>
                          La date limite était le {formatDate(participation.claimDeadline)}.
                          Ce lot ne peut plus être remis.
                        </p>
                      </Alert>
                    )}
                  </CardBody>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
