/**
 * Domain enumerations, mirroring `prisma/schema/base.prisma`.
 *
 * Deliberately declared as string literal unions rather than TypeScript `enum`s:
 * the Next.js front ends consume this package from server AND client components,
 * and a TS `enum` emits runtime code, which inflates the client bundle for a value
 * that is never anything but a string. The `*_VALUES` arrays cover the cases that
 * genuinely need iteration (back-office select inputs, DTO validation).
 */

/** The three profiles the brief requires: the customer who plays, the employee who hands over the prize, the administrator. */
export type Role = 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
export const ROLE_VALUES = ['CUSTOMER', 'EMPLOYEE', 'ADMIN'] as const satisfies readonly Role[];

/** Collected for the single "breakdown of winners by gender" statistic the back office requires. */
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNDISCLOSED';
export const GENDER_VALUES = [
  'MALE',
  'FEMALE',
  'OTHER',
  'UNDISCLOSED',
] as const satisfies readonly Gender[];

/**
 * Lifecycle of a code printed on a receipt.
 *
 * AVAILABLE  -> generated, not yet handed to anybody
 * DISPENSED  -> printed on a receipt by a till or by the future e-commerce site
 * USED       -> played on the site, a Participation exists
 * VOIDED     -> receipt cancelled, the code must never be playable
 */
export type CodeStatus = 'AVAILABLE' | 'DISPENSED' | 'USED' | 'VOIDED';
export const CODE_STATUS_VALUES = [
  'AVAILABLE',
  'DISPENSED',
  'USED',
  'VOIDED',
] as const satisfies readonly CodeStatus[];

/**
 * Statuses a customer is allowed to play.
 *
 * DISPENSED is the nominal case. AVAILABLE is accepted on purpose: a till outage
 * that failed to call the API must never stop a customer who holds a valid printed
 * code from playing. Business rule to defend at the oral.
 */
export const PLAYABLE_CODE_STATUSES = [
  'AVAILABLE',
  'DISPENSED',
] as const satisfies readonly CodeStatus[];

/** Lifecycle of the prize attached to a participation. */
export type PrizeStatus = 'TO_CLAIM' | 'REDEEMED' | 'EXPIRED';
export const PRIZE_STATUS_VALUES = [
  'TO_CLAIM',
  'REDEEMED',
  'EXPIRED',
] as const satisfies readonly PrizeStatus[];

/** The brief allows the prize to be claimed "in store or online". */
export type RedemptionChannel = 'IN_STORE' | 'ONLINE';
export const REDEMPTION_CHANNEL_VALUES = [
  'IN_STORE',
  'ONLINE',
] as const satisfies readonly RedemptionChannel[];

/**
 * `TICKET_PRIZE`: the 5 prizes spread over the 500,000 codes (60/20/10/6/4%).
 * `GRAND_PRIZE` : the year of tea, drawn at closing time, outside the codes.
 */
export type PrizeType = 'TICKET_PRIZE' | 'GRAND_PRIZE';
export const PRIZE_TYPE_VALUES = [
  'TICKET_PRIZE',
  'GRAND_PRIZE',
] as const satisfies readonly PrizeType[];

/** Sign-up methods mandated by the brief: classic form, Google, Facebook. */
export type AuthProvider = 'credential' | 'google' | 'facebook';
export const AUTH_PROVIDER_VALUES = [
  'credential',
  'google',
  'facebook',
] as const satisfies readonly AuthProvider[];
