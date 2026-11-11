/**
 * Environment validation, run once at boot.
 *
 * The API refuses to start on an incomplete configuration rather than failing later on
 * the first request that needs a missing secret. In a pipeline that deploys to three
 * environments this is the difference between a build that fails loudly and a production
 * container that comes up half broken.
 */

import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(3333),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  /// Comma separated list. Only the public site and the back office may call the API
  /// from a browser; the tills use an API key and are not subject to CORS.
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3001'),

  // --- Better Auth -------------------------------------------------------------
  // 32 characters minimum: this secret signs the session cookies. A short secret is a
  // session forgery away from an administrator account.
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.url('BETTER_AUTH_URL must be an absolute URL'),

  /**
   * Parent domain the session cookie is scoped to, e.g. `.dsp5-archi-o25a-15m-g1.fr`.
   *
   * Empty in development, and that is correct there: everything runs on `localhost`, and a
   * cookie is scoped by HOST, not by port, so `localhost:3333` setting it makes
   * `localhost:3000` and `localhost:3001` send it back.
   *
   * It stops being correct the moment the three pieces live on three subdomains. A cookie
   * set by `api.example.fr` with no Domain attribute is host-only: `www.example.fr` would
   * never send it, and every API call from the site would come back 401. Setting the parent
   * domain is what lets one session serve the public site, the back office and the API.
   */
  COOKIE_DOMAIN: z.string().optional(),

  // Optional: the OAuth providers are only registered when their pair is complete, so a
  // developer without Google credentials still gets a working API, with the form login.
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),

  // --- Security ----------------------------------------------------------------
  /// Salt for hashing participation IP addresses. Without a salt, a SHA-256 of an IPv4
  /// address is trivially reversible: the whole space is 4 billion values.
  IP_HASH_SALT: z.string().min(16, 'IP_HASH_SALT must be at least 16 characters'),

  /// `name:key` pairs, comma separated. One key per non-browser consumer.
  POS_API_KEYS: z.string().default(''),

  /// Public URL of the site, printed on receipts next to the code.
  PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * Validated configuration, shaped for injection. Grouped by concern rather than left as
 * a flat bag of env vars: `config.get('auth.googleClientId')` reads better than
 * `config.get('GOOGLE_CLIENT_ID')` and keeps the env var names in this one file.
 */
export interface AppConfig {
  nodeEnv: Env['NODE_ENV'];
  isProduction: boolean;
  port: number;
  corsOrigins: string[];
  database: { url: string };
  redis: { url: string };
  auth: {
    secret: string;
    baseUrl: string;
    /** `null` in development, where everything shares the `localhost` host. */
    cookieDomain: string | null;
    google: { clientId: string; clientSecret: string } | null;
    facebook: { clientId: string; clientSecret: string } | null;
  };
  security: {
    ipHashSalt: string;
    /** Consumer name, keyed by API key, so a lookup is O(1) and the name lands in the audit log. */
    posApiKeys: ReadonlyMap<string, string>;
  };
  publicSiteUrl: string;
}

/**
 * Parses `POS_API_KEYS` ("tills:abc,ecommerce:def") into a key -> consumer-name map.
 * Malformed entries are dropped rather than silently treated as a valid key.
 */
function parsePosApiKeys(raw: string): ReadonlyMap<string, string> {
  const entries = raw
    .split(',')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const separator = pair.indexOf(':');
      if (separator <= 0) return null;
      const name = pair.slice(0, separator).trim();
      const key = pair.slice(separator + 1).trim();
      return name && key ? ([key, name] as const) : null;
    })
    .filter((entry): entry is readonly [string, string] => entry !== null);

  return new Map(entries);
}

export function loadConfig(): AppConfig {
  const parsed = EnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  const env = parsed.data;

  return {
    nodeEnv: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    port: env.API_PORT,
    corsOrigins: env.CORS_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    database: { url: env.DATABASE_URL },
    redis: { url: env.REDIS_URL },
    auth: {
      secret: env.BETTER_AUTH_SECRET,
      baseUrl: env.BETTER_AUTH_URL,
      cookieDomain: env.COOKIE_DOMAIN?.trim() || null,
      google:
        env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
          ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }
          : null,
      facebook:
        env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET
          ? { clientId: env.FACEBOOK_CLIENT_ID, clientSecret: env.FACEBOOK_CLIENT_SECRET }
          : null,
    },
    security: {
      ipHashSalt: env.IP_HASH_SALT,
      posApiKeys: parsePosApiKeys(env.POS_API_KEYS),
    },
    publicSiteUrl: env.PUBLIC_SITE_URL,
  };
}

/** Injection token for the whole config object. */
export const APP_CONFIG = 'APP_CONFIG';
