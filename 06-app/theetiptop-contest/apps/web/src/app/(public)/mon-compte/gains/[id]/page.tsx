import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Package, Store } from 'lucide-react';
import { PrizeStatusBadge } from '@theetiptop-contest/ui/prize-status';
import { Alert } from '@theetiptop-contest/ui/alert';
import { Button, ButtonLink } from '@theetiptop-contest/ui/button';
import { Card, CardBody } from '@theetiptop-contest/ui/card';
import {
  ApiError,
  getParticipation,
  getStores,
} from '@theetiptop-contest/api-client/server';
import {
  daysUntil,
  formatDate,
  formatDateTime,
  formatPrice,
} from '@theetiptop-contest/ui/utils';

export const metadata: Metadata = { title: 'Détail de mon gain' };

export default async function GainDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 404 and 403 both become notFound(): telling a visitor "this prize exists but is not
  // yours" confirms the id is valid, which is an enumeration oracle on a cuid. The API
  // already refuses the read; the front end simply does not explain why.
  let participation;
  try {
    participation = await getParticipation(id);
  } catch (error) {
    if (ApiError.is(error) && (error.status === 404 || error.status === 403))
      notFound();
    throw error;
  }

  const stores = await getStores();
  const prize = participation.prize;
  const daysLeft = daysUntil(participation.claimDeadline);

  return (
    <div className="space-y-8">
      <Link
        href="/mon-compte"
        className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour à mes gains
      </Link>

      <Card className="overflow-hidden">
        <div className="bg-primary px-7 py-8 text-primary-fg">
          <Package className="size-7" aria-hidden="true" />
          <h1 className="mt-3 font-serif text-3xl">{prize.label}</h1>
          <p className="mt-1 text-sm opacity-90">
            Valeur {formatPrice(prize.valueCents)}
          </p>
        </div>

        <CardBody className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <PrizeStatusBadge status={participation.prizeStatus} />
            {participation.prizeStatus === 'TO_CLAIM' && (
              <span className="text-sm text-fg-muted">
                Il vous reste {daysLeft} jours pour le retirer
              </span>
            )}
          </div>

          <p className="text-sm text-fg-muted">{prize.description}</p>

          <dl className="grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-fg-muted">Code joué</dt>
              <dd className="mt-0.5 font-mono text-sm tracking-wider">
                {participation.ticketCode}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-fg-muted">Date de participation</dt>
              <dd className="mt-0.5 text-sm">
                {formatDateTime(participation.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-fg-muted">
                Date limite de réclamation
              </dt>
              <dd className="mt-0.5 text-sm">
                {formatDate(participation.claimDeadline)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-fg-muted">Référence</dt>
              <dd className="mt-0.5 font-mono text-sm">{participation.id}</dd>
            </div>
          </dl>

          {participation.redemption && (
            <div className="border-t border-border pt-5">
              <h2 className="font-semibold">Remise du lot</h2>
              <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-fg-muted">Remis le</dt>
                  <dd className="mt-0.5">
                    {formatDateTime(participation.redemption.issuedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-fg-muted">Lieu</dt>
                  <dd className="mt-0.5">
                    {participation.redemption.channel === 'IN_STORE'
                      ? `Boutique ${participation.redemption.storeName ?? '—'}`
                      : 'Envoi en ligne'}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </CardBody>
      </Card>

      {participation.prizeStatus === 'TO_CLAIM' && (
        <>
          <Alert tone="info" title="Comment récupérer votre lot">
            <p>
              Présentez cette page ou votre pièce d&apos;identité dans la
              boutique de votre choix. Vous pouvez aussi demander un envoi à
              domicile, les frais de port étant à la charge de Thé Tip Top.
            </p>
          </Alert>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card>
              <CardBody className="space-y-3">
                <Store
                  className="size-5 text-accent-strong"
                  aria-hidden="true"
                />
                <h2 className="font-semibold">Retirer en boutique</h2>
                <p className="text-sm text-fg-muted">
                  Dans n&apos;importe laquelle de nos {stores.length} boutiques,
                  aux horaires d&apos;ouverture.
                </p>
                <ButtonLink href="/boutiques" variant="secondary">
                  <MapPin className="size-4" aria-hidden="true" />
                  Voir les boutiques
                </ButtonLink>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-3">
                <Package
                  className="size-5 text-accent-strong"
                  aria-hidden="true"
                />
                <h2 className="font-semibold">Recevoir à domicile</h2>
                <p className="text-sm text-fg-muted">
                  Livraison sous cinq à sept jours ouvrés à l&apos;adresse de
                  votre choix.
                </p>
                <Button variant="secondary">Demander un envoi</Button>
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
