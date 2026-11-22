import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { loadConfig } from './env';

/**
 * The `Secure` attribute on the session cookie.
 *
 * Worth its own test because both ways of getting it wrong are silent. A production
 * environment that loses the attribute leaks a replayable session to anyone on the path,
 * and nothing in any log says so. An environment served over plain http that keeps it has
 * its cookie dropped by the browser with no error at all: sign-in returns 200 and the very
 * next request is a 401, which reads like a broken password rather than a cookie that never
 * arrived. That exact failure cost an afternoon on the dev environment.
 */

const REQUIRED = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  REDIS_URL: 'redis://localhost:6379',
  BETTER_AUTH_SECRET: 'x'.repeat(32),
  BETTER_AUTH_URL: 'http://localhost:3333',
  IP_HASH_SALT: 'y'.repeat(32),
};

describe('loadConfig', () => {
  let original: NodeJS.ProcessEnv;

  beforeEach(() => {
    original = process.env;
    // A fresh object rather than a mutated one: the ambient environment of the test runner
    // carries a NODE_ENV and a DATABASE_URL of its own, and either would decide the result.
    process.env = { ...REQUIRED } as NodeJS.ProcessEnv;
  });

  afterEach(() => {
    process.env = original;
  });

  describe('auth.secureCookies', () => {
    it('follows NODE_ENV when AUTH_SECURE_COOKIES is absent', () => {
      process.env['NODE_ENV'] = 'production';
      expect(loadConfig().auth.secureCookies).toBe(true);

      process.env['NODE_ENV'] = 'development';
      expect(loadConfig().auth.secureCookies).toBe(false);
    });

    it('treats an empty value as absent', () => {
      // `.env.example` ships the key with no value, and dotenv passes that through as an
      // empty string. The documented file has to validate.
      process.env['NODE_ENV'] = 'production';
      process.env['AUTH_SECURE_COOKIES'] = '';
      expect(loadConfig().auth.secureCookies).toBe(true);
    });

    it('lets a production build opt out, for an environment served over http', () => {
      process.env['NODE_ENV'] = 'production';
      process.env['AUTH_SECURE_COOKIES'] = 'false';
      expect(loadConfig().auth.secureCookies).toBe(false);
    });

    it('rejects a value that is neither true nor false', () => {
      // `AUTH_SECURE_COOKIES=0` read as falsy would silently unsecure a production cookie.
      // Refusing to boot is the only safe reading of a typo in this particular setting.
      process.env['AUTH_SECURE_COOKIES'] = '0';
      expect(() => loadConfig()).toThrow(/AUTH_SECURE_COOKIES/);
    });
  });

  describe('auth.cookieDomain', () => {
    it('is null when the variable is empty or whitespace', () => {
      process.env['COOKIE_DOMAIN'] = '   ';
      expect(loadConfig().auth.cookieDomain).toBeNull();
    });

    it('is kept as given when a parent domain is set', () => {
      process.env['COOKIE_DOMAIN'] = '.dsp5-archi-o25a-15m-g3.fr';
      expect(loadConfig().auth.cookieDomain).toBe('.dsp5-archi-o25a-15m-g3.fr');
    });
  });
});
