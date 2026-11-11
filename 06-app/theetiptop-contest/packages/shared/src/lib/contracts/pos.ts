/**
 * Contracts for the non-browser consumers of API v1: the tills of the 10 stores and the
 * future e-commerce site, which another agency will build.
 *
 * This is the whole reason the API is a versioned, Swagger-documented REST API: it serves
 * three consumers, two of which we do not write. Those two authenticate with an API key,
 * never with a session.
 *
 * ⚠️ Design rule to defend at the oral: the dispense response NEVER reveals the prize
 * attached to the code. The till has no business knowing it, and the customer must
 * discover it on the site. A compromised till therefore cannot sort the winning tickets.
 */

/** Payload of `POST /v1/pos/codes/dispense`. */
export interface DispenseCodeInput {
  /** Store printing the receipt. Absent for the e-commerce site, which sends `channel: 'ONLINE'`. */
  storeId?: string;
  /** Receipt or invoice amount, in cents. Refused below 4,900. */
  purchaseAmountCents: number;
  /** Receipt or order reference, for accounting reconciliation. */
  reference?: string;
  channel: 'IN_STORE' | 'ONLINE';
}

export interface DispenseCodeResult {
  /** The code to print at the bottom of the receipt, 10 characters. */
  code: string;
  dispensedAt: string;
  /** Echoed back so the till can print it under the code. */
  claimUrl: string;
  contestEndsAt: string;
}

/** Why a code dispense is refused. */
export type DispenseRefusal =
  | 'CONTEST_CLOSED'
  | 'AMOUNT_BELOW_THRESHOLD'
  | 'UNKNOWN_STORE'
  | 'CODE_POOL_EXHAUSTED';

/** Payload of `POST /v1/pos/codes/void`: receipt cancelled, code never handed to the customer. */
export interface VoidCodeInput {
  code: string;
  reason: string;
}

/**
 * `GET /v1/pos/contest`: what a till needs in order to decide on its own whether to print
 * a code, without hard-coding the contest rules.
 */
export interface PosContestInfo {
  name: string;
  isOpen: boolean;
  startsAt: string;
  endsAt: string;
  minimumPurchaseCents: number;
  codeLength: number;
  /** Codes still available to dispense. Lets the operator anticipate pool exhaustion. */
  codesRemaining: number;
}
