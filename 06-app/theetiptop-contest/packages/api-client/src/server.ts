/**
 * Server-only entry point of the API client.
 *
 * Every function here runs on the Next.js server: in a server component, in a route
 * handler or in a server action. Three consequences, all deliberate:
 *
 *   1. **The session is forwarded explicitly.** A server component has no ambient cookie
 *      jar, so `next/headers` is read and the `Cookie` header passed along. Without it the
 *      API answers 401 to a perfectly signed-in visitor.
 *
 *   2. **Nothing here reaches the browser bundle.** Importing `next/headers` makes the
 *      module server-only by construction, which is what keeps `API_URL` — the internal
 *      Docker address — out of the client.
 *
 *   3. **Mutations are server actions, not client fetches.** A client component calling
 *      the API directly would need the public API URL and CORS credentials; calling a
 *      server action instead keeps the only network hop on the server side.
 */

import { cookies } from 'next/headers';
import type {
  AdminParticipationDto,
  ContestDto,
  CustomerSearchResultDto,
  DrawDto,
  ListParticipationsQuery,
  MailingExportRow,
  Paginated,
  ParticipationDto,
  PersonalDataExport,
  PrizeDto,
  RedeemPrizeInput,
  RegisterInput,
  StatsDto,
  StoreDto,
  SubmitCodeResult,
  UpdateConsentInput,
  UpdateProfileInput,
  UserDto,
} from '@theetiptop-contest/shared';

import { ApiError, apiFetch, apiFetchText, type RequestOptions } from './lib/http';

export { ApiError };
export type { ApiErrorBody } from './lib/http';

/** Serialises the incoming request's cookies into a `Cookie` header. */
async function sessionCookie(): Promise<string> {
  const store = await cookies();
  return store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
}

/** Authenticated call: forwards the visitor's session to the API. */
async function authed<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    cookie: await sessionCookie(),
    // Never cached. These responses are per-user, and a shared cache keyed only on the URL
    // would be one request away from serving one customer's prizes to another.
    revalidate: false,
  });
}

/* ------------------------------------------------------------------ catalogue */

/**
 * The catalogue is public and identical for every visitor, so it is the one thing worth
 * caching at the Next.js layer. Five minutes: the contest dates change a handful of times
 * over its life, and these three calls happen on every page load of the public site.
 *
 * Tagged, so an administrator's edit can be pushed out with `revalidateTag` instead of
 * waiting for the window to close.
 */
const CATALOGUE_CACHE: RequestOptions = { revalidate: 300, tags: ['catalogue'] };

export function getContest(): Promise<ContestDto> {
  return apiFetch<ContestDto>('/contest', CATALOGUE_CACHE);
}

export function getPrizes(): Promise<PrizeDto[]> {
  return apiFetch<PrizeDto[]>('/prizes', CATALOGUE_CACHE);
}

export function getStores(): Promise<StoreDto[]> {
  return apiFetch<StoreDto[]>('/stores', CATALOGUE_CACHE);
}

/** The 5 prizes attached to the codes, in display order. Excludes the grand prize. */
export async function getTicketPrizes(): Promise<PrizeDto[]> {
  const prizes = await getPrizes();
  return prizes.filter((prize) => prize.type === 'TICKET_PRIZE');
}

/**
 * The grand prize, drawn at closing.
 *
 * Throws rather than returning `null`. A contest with no grand prize row is a broken seed,
 * not a state the pages should degrade for: the home page, the rules and the prize list all
 * describe it as part of the filed contest rules, and rendering them without it would show
 * a visitor rules that do not match the ones deposited with the bailiff. Failing loudly
 * surfaces the configuration error instead of hiding it behind three conditionals.
 */
export async function getGrandPrize(): Promise<PrizeDto> {
  const prizes = await getPrizes();
  const grandPrize = prizes.find((prize) => prize.type === 'GRAND_PRIZE');

  if (!grandPrize) {
    throw new Error(
      'No GRAND_PRIZE in the catalogue. The contest rules describe one, so this is a seeding error: run `npm run db:seed`.'
    );
  }

  return grandPrize;
}

