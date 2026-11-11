'use server';

import { revalidatePath } from 'next/cache';
import type { DrawDto } from '@theetiptop-contest/shared';
import { ApiError, executeDraw, verifyDraw } from '@theetiptop-contest/api-client/server';

export type DrawActionResult =
  | { ok: true; draw: DrawDto }
  | { ok: false; code: string; message: string };

/**
 * Runs the grand prize draw.
 *
 * The decision itself is entirely server-side, in the API: the pool is
 * `SELECT DISTINCT userId`, the seed comes from the OS CSPRNG, and the winner is picked
 * there. This action only triggers it and relays the refusal reasons, which are what the
 * screen needs in order to explain itself — `CONTEST_NOT_CLOSED` and `ALREADY_DRAWN` are
 * both 409 and need very different copy.
 */
export async function executeDrawAction(): Promise<DrawActionResult> {
  try {
    const draw = await executeDraw();
    revalidatePath('/admin/tirage');
    revalidatePath('/admin');
    return { ok: true, draw };
  } catch (error) {
    if (ApiError.is(error)) {
      return { ok: false, code: error.code, message: error.message };
    }

    return {
      ok: false,
      code: 'UNKNOWN',
      message: 'Le tirage n’a pas pu être lancé. Vérifiez l’état de l’API et réessayez.',
    };
  }
}

export type VerifyActionResult =
  | { ok: true; fingerprintMatches: boolean; winnerMatches: boolean }
  | { ok: false; message: string };

/**
 * Replays a recorded draw from its stored seed and checks it lands on the same winner.
 *
 * This is the button the bailiff presses. It turns "verifiable" into a procedure rather
 * than a claim.
 */
export async function verifyDrawAction(drawId: string): Promise<VerifyActionResult> {
  try {
    const result = await verifyDraw(drawId);
    return {
      ok: true,
      fingerprintMatches: result.fingerprintMatches,
      winnerMatches: result.winnerMatches,
    };
  } catch (error) {
    return {
      ok: false,
      message: ApiError.is(error)
        ? error.message
        : 'La vérification n’a pas pu être effectuée.',
    };
  }
}
