'use server';

import { revalidatePath } from 'next/cache';
import type { Gender, UpdateProfileInput } from '@theetiptop-contest/shared';
import {
  ApiError,
  anonymizeAccount,
  updateConsent,
  updateProfile,
} from '@theetiptop-contest/api-client/server';

/**
 * What a form action hands back to its client component.
 *
 * A result object rather than a thrown error: a validation failure is an ordinary outcome
 * of submitting a form, and the field has to be able to show it. Only genuine faults — the
 * API being down — are left to propagate to the error boundary.
 */
export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

/** Turns an API error into something worth showing a customer. */
function describe(error: unknown, fallback: string): ActionResult {
  if (ApiError.is(error)) {
    // The API's `message` is written for a human and is already in French; its `details`
    // carry the field-level validation messages when the pipe rejected the body.
    const validation = error.details?.['validation'];
    if (Array.isArray(validation) && validation.length > 0) {
      return { ok: false, message: String(validation[0]) };
    }
    return { ok: false, message: error.message };
  }

  return { ok: false, message: fallback };
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  // Empty strings mean "cleared", which the API expects as `null`; `undefined` would mean
  // "leave alone" and would make the field impossible to empty.
  const optional = (name: string): string | null => {
    const value = formData.get(name);
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
  };

  const required = (name: string): string | undefined => {
    const value = formData.get(name);
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
  };

  const input: UpdateProfileInput = {
    firstName: required('firstName'),
    lastName: required('lastName'),
    phone: optional('phone'),
    postalCode: optional('postalCode'),
    birthDate: optional('birthDate'),
    gender: (required('gender') as Gender | undefined) ?? undefined,
  };

  try {
    await updateProfile(input);
    revalidatePath('/mon-compte');
    revalidatePath('/mon-compte/informations');
    return { ok: true, message: 'Vos informations ont été enregistrées.' };
  } catch (error) {
    return describe(error, 'Vos informations n’ont pas pu être enregistrées.');
  }
}

export async function updateConsentAction(granted: boolean): Promise<ActionResult> {
  try {
    await updateConsent({ marketingConsent: granted });
    revalidatePath('/mon-compte/confidentialite');
    return {
      ok: true,
      message: granted
        ? 'Vous recevrez désormais nos communications.'
        : 'Vous ne recevrez plus de communications commerciales.',
    };
  } catch (error) {
    return describe(error, 'Votre choix n’a pas pu être enregistré.');
  }
}

/**
 * Anonymises the account. Irreversible.
 *
 * Deliberately not followed by a redirect inside the action: the sessions are revoked
 * server-side as part of the operation, and the client component is the one that knows
 * where to send the visitor and how to show them what happened first.
 */
export async function anonymizeAccountAction(): Promise<ActionResult> {
  try {
    await anonymizeAccount();
    return {
      ok: true,
      message: 'Votre compte a été anonymisé. Vous allez être déconnecté.',
    };
  } catch (error) {
    return describe(error, 'Votre compte n’a pas pu être supprimé.');
  }
}