/* ----------------------------------------------------------------- my account */

/**
 * The signed-in visitor, or `null` when anonymous.
 *
 * Returns `null` rather than throwing on 401: "is anybody signed in" is a question every
 * layout asks, and making the normal answer an exception would mean a try/catch in every
 * one of them.
 */
export async function getCurrentUser(): Promise<UserDto | null> {
  try {
    return await authed<UserDto>('/users/me');
  } catch (error) {
    if (ApiError.is(error) && error.status === 401) return null;
    throw error;
  }
}

export function getMyParticipations(): Promise<ParticipationDto[]> {
  return authed<ParticipationDto[]>('/participations/mine');
}

export function getParticipation(id: string): Promise<ParticipationDto> {
  return authed<ParticipationDto>(`/participations/${id}`);
}

export function getMyPersonalData(): Promise<PersonalDataExport> {
  return authed<PersonalDataExport>('/users/me/data-export');
}

/* -------------------------------------------------------------------- writes */

export function registerUser(input: RegisterInput): Promise<UserDto> {
  // Unauthenticated by construction, and the API sets the session cookie on the response.
  // The caller is a server action, which has to relay that `Set-Cookie` onwards — see the
  // sign-up action in apps/web.
  return apiFetch<UserDto>('/users/register', { method: 'POST', body: input, revalidate: false });
}

export function submitCode(code: string): Promise<SubmitCodeResult> {
  return authed<SubmitCodeResult>('/participations', { method: 'POST', body: { code } });
}

export function updateProfile(input: UpdateProfileInput): Promise<UserDto> {
  return authed<UserDto>('/users/me', { method: 'PATCH', body: input });
}

export function updateConsent(input: UpdateConsentInput): Promise<UserDto> {
  return authed<UserDto>('/users/me/consent', { method: 'PATCH', body: input });
}

export function anonymizeAccount(): Promise<{ anonymizedAt: string }> {
  return authed<{ anonymizedAt: string }>('/users/me', { method: 'DELETE' });
}

/* ------------------------------------------------------------------- employee */

export function searchCustomers(query: string): Promise<CustomerSearchResultDto[]> {
  return authed<CustomerSearchResultDto[]>('/employee/customers', { query: { q: query } });
}

export function getCustomer(id: string): Promise<CustomerSearchResultDto> {
  return authed<CustomerSearchResultDto>(`/employee/customers/${id}`);
}

export function redeemPrize(input: RedeemPrizeInput): Promise<ParticipationDto> {
  return authed<ParticipationDto>('/employee/redemptions', { method: 'POST', body: input });
}

/* ---------------------------------------------------------------------- admin */

/**
 * Administrator's participant list, paginated.
 *
 * `undefined` filters are dropped by the query builder rather than sent as the string
 * "undefined", which the API's validation pipe would reject.
 */
export function listParticipations(
  query: ListParticipationsQuery = {}
): Promise<Paginated<AdminParticipationDto>> {
  return authed<Paginated<AdminParticipationDto>>('/participations', {
    query: {
      q: query.q,
      status: query.status,
      prizeId: query.prizeId,
      page: query.page,
      pageSize: query.pageSize,
    },
  });
}

export function getStats(): Promise<StatsDto> {
  return authed<StatsDto>('/admin/stats');
}

export function getMailingRows(): Promise<MailingExportRow[]> {
  return authed<MailingExportRow[]>('/admin/export/mailing', { query: { format: 'json' } });
}

export async function getMailingCsv(): Promise<string> {
  return apiFetchText('/admin/export/mailing', {
    cookie: await sessionCookie(),
    query: { format: 'csv' },
  });
}

export function getDraw(): Promise<DrawDto | null> {
  return authed<DrawDto | null>('/admin/draw');
}

export function executeDraw(): Promise<DrawDto> {
  return authed<DrawDto>('/admin/draw', { method: 'POST' });
}

export function verifyDraw(id: string): Promise<{
  fingerprintMatches: boolean;
  winnerMatches: boolean;
  recomputedWinnerId: string | null;
}> {
  return authed(`/admin/draw/${id}/verify`);
}
