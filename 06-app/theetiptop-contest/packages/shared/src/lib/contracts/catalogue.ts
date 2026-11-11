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
  /** Ticket distribution stops, i.e. opening + 30 days. Codes stay playable past it. */
  endsAt: string;
  /** Last day to play a code and claim a prize, i.e. closing + 30 days. */
  claimDeadline: string;
  /** Purchase threshold. A receipt must be STRICTLY above it to carry a code. */
  minimumPurchaseCents: number;
  plannedCodeCount: number;
  codeLength: number;
  bailiffName: string | null;
  rulesUrl: string | null;
  rulesFiledAt: string | null;
  /**
   * Tickets are still being handed out: `startsAt <= now <= endsAt`.
   *
   * This is the TILL window. It closes after 30 days, and after it no receipt carries a
   * new code.
   */
  isOpen: boolean;

  /**
   * Codes can still be played: `startsAt <= now <= claimDeadline`.
   *
   * This is the PLAYER window, and it is 30 days longer than the till window. The brief
   * is explicit: "Les joueurs auront les 30 jours du jeu concours ainsi que 30 jours
   * supplémentaires à compter de la date de clôture du jeu pour aller sur le site
   * internet afin tester le code de leur(s) ticket(s) et réclamer leur lot."
   *
   * Conflating the two would lock out every customer holding a receipt from the last day
   * of the contest, which is the opposite of what the rules promise them.
   *
   * Both flags are computed server-side: a visitor whose clock is a day off would
   * otherwise be told the game is over when it is not.
   */
  isPlayable: boolean;
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
