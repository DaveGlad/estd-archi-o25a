'use server';

import { revalidatePath } from 'next/cache';
import type { SubmitCodeResult } from '@theetiptop-contest/shared';
import { ApiError, submitCode } from '@theetiptop-contest/api-client/server';

/**
 * Adds one branch to the API's own result union: the session died between loading the page
 * and submitting the form.
 *
 * It is a client-side concern rather than an outcome of use case UC-01, which is why it
 * lives here and not in `@theetiptop-contest/shared`: the API answers 401, and only the
 * front end has anywhere to send the visitor.
 */
export type SubmitCodeActionResult = SubmitCodeResult | { outcome: 'SESSION_EXPIRED' };

/**
 * Plays a code on behalf of the signed-in customer.
 *
 * A server action rather than a `fetch` from the client component, deliberately. The call
 * needs the session cookie and the internal API address; routing it through the server
 * means neither the API URL nor a CORS-credentialed cross-origin request ever exists in
 * the browser. It also keeps the one place that talks to the API server-side.
 */
export async function submitCodeAction(code: string): Promise<SubmitCodeActionResult> {
  try {
    const result = await submitCode(code);

    // A win creates a participation, so the two screens that list them are now stale.
    if (result.outcome === 'WON') {
      revalidatePath('/mon-compte');
      revalidatePath('/participer');
    }

    return result;
  } catch (error) {
    if (ApiError.is(error) && error.status === 401) {
      return { outcome: 'SESSION_EXPIRED' };
    }

    // Anything else is genuinely unexpected — the API is down, a 500. Rethrown so the
    // Next.js error boundary handles it rather than the form showing "invalid code" for
    // what is actually an outage.
    throw error;
  }
}
