'use server';

import type { Gender, RegisterInput } from '@theetiptop-contest/shared';
import { ApiError, registerUser } from '@theetiptop-contest/api-client/server';

export type RegisterActionResult =
  | { ok: true }
  | { ok: false; message: string; code?: string };

/**
 * Creates a customer account.
 *
 * Goes through `POST /v1/users/register` rather than Better Auth's own `sign-up/email`,
 * because three rules have to be enforced server-side that the library knows nothing
 * about: the contest is for adults only, accepting the rules is mandatory, and the consent
 * timestamps are the only enforceable proof and must therefore be stamped by the server.
 *
 * It does **not** open the session. The API does return a valid session cookie — which is
 * right for an API consumer that is not a browser — but this action discards it and the
 * client signs in immediately afterwards with the credentials it already holds. Relaying a
 * third-party `Set-Cookie` through a server action means parsing and re-emitting its
 * attributes by hand, and getting `HttpOnly`, `SameSite` or `Max-Age` subtly wrong there is
 * a security bug rather than a cosmetic one. The cost of the alternative is one session row
 * that nobody uses and that expires on its own.
 */
export async function registerAction(formData: FormData): Promise<RegisterActionResult> {
  const text = (name: string): string => String(formData.get(name) ?? '').trim();
  const checked = (name: string): boolean => formData.get(name) === 'on' || formData.get(name) === 'true';

  const optional = (name: string): string | undefined => {
    const value = text(name);
    return value === '' ? undefined : value;
  };

  const input: RegisterInput = {
    email: text('email'),
    password: String(formData.get('password') ?? ''),
    firstName: text('firstName'),
    lastName: text('lastName'),
    gender: (text('gender') || 'UNDISCLOSED') as Gender,
    birthDate: text('birthDate'),
    postalCode: optional('postalCode'),
    phone: optional('phone'),
    acceptContestRules: checked('rules'),
    acceptTerms: checked('rules'),
    marketingConsent: checked('marketing'),
  };

  try {
    await registerUser(input);
    return { ok: true };
  } catch (error) {
    if (ApiError.is(error)) {
      // The API's validation messages are written for a human and already in French.
      const validation = error.details?.['validation'];
      if (Array.isArray(validation) && validation.length > 0) {
        return { ok: false, message: String(validation[0]), code: error.code };
      }
      return { ok: false, message: error.message, code: error.code };
    }

    return {
      ok: false,
      message: 'La création du compte a échoué. Merci de réessayer dans un instant.',
    };
  }
}
