import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Container } from '../../../../../components/layout/container';
import { PrizeStatusBadge } from '../../../../../components/account/prize-status';
import { RedeemButton } from '../../../../../components/back-office/redeem-button';
import { Alert } from '../../../../../components/ui/alert';
import { Card, CardBody } from '../../../../../components/ui/card';
import {
  MOCK_TODAY,
  currentEmployee,
  getPrize,
  getStore,
  getUser,
  participationsOf,
  users,
} from '../../../../../lib/mock';
import { daysUntil, formatDate, formatDateTime, formatPrice } from '../../../../../lib/utils';

export const metadata: Metadata = {
  title: 'Gains du client',
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return users.filter((u) => u.role === 'CUSTOMER').map((u) => ({ id: u.id }));
}

export default async function ClientGainsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = getUser(id);
  if (!customer || customer.role !== 'CUSTOMER') notFound();

  const employee = currentEmployee();
  const store = getStore(employee.storeId);
  const items = participationsOf(customer.id);

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
      </header>

      <Alert tone="info" title="Avant de remettre un lot">
        <p>
          Demandez une pièce d&apos;identité au nom du compte. Un lot déjà remis ou
          expiré ne peut plus être délivré.
        </p>
      </Alert>

      <ul className="mt-6 space-y-4">
        {items.map((participation) => {
          const prize = getPrize(participation.prizeId);
          const redemptionStore = getStore(participation.redemption?.storeId);
          const daysLeft = daysUntil(participation.claimDeadline, MOCK_TODAY);

          return (
            <li key={participation.id}>
              <Card>
                <CardBody className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-serif text-xl">{prize.label}</h2>
                        <PrizeStatusBadge status={participation.prizeStatus} />
                      </div>
                      <p className="mt-1 text-sm text-fg-muted">
                        Valeur {formatPrice(prize.valueCents)}, code{' '}
                        <span className="font-mono tracking-wider">
                          {participation.ticketCode}
                        </span>
                      </p>
                      <p className="text-sm text-fg-muted">
                        Joué le {formatDate(participation.createdAt)}
                        {participation.prizeStatus === 'TO_CLAIM' &&
                          `, à remettre avant le ${formatDate(participation.claimDeadline)}, soit ${daysLeft} jours`}
                      </p>
                    </div>
                  </div>

                  {participation.prizeStatus === 'TO_CLAIM' && (
                    <RedeemButton
                      prizeLabel={prize.label}
                      customerName={`${customer.firstName} ${customer.lastName}`}
                      storeName={store?.name ?? ''}
                    />
                  )}

                  {participation.redemption && (
                    <Alert tone="success" title="Lot déjà remis">
                      <p>
                        Remis le {formatDateTime(participation.redemption.issuedAt)} par{' '}
                        {participation.redemption.issuedByName}
                        {redemptionStore ? `, boutique ${redemptionStore.name}` : ''}.
                      </p>
                    </Alert>
                  )}
                </CardBody>
              </Card>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
