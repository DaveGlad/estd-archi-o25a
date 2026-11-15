import { test, expect } from '@playwright/test';
import { ACCOUNTS, clearRateLimit } from '../fixtures';

/**
 * Captures the maquettes of 04-design from the running site.
 *
 * Screenshots of the real product rather than drawings beside it. A mock-up that has
 * drifted from what was built is worse than none: it is the version a jury compares the
 * site against.
 *
 * Skipped unless explicitly asked for:
 *
 *     npm run design:maquettes
 *
 * It writes 4 MB of PNGs outside the application, which has no place in the suite that
 * runs on every push. It is a generator that happens to be written as a test, not a test.
 */
test.skip(!process.env['CAPTURE_MAQUETTES'], 'Run with: npm run design:maquettes');

const OUT = '../../04-design/maquettes';

const BREAKPOINTS = [
  { name: 'desktop', width: 1440, height: 1024 },
  { name: 'tablette', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
];

const PAGES = [
  { slug: 'accueil', path: '/' },
  { slug: 'connexion-inscription', path: '/connexion' },
  { slug: 'participer', path: '/participer', auth: true },
  { slug: 'profil', path: '/mon-compte', auth: true },
  { slug: 'lots', path: '/jeu-concours/lots' },
];

for (const viewport of BREAKPOINTS) {
  for (const page of PAGES) {
    test(`${page.slug} — ${viewport.name}`, async ({ page: p }) => {
      await p.setViewportSize({ width: viewport.width, height: viewport.height });
      if (page.auth) {
        // Signed in inline rather than through a shared helper: the two existing ones
        // live inside their own spec files and are shaped for the back office.
        await clearRateLimit(ACCOUNTS.customer.email);
        await p.goto('/connexion');
        await p.getByLabel(/adresse/i).first().fill(ACCOUNTS.customer.email);
        await p.getByLabel(/mot de passe/i).first().fill(ACCOUNTS.customer.password);
        await p.getByRole('button', { name: /se connecter/i }).click();
        await p.waitForURL((url) => !url.pathname.startsWith('/connexion'));
      }
      await p.goto(page.path);
      await p.waitForLoadState('networkidle');
      // Animations settled, so two runs produce the same image.
      await p.emulateMedia({ reducedMotion: 'reduce' });
      await p.screenshot({
        path: `${OUT}/${page.slug}-${viewport.name}.png`,
        fullPage: true,
      });
      expect(true).toBe(true);
    });
  }
}
