/**
 * Better Auth instance.
 *
 * One library covers the three sign-up methods the brief mandates: classic form, Google
 * OAuth, Facebook OAuth (`DECISIONS.md` § 3). Writing three flows by hand — password
 * hashing, session rotation, two OAuth dances, CSRF on the callbacks — is where
 * home-grown authentication usually goes wrong.
 *
 * No `modelName` overrides below: Better Auth's default model names (`user`, `session`,
 * `account`, `verification`) are exactly the Prisma delegates our schema produces, since
 * the Prisma client exposes model `User` as `prisma.user`.
 */

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import type { AppConfig } from '../../config/env.js';
import type { PrismaService } from '../../infra/prisma/prisma.service.js';

/** A week. Long enough that a customer who plays a code every few days stays signed in. */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** Sliding window: the session is extended at most once a day, not on every request. */
const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24;

/**
 * 12 characters minimum.
 *
 * Above the 8 that are still common, and in line with the ANSSI recommendation for an
 * account protected by a password alone. Justified in the legality section of the
 * specification (part H), since it is a personal-data protection measure.
 */
const MIN_PASSWORD_LENGTH = 12;

/**
 * Splits a display name into first name and last name.
 *
 * Needed on the OAuth path only: Google and Facebook hand over a single `name` string,
 * whereas the back-office statistics and the in-store employee search both work on the
 * split form. The heuristic is deliberately crude — first token is the first name, the
 * rest is the last name — and the customer can correct it from their account page. There
 * is no reliable way to split an arbitrary name, and pretending otherwise would be worse.
 */
function splitDisplayName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return { firstName: 'Client', lastName: 'Thé Tip Top' };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };

  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export function createAuth(prisma: PrismaService, config: AppConfig) {
  /**
   * Providers are registered only when their credential pair is complete. A developer
   * without Google credentials still gets a working API with the form login, instead of a
   * boot failure — and the deployed environments, where both pairs are set by Jenkins,
   * get all three methods.
   */
  const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};
  if (config.auth.google) socialProviders.google = config.auth.google;
  if (config.auth.facebook) socialProviders.facebook = config.auth.facebook;

  return betterAuth({
    secret: config.auth.secret,
    baseURL: config.auth.baseUrl,
    // The public site and the back office; anything else is refused on the OAuth callbacks.
    trustedOrigins: config.corsOrigins,

    database: prismaAdapter(prisma, { provider: 'postgresql' }),

    emailAndPassword: {
      enabled: true,
      minPasswordLength: MIN_PASSWORD_LENGTH,
      // Left off deliberately: no transactional mail provider is in the stack, and the
      // brief does not ask for address verification. The column exists so switching this
      // on later is a configuration change, not a migration.
      requireEmailVerification: false,
    },

    socialProviders,

    user: {
      /**
       * Business fields carried alongside Better Auth's own.
       *
       * `input: false` on `role` is the important one: without it a crafted sign-up
       * payload could set `role: 'ADMIN'` and hand the attacker the back office. The
       * default is applied server-side and the field is rejected if it arrives from a
       * client. Same reasoning for the consent timestamps, which are the only enforceable
       * proof and must therefore be stamped by the server — see `UserService.register`.
       */
      additionalFields: {
        firstName: { type: 'string', required: false, input: true },
        lastName: { type: 'string', required: false, input: true },
        phone: { type: 'string', required: false, input: true },
        gender: { type: 'string', required: false, defaultValue: 'UNDISCLOSED', input: true },
        birthDate: { type: 'date', required: false, input: true },
        postalCode: { type: 'string', required: false, input: true },

        role: { type: 'string', required: false, defaultValue: 'CUSTOMER', input: false },
        storeId: { type: 'string', required: false, input: false },
        marketingConsent: { type: 'boolean', required: false, defaultValue: false, input: false },
        marketingConsentAt: { type: 'date', required: false, input: false },
        termsAcceptedAt: { type: 'date', required: false, input: false },
        contestRulesAcceptedAt: { type: 'date', required: false, input: false },
      },
    },

    session: {
      expiresIn: SESSION_MAX_AGE_SECONDS,
      updateAge: SESSION_UPDATE_AGE_SECONDS,
    },

    databaseHooks: {
      user: {
        create: {
          /**
           * Fills the gap between what a provider hands over and what the columns require.
           *
           * `firstName` and `lastName` are NOT NULL in the schema but unknown on the OAuth
           * path; `name` is required by Better Auth but absent from our own registration
           * contract. This hook runs inside the insert, so neither path can produce a row
           * that violates the schema.
           */
          before: async (user) => {
            const record = user as Record<string, unknown>;

            const displayName = typeof record['name'] === 'string' ? record['name'].trim() : '';
            const givenFirst =
              typeof record['firstName'] === 'string' ? record['firstName'].trim() : '';
            const givenLast =
              typeof record['lastName'] === 'string' ? record['lastName'].trim() : '';

            const derived = splitDisplayName(displayName);
            const firstName = givenFirst || derived.firstName;
            const lastName = givenLast || derived.lastName;

            return {
              data: {
                ...record,
                firstName,
                lastName,
                name: displayName || `${firstName} ${lastName}`,
              },
            };
          },
        },
      },
    },

    advanced: {
      // Cookies are only sent over HTTPS once deployed; relaxed in development so the
      // flow works on http://localhost without a self-signed certificate.
      useSecureCookies: config.isProduction,

      /**
       * One session across the three subdomains.
       *
       * The API, the public site and the back office are three deployments on three
       * hosts. A cookie set by `api.example.fr` with no Domain attribute is host-only,
       * so the site would never send it back and every authenticated call would 401.
       * Scoping it to the parent domain is what makes one sign-in serve all three.
       *
       * Off in development, where `localhost` is already the shared host — a cookie is
       * scoped by host and ignores the port.
       */
      ...(config.auth.cookieDomain
        ? {
            crossSubDomainCookies: {
              enabled: true,
              domain: config.auth.cookieDomain,
            },
          }
        : {}),

      defaultCookieAttributes: {
        httpOnly: true,
        // `lax` rather than `strict`: the OAuth callbacks arrive as a cross-site
        // navigation from Google or Facebook, and `strict` would withhold the cookie on
        // exactly that request, breaking both social sign-in flows.
        sameSite: 'lax',
      },
    },
  });
}

/** Concrete type of the instance, so the guards and controllers are not typed `any`. */
export type AuthInstance = ReturnType<typeof createAuth>;

/** Injection token for the Better Auth instance. */
export const AUTH_INSTANCE = 'AUTH_INSTANCE';

/** Base path Better Auth serves its own endpoints under. Excluded from the `/v1` prefix. */
export const AUTH_BASE_PATH = '/api/auth';
