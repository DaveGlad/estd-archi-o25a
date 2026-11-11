'use client';

/**
 * Browser-side authentication client.
 *
 * Better Auth's own client, pointed at the API. It is what runs the three sign-in paths
 * the brief mandates: the classic form, Google OAuth and Facebook OAuth.
 *
 * Why the OAuth flows go through this client rather than through a server action: the
 * provider dances end on a full-page redirect back to a callback URL, and that redirect
 * has to be initiated by the browser. A server action could not perform it.
 *
 * Sign-UP by form is the exception — it goes to our own `POST /v1/users/register` instead
 * of Better Auth's `sign-up/email`, because three rules have to be enforced server-side
 * that the library knows nothing about: the contest is for adults only, accepting the
 * rules is mandatory, and the consent timestamps must be stamped by the server.
 */

import { createAuthClient } from 'better-auth/react';

/**
 * The public API address, baked into the bundle at build time.
 *
 * Not `API_URL`: that one is the internal Docker service name, which resolves inside the
 * compose network and nowhere else. Handing it to a browser would produce a client that
 * works in development and fails in every deployed environment.
 */
const baseURL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3333';

export const authClient = createAuthClient({ baseURL });

export const { signIn, signOut, useSession, getSession } = authClient;

/** The two providers the client named. Listed as data so the buttons cannot drift apart. */
export const SOCIAL_PROVIDERS = [
  { id: 'google', label: 'Google' },
  { id: 'facebook', label: 'Facebook' },
] as const;

export type SocialProviderId = (typeof SOCIAL_PROVIDERS)[number]['id'];

/**
 * Starts an OAuth sign-in.
 *
 * `callbackURL` is where the provider sends the visitor back. It is passed through rather
 * than hard-coded so a visitor who was asked to sign in from the code-entry page lands
 * back on it, and not on a generic home page having lost what they were doing.
 */
export async function signInWithProvider(
  provider: SocialProviderId,
  callbackURL = '/mon-compte'
): Promise<void> {
  await signIn.social({ provider, callbackURL });
}

/** Signs in with email and password, and reports the failure reason for the form to show. */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const result = await signIn.email({ email, password });

  if (result.error) {
    return {
      ok: false,
      // Deliberately not distinguishing "unknown email" from "wrong password": telling an
      // attacker which of the two it was turns the login form into an account enumeration
      // oracle.
      message: 'Adresse électronique ou mot de passe incorrect.',
    };
  }

  return { ok: true };
}
