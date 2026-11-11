import type { Metadata } from 'next';
import Link from 'next/link';
import {
  PARTICIPATIONS_DEFAULT_PAGE_SIZE,
  PRIZE_STATUS_VALUES,
  type PrizeStatus,
} from '@theetiptop-contest/shared';
import { Container } from '@theetiptop-contest/ui/container';
import { PrizeStatusBadge } from '@theetiptop-contest/ui/prize-status';
import { Badge } from '@theetiptop-contest/ui/badge';
import { Button } from '@theetiptop-contest/ui/button';
import { Card, CardBody } from '@theetiptop-contest/ui/card';
import { Field } from '@theetiptop-contest/ui/field';
import { Input, Select } from '@theetiptop-contest/ui/input';
import { Table, Td, Th } from '@theetiptop-contest/ui/table';
import { formatCount, formatDate } from '@theetiptop-contest/ui/utils';
import { getPrizes, listParticipations } from '@theetiptop-contest/api-client/server';

export const metadata: Metadata = {
  title: 'Participants',
  robots: { index: false, follow: false },
};

const PROVIDER_LABELS: Record<string, string> = {
  credential: 'Formulaire',
  google: 'Google',
  facebook: 'Facebook',
};

const STATUS_LABELS: Record<PrizeStatus, string> = {
  TO_CLAIM: 'À réclamer',
  REDEEMED: 'Remis',
  EXPIRED: 'Expiré',
};

interface SearchParams {
  q?: string;
  status?: string;
  prizeId?: string;
  page?: string;
}

/** Keeps the current filters when building a page link, so paging does not reset them. */
function pageHref(params: SearchParams, page: number): string {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.status) query.set('status', params.status);
  if (params.prizeId) query.set('prizeId', params.prizeId);
  if (page > 1) query.set('page', String(page));

  const search = query.toString();
  return search ? `/admin/participants?${search}` : '/admin/participants';
}

export default async function ParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);
  // Only a value the API will accept: an arbitrary `?status=foo` would otherwise come
  // back as a 400 that this screen has no way to explain.
  const status = PRIZE_STATUS_VALUES.includes(params.status as PrizeStatus)
    ? (params.status as PrizeStatus)
    : undefined;

  const [result, prizes] = await Promise.all([
    listParticipations({
      q: params.q || undefined,
      status,
      prizeId: params.prizeId || undefined,
      page,
    }),
    getPrizes(),
  ]);

  const pageCount = Math.max(1, Math.ceil(result.total / result.pageSize));
  const ticketPrizes = prizes.filter((prize) => prize.type === 'TICKET_PRIZE');

  return (
    <Container className="py-10">
      <header className="mb-8">
        <h1 className="font-serif text-3xl">Participants</h1>
        <p className="mt-2 text-fg-muted">
          {formatCount(result.total)} participation
          {result.total === 1 ? '' : 's'}
          {params.q || status || params.prizeId ? ' correspondant aux filtres' : ' au total'}.
          Page {result.page} sur {formatCount(pageCount)}.
        </p>
      </header>

      <Card className="mb-6">
        {/* A plain GET form, not a client component. The filters end up in the URL, so a
            filtered view is bookmarkable and shareable with a colleague, the back button
            works, and the screen keeps working with JavaScript disabled. */}
        <CardBody>
          <form method="get" action="/admin/participants" className="flex flex-wrap items-end gap-4">
            <div className="min-w-56 flex-1">
              <Field label="Rechercher" htmlFor="q">
                <Input
                  id="q"
                  name="q"
                  defaultValue={params.q ?? ''}
                  placeholder="Nom, courriel ou code"
                />
              </Field>
            </div>
            <div className="min-w-44">
              <Field label="Statut du lot" htmlFor="status">
                <Select id="status" name="status" defaultValue={status ?? ''}>
                  <option value="">Tous</option>
                  {PRIZE_STATUS_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {STATUS_LABELS[value]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="min-w-44">
              <Field label="Lot" htmlFor="prizeId">
                <Select id="prizeId" name="prizeId" defaultValue={params.prizeId ?? ''}>
                  <option value="">Tous</option>
                  {ticketPrizes.map((prize) => (
                    <option key={prize.id} value={prize.id}>
                      {prize.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button type="submit">Filtrer</Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          {result.items.length === 0 ? (
            <p className="p-8 text-center text-fg-muted">
              Aucune participation ne correspond à ces filtres.
            </p>
          ) : (
            <Table>
              <caption className="sr-only">
                Participations, du plus récent au plus ancien
              </caption>
              <thead>
                <tr>
                  <Th>Participant</Th>
                  <Th>Inscription</Th>
                  <Th>Code</Th>
                  <Th>Lot</Th>
                  <Th>Statut</Th>
                  <Th>Joué le</Th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((participation) => (
                  <tr key={participation.id}>
                    <Td>
                      <span className="font-medium">
                        {participation.customer.firstName} {participation.customer.lastName}
                      </span>
                      <br />
                      <span className="text-sm text-fg-muted">
                        {participation.customer.email}
                      </span>
                    </Td>
                    <Td>
                      <Badge>
                        {PROVIDER_LABELS[participation.customer.provider] ??
                          participation.customer.provider}
                      </Badge>
                    </Td>
                    <Td className="font-mono text-sm tracking-wider">
                      {participation.ticketCode}
                    </Td>
                    <Td>{participation.prizeLabel}</Td>
                    <Td>
                      <PrizeStatusBadge status={participation.prizeStatus} />
                    </Td>
                    <Td className="whitespace-nowrap">
                      {formatDate(participation.createdAt)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-4">
          {result.page > 1 ? (
            <Link href={pageHref(params, result.page - 1)} className="text-sm underline">
              ← Page précédente
            </Link>
          ) : (
            <span />
          )}

          <p className="text-sm text-fg-muted">
            {formatCount((result.page - 1) * result.pageSize + 1)}–
            {formatCount(Math.min(result.page * result.pageSize, result.total))} sur{' '}
            {formatCount(result.total)}
          </p>

          {result.page < pageCount ? (
            <Link href={pageHref(params, result.page + 1)} className="text-sm underline">
              Page suivante →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}

      <p className="mt-4 text-sm text-fg-muted">
        {result.pageSize === PARTICIPATIONS_DEFAULT_PAGE_SIZE && 'Affichage par 25. '}
        Besoin de retrouver un client pour lui remettre son lot ?{' '}
        <Link href="/employe" className="underline">
          Utilisez l&apos;espace boutique
        </Link>
        .
      </p>
    </Container>
  );
}
