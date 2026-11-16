/** Contracts for the heart of the contest: playing a code, listing prizes, handing one over. */

import type { PrizeStatus, RedemptionChannel } from '../enums';
import type { PrizeDto } from './catalogue';

export interface RedemptionDto {
  id: string;
  /** Name of the employee who handed the prize over. Traceability in case of dispute. */
  issuedByName: string;
  storeId: string | null;
  storeName: string | null;
  channel: RedemptionChannel;
  issuedAt: string;
}

export interface ParticipationDto {
  id: string;
  userId: string;
  ticketCode: string;
  prize: PrizeDto;
  prizeStatus: PrizeStatus;
  claimDeadline: string;
  createdAt: string;
  redemption: RedemptionDto | null;
}

/** Payload of `POST /v1/participations`. */
export interface SubmitCodeInput {
  /** 10 alphanumeric characters. Normalised to uppercase by the API before any check. */
  code: string;
}

/**
 * Possible outcomes of submitting a code, use case UC-01.
 *
 * A discriminated union rather than an "HTTP status + message" pair: each branch carries
 * exactly the data the screen needs to render its message, and the compiler guarantees no
 * branch is forgotten on the front end. This type is a faithful copy of the one
 * `apps/web` was mocked against.
 */
export type SubmitCodeOutcome =
  | 'WON'
  | 'INVALID_FORMAT'
  | 'UNKNOWN_CODE'
  | 'ALREADY_USED'
  | 'CONTEST_CLOSED'
  | 'RATE_LIMITED';

export type SubmitCodeResult =
  | { outcome: 'WON'; participation: ParticipationDto; prize: PrizeDto }
  | { outcome: 'INVALID_FORMAT' }
  | { outcome: 'UNKNOWN_CODE' }
  | { outcome: 'ALREADY_USED'; usedAt: string; byCurrentUser: boolean }
  | {
      outcome: 'CONTEST_CLOSED';
      /** When ticket distribution stopped. */
      endsAt: string;
      /** When the right to play a code expired: 30 days after `endsAt`. */
      claimDeadline: string;
    }
  | { outcome: 'RATE_LIMITED'; retryInMinutes: number };

/** Customer record as the in-store employee sees it, for handing prizes over. */
export interface CustomerSearchResultDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Number of prizes still to hand over. This is what triggers the employee's action. */
  prizesToClaim: number;
  participations: ParticipationDto[];
}

/** Payload for an employee handing a prize over. */
export interface RedeemPrizeInput {
  participationId: string;
  channel: RedemptionChannel;
  /** Required when `channel = IN_STORE`. Defaults to the employee's own store if omitted. */
  storeId?: string;
  note?: string;
}
