/** Back-office contracts: statistics, mailing export, grand prize draw. */

import type { AuthProvider, Gender, PrizeStatus } from '../enums';

/**
 * Administrator dashboard. Covers, word for word, the statistics the brief lists:
 * "number of tickets supplied, number of tickets used, number of prizes already won,
 * statistics on winners in terms of gender, age, etc."
 */
export interface StatsDto {
  /** Codes generated in the database, i.e. 500,000. */
  codesIssued: number;
  /** Codes printed on a receipt by a till or by the e-commerce site. */
  codesDispensed: number;
  /** Codes moved to `USED`, i.e. actually played. */
  codesUsed: number;
  /** Distinct participants, not participations: this is the pool the grand prize draws from. */
  participants: number;
  prizesRedeemed: number;
  prizesExpired: number;
  /** Size of the opt-in mailing base, which feeds the export. */
  marketingOptIn: number;
  byPrize: Array<{ prizeId: string; prizeLabel: string; won: number; redeemed: number }>;
  byGender: Array<{ gender: Gender; count: number }>;
  byAgeRange: Array<{ range: AgeRange; count: number }>;
  byStore: Array<{ storeId: string; storeName: string; codesUsed: number }>;
  dailyParticipations: Array<{ day: string; count: number }>;
  /** When the aggregates were computed: they are cached in Redis for a few minutes. */
  computedAt: string;
}

/**
 * Dashboard age brackets. Frozen in the shared contract so the API and the back-office
 * chart cannot drift apart on the boundaries.
 */
export type AgeRange = '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';
export const AGE_RANGES = [
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55-64',
  '65+',
] as const satisfies readonly AgeRange[];

/** Bounds of each bracket, used by the aggregation query and by the tests. */
export const AGE_RANGE_BOUNDS: Record<AgeRange, { min: number; max: number | null }> = {
  '18-24': { min: 18, max: 24 },
  '25-34': { min: 25, max: 34 },
  '35-44': { min: 35, max: 44 },
  '45-54': { min: 45, max: 54 },
  '55-64': { min: 55, max: 64 },
  '65+': { min: 65, max: null },
};

/**
 * One row of the mailing export.
 *
 * Contains ONLY customers who gave explicit marketing consent. GDPR minimisation forbids
 * pouring the rest of the profile in: no phone number, no exact birth date, no postcode.
 */
export interface MailingExportRow {
  email: string;
  firstName: string;
  lastName: string;
  consentedAt: string;
  /** An aggregate that is useful for targeting without exposing the birth date. */
  ageRange: AgeRange | 'inconnu';
  participationCount: number;
}

export type ExportFormat = 'csv' | 'json';

/** Result of the grand prize draw. */
export interface DrawDto {
  id: string;
  contestId: string;
  executedAt: string;
  /** Distinct participants entered into the draw. */
  participantCount: number;
  /** PRNG seed, retained so the draw can be replayed in front of the bailiff. */
  seed: string;
  /** SHA-256 fingerprint of the ordered participant list at draw time. */
  participantsFingerprint: string;
  winner: { id: string; firstName: string; lastName: string; email: string } | null;
  bailiffName: string | null;
}

/**
 * Why a draw is refused. Running the draw is not a harmless action: it is unique,
 * irreversible and overseen by a bailiff.
 */
export type DrawRefusal = 'CONTEST_NOT_CLOSED' | 'ALREADY_DRAWN' | 'NO_PARTICIPANT';

/* ------------------------------------------------------- participant listing */

/**
 * Page of results.
 *
 * Generic and declared once: the participant list is the only paginated endpoint today,
 * but it is also the only one that can grow without bound — 500,000 codes means up to
 * 500,000 participations, and an endpoint that returns them all is an endpoint that
 * eventually times out.
 */
export interface Paginated<T> {
  items: T[];
  /** Total matching rows, so the UI can show "page 3 of altogether 412". */
  total: number;
  page: number;
  pageSize: number;
}

/**
 * A participation as the administrator's list shows it: the participation plus who played
 * it.
 *
 * The customer block is deliberately minimal. An administrator listing participations
 * needs to identify a person and contact them; they do not need the birth date, the
 * postcode or the marketing preference, and GDPR minimisation applies to an internal
 * screen exactly as it does to an export.
 */
export interface AdminParticipationDto {
  id: string;
  ticketCode: string;
  prizeId: string;
  prizeLabel: string;
  prizeStatus: PrizeStatus;
  claimDeadline: string;
  createdAt: string;
  redeemedAt: string | null;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    provider: AuthProvider;
  };
}

/** Filters of `GET /v1/participations`. All optional; an empty query lists everything. */
export interface ListParticipationsQuery {
  /** Free text over customer name, email, or an exact ticket code. */
  q?: string;
  status?: PrizeStatus;
  prizeId?: string;
  /** 1-based. */
  page?: number;
  pageSize?: number;
}

/** Page size cap. Above this, a single response becomes slower than a second request. */
export const PARTICIPATIONS_MAX_PAGE_SIZE = 100;
export const PARTICIPATIONS_DEFAULT_PAGE_SIZE = 25;
