/**
 * Front-end types mirroring prisma/schema.
 * The front is built against mocks first: every screen must render without an API.
 */

export type Role = 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNDISCLOSED';
export type CodeStatus = 'AVAILABLE' | 'USED' | 'VOIDED';
export type PrizeStatus = 'TO_CLAIM' | 'REDEEMED' | 'EXPIRED';
export type RedemptionChannel = 'IN_STORE' | 'ONLINE';
export type PrizeType = 'TICKET_PRIZE' | 'GRAND_PRIZE';

export interface Contest {
  id: string;
  name: string;
  slug: string;
  startsAt: string;
  endsAt: string;
  claimDeadline: string;
  minimumPurchaseCents: number;
  plannedCodeCount: number;
  codeLength: number;
  bailiffName: string;
  rulesFiledAt: string;
}

export interface Prize {
  id: string;
  label: string;
  description: string;
  type: PrizeType;
  valueCents: number;
  targetPercentage: number | null;
  targetQuantity: number | null;
  rank: number;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  openedAt: string;
  isNew?: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  gender: Gender;
  birthDate: string | null;
  postalCode: string | null;
  phone: string | null;
  marketingConsent: boolean;
  marketingConsentAt: string | null;
  contestRulesAcceptedAt: string | null;
  createdAt: string;
  storeId?: string;
  provider: 'credential' | 'google' | 'facebook';
}

export interface TicketCode {
  code: string;
  prizeId: string;
  status: CodeStatus;
  usedAt: string | null;
}

export interface Participation {
  id: string;
  userId: string;
  ticketCode: string;
  prizeId: string;
  prizeStatus: PrizeStatus;
  claimDeadline: string;
  createdAt: string;
  redemption?: Redemption;
}

export interface Redemption {
  id: string;
  issuedByName: string;
  storeId: string | null;
  channel: RedemptionChannel;
  issuedAt: string;
}

/** Result of submitting a code, mirrors the API contract of UC-01. */
export type SubmitCodeResult =
  | { outcome: 'WON'; participation: Participation; prize: Prize }
  | { outcome: 'INVALID_FORMAT' }
  | { outcome: 'UNKNOWN_CODE' }
  | { outcome: 'ALREADY_USED'; usedAt: string; byCurrentUser: boolean }
  | { outcome: 'CONTEST_CLOSED'; endsAt: string }
  | { outcome: 'RATE_LIMITED'; retryInMinutes: number };
