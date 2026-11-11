'use server';

import { revalidatePath } from 'next/cache';
import type { CustomerSearchResultDto, RedemptionChannel } from '@theetiptop-contest/shared';
import { ApiError, redeemPrize, searchCustomers } from '@theetiptop-contest/api-client/server';

export type SearchActionResult =
  | { ok: true; customers: CustomerSearchResultDto[] }
  | { ok: false; message: string };

/**
 * Customer search for the in-store screen.
 *
 * A server action rather than a client `fetch`: the call needs the employee's session and
 * the internal API address, and the search itself runs against the `pg_trgm` indexes on
 * the API side. The employee has a customer standing in front of them, so the round trip
 * has to be one hop, not two.
 */
export async function searchCustomersAction(query: string): Promise<SearchActionResult> {
  try {
    return { ok: true, customers: await searchCustomers(query) };
  } catch (error) {
    if (ApiError.is(error) && error.status === 401) {
      return { ok: false, message: 'Votre session a expiré. Reconnectez-vous.' };
    }

    return {
      ok: false,
      message: ApiError.is(error) ? error.message : 'La recherche a échoué.',
    };
  }
}

export type RedeemActionResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

/**
 * Records the handover of a prize.
 *
 * Every refusal code is relayed rather than flattened into one message: `ALREADY_REDEEMED`
 * and `CLAIM_WINDOW_CLOSED` are both 409 and need the employee to do two different things
 * — one is "somebody already gave it to them", the other is "the deadline has passed".
 */
export async function redeemPrizeAction(
  participationId: string,
  channel: RedemptionChannel = 'IN_STORE'
): Promise<RedeemActionResult> {
  try {
    await redeemPrize({ participationId, channel });

    // The customer's file and the dashboard figures both just changed.
    revalidatePath('/employe');
    revalidatePath('/admin');
    return { ok: true };
  } catch (error) {
    if (ApiError.is(error)) {
      return { ok: false, code: error.code, message: error.message };
    }

    return {
      ok: false,
      code: 'UNKNOWN',
      message: 'La remise n’a pas pu être enregistrée. Réessayez dans un instant.',
    };
  }
}
