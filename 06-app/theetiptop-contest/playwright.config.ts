import { defineConfig, devices } from '@playwright/test';

/**
 * Functional (end-to-end) tests. The third of the four test families the brief requires,
 * next to unit, integration and performance.
 *
 * These drive a real browser against the real public site, the real back office and the
 * real API — no mocking anywhere. That is the point: the three deploy separately and talk
 * to each other over HTTP with a shared session cookie, and nothing short of a browser
 * exercises that path.
 *
 * Prerequisites, which the pipeline runs as earlier stages:
 *   docker compose -f ../../05-workflow/docker/compose.dev.yml up -d
 *   npm run db:migrate && npm run db:seed && npm run codes:generate
 *
 * The three servers are started by `webServer` below, so a bare `npm run test:e2e` works
 * from a clean checkout.
 */

const SITE_URL = process.env['E2E_SITE_URL'] ?? 'http://localhost:3000';
const ADMIN_URL = process.env['E2E_ADMIN_URL'] ?? 'http://localhost:3001';
const API_URL = process.env['E2E_API_URL'] ?? 'http://localhost:3333';

export default defineConfig({
  testDir: './e2e',
  // Generous: a cold Next.js dev server compiles a route on first visit.
  timeout: 60_000,
  expect: { timeout: 10_000 },

  // The suite mutates shared state — it plays codes out of the pool and hands prizes over.
  // Two workers racing on the same database would make each other's assertions
  // non-deterministic, which is the one thing a functional test must not be.
  workers: 1,
  fullyParallel: false,

  // Fail the pipeline on a stray `test.only` rather than silently running one test.
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,

  reporter: [
    ['list'],
    // Consumed by the Jenkins `junit` step, alongside the Vitest report.
    ['junit', { outputFile: 'reports/junit/playwright.xml' }],
    ['html', { outputFolder: 'reports/playwright', open: 'never' }],
  ],

  use: {
    baseURL: SITE_URL,
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    // Kept only for a failure: a trace per passing test fills a disk on a build agent.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'public-site',
      testMatch: /public\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'back-office',
      testMatch: /back-office\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: ADMIN_URL },
    },
    {
      // The brief requires the site to work on every device, so the customer journey is
      // replayed on a mobile viewport. The back office is desktop-only by design: an
      // employee uses a till terminal, an administrator a workstation.
      name: 'public-site-mobile',
      testMatch: /public\/.*\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
    },
  ],

  /**
   * The three servers under test.
   *
   * In CI they are the **production builds**, started with `next start`. Locally they are
   * the dev servers, because a developer wants hot reload.
   *
   * The distinction is not cosmetic: `next dev` compiles each route the first time it is
   * visited, so a suite that walks 20 routes across 3 browser projects spends most of its
   * wall-clock waiting on the compiler rather than testing anything. Measured on this
   * suite: 2.5 hours against the dev servers. The production build also happens to be what
   * actually ships, which is what a functional test should be exercising.
   *
   * The pipeline therefore runs `nx run-many -t build` before this stage, and that build
   * is a cached Nx target the earlier stages already produced.
   */
  webServer: [
    {
      command: 'npx nx serve @theetiptop-contest/api',
      url: `${API_URL}/health`,
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: process.env['CI']
        ? 'npx nx start @theetiptop-contest/web --port=3000'
        : 'npx nx dev @theetiptop-contest/web --port=3000',
      url: SITE_URL,
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
    {
      command: process.env['CI']
        ? 'npx nx start @theetiptop-contest/admin --port=3001'
        : 'npx nx dev @theetiptop-contest/admin --port=3001',
      url: `${ADMIN_URL}/connexion`,
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
  ],
});
