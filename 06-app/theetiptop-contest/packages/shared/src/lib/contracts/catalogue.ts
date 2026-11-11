/**
 * Catalogue contracts: contest, prizes, stores.
 *
 * Every date travels as an ISO 8601 string: that is what the API's JSON serialisation
 * produces, and what the front ends' formatting helpers (`formatDate`, `formatDateTime`)
 * already consume. No implicit conversion anywhere.
 */

import type { PrizeType } from '../enums';

export interface ContestDto {
  id: string;
  name: string;
  slug: string;
  /** Opening day. */
  startsAt: string;
  /** Entries close, i.e. opening + 30 days. */
  endsAt: string;
  /** End of the claim window, i.e. closing + 30 days. */
  claimDeadline: string;
  minimumPurchaseCents: number;
  plannedCodeCount: number;
  codeLength: number;
  bailiffName: string | null;
  rulesUrl: string | null;
  rulesFiledAt: string | null;
  /** Computed by the API: `startsAt <= now <= endsAt`. Keeps each front from redoing it. */
  isOpen: boolean;
}

export interface PrizeDto {
  id: string;
  label: string;
  description: string | null;
  type: PrizeType;
  valueCents: number;
  /** Target share of the split, e.g. 60 for the tea infuser. `null` for the grand prize. */
  targetPercentage: number | null;
  targetQuantity: number | null;
  rank: number;
}

export interface StoreDto {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string | null;
  openedAt: string | null;
  /** True for the 10th store, the Nice one, whose opening is the reason for the contest. */
  isNew: boolean;
}
