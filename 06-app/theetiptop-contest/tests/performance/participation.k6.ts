/**
 * Performance test: playing a code against the real pool of 500,000. Task A18.
 *
 * The fourth of the four test families the brief requires, next to unit, integration and
 * functional. It answers a question the other three cannot: how the hottest query on the
 * site behaves under concurrent load, on a table with 500,000 rows and six indexes.
 *
 * Run with k6 installed:
 *   npm run test:perf
 *
 * Run without installing anything:
 *   docker run --rm -i --network host -v "$PWD:/work" -w /work grafana/k6 \
 *     run tests/performance/participation.k6.ts
 *
 * Requires the API running, and a seeded and generated database:
 *   npm run dev:api
 *   npm run db:seed && npm run codes:generate
 *
 * ⚠️ This test is read-heavy on purpose. It does NOT play valid codes: doing so would
 * consume the pool a few thousand codes per run and make the conformity test fail
 * afterwards. What it measures is the lookup-and-reject path, which executes exactly the
 * same index lookup as a winning submission, the branch after it is one INSERT.
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const API_URL = __ENV.API_URL || 'http://localhost:3333';
const SITE_URL = __ENV.SITE_URL || 'http://localhost:3000';
const API_KEY = __ENV.POS_API_KEY || 'dev-key-caisses';

/** Demonstration customer, inserted by `npm run db:seed` and absent in production. */
const ACCOUNT_EMAIL = __ENV.PERF_ACCOUNT_EMAIL || 'camille.rousseau@example.fr';
const ACCOUNT_PASSWORD = __ENV.PERF_ACCOUNT_PASSWORD || 'MotDePasse2026!';
const SESSION_COOKIE_NAME = 'better-auth.session_token';

/** Custom metrics, so the report separates the paths that matter from the overall average. */
const codeLookupDuration = new Trend('code_lookup_duration', true);
const catalogueDuration = new Trend('catalogue_duration', true);
const posDispenseDuration = new Trend('pos_dispense_duration', true);
const businessErrors = new Rate('business_errors');

export const options = {
  scenarios: {
    /**
     * The public catalogue, which every visitor loads before anything else.
     *
     * Ramped rather than constant: a flat load tells you the steady state, a ramp tells
     * you where it stops being steady. 50 virtual users is above any plausible traffic for
     * a contest run by a 10-store chain, which is the point, the figure in the
     * specification should be a ceiling, not a guess.
     */
    catalogue_browsing: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '15s', target: 20 },
        { duration: '30s', target: 50 },
        { duration: '15s', target: 0 },
      ],
      exec: 'browseCatalogue',
      tags: { scenario: 'catalogue' },
    },

    /**
     * Code submission, the hottest query on the site.
     *
     * A constant arrival rate rather than a fixed number of users: what matters is whether
     * the API sustains N submissions per second, not how many browsers are open. With
     * `ramping-vus` a slow response would reduce the offered load and hide the problem.
     */
    code_submission: {
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: '45s',
      preAllocatedVUs: 20,
      maxVUs: 100,
      exec: 'submitCode',
      startTime: '5s',
      tags: { scenario: 'submission' },
    },

    /**
     * The till endpoints, which run a `FOR UPDATE SKIP LOCKED` pop against the same table.
     *
     * Deliberately modest: 10 stores cannot physically ring up more than a few sales a
     * second between them. The interesting property is not the throughput but that
     * concurrent pops never collide, which the integration suite proves, and this one
     * confirms under real contention.
     */
    pos_dispensing: {
      executor: 'constant-arrival-rate',
      rate: 5,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 5,
      maxVUs: 20,
      exec: 'dispenseCode',
      startTime: '10s',
      tags: { scenario: 'pos' },
    },
  },

  /**
   * The thresholds are the pass/fail criteria the Jenkins stage reads.
   *
   * Set from the measurements in `06-app/BENCHMARK.md` (a 529 µs indexed lookup) with an
   * order of magnitude of headroom: the purpose is to catch an index being dropped or an
   * N+1 appearing, not to fail the build because a build agent was busy.
   */
  thresholds: {
    // No request may error out, at any load.
    http_req_failed: ['rate<0.01'],
    // 95% of code submissions under 300 ms end to end, including the Redis rate-limit check.
    'code_lookup_duration{scenario:submission}': ['p(95)<300', 'p(99)<800'],
    // The catalogue is cached in Redis and should be faster still.
    'catalogue_duration{scenario:catalogue}': ['p(95)<200'],
    // A till waiting more than half a second holds up a queue of customers.
    'pos_dispense_duration{scenario:pos}': ['p(95)<500'],
    // A business refusal is a valid answer; an unexpected one is not.
    business_errors: ['rate<0.01'],
  },
};

/** A well-formed code that is not in the pool, so the submission is rejected, not consumed. */
function unknownCode(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 10; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

/** Public catalogue: the three reads behind every page of the public site. */
export function browseCatalogue(): void {
  group('catalogue', () => {
    const responses = http.batch([
      ['GET', `${API_URL}/v1/contest`],
      ['GET', `${API_URL}/v1/prizes`],
      ['GET', `${API_URL}/v1/stores`],
    ]);

    for (const response of responses) {
      catalogueDuration.add(response.timings.duration);
      const ok = check(response, {
        'catalogue responds 200': (r) => r.status === 200,
        'catalogue returns JSON': (r) => String(r.headers['Content-Type']).includes('json'),
      });
      businessErrors.add(!ok);
    }
  });

  // A visitor reads the page before clicking. Without this pause the scenario measures
  // how fast k6 can loop, not how the API behaves under realistic pacing.
  sleep(1);
}

/**
 * Signs in once, before the scenarios start, and hands the session cookie to every
 * virtual user.
 *
 * Once, not per iteration. Better Auth hashes passwords with a deliberately slow KDF, so
 * 50 sign-ins a second would turn this into a benchmark of the hash. One sign-in in
 * `setup()` costs a few hundred milliseconds that are not counted in any scenario, and
 * every iteration afterwards exercises the path under test with a real session.
 *
 * This is what makes the submission scenario honest. Run unauthenticated, the API answers
 * 401 at the guard and never touches the database, the reported `code_lookup_duration`
 * would then describe a guard, under a name that claims an index lookup.
 */
export function setup(): { cookie: string } {
  const response = http.post(
    `${API_URL}/api/auth/sign-in/email`,
    JSON.stringify({ email: ACCOUNT_EMAIL, password: ACCOUNT_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'POST /api/auth/sign-in/email' } }
  );

  if (response.status !== 200) {
    throw new Error(
      `Sign-in failed (${response.status}). Run: npm run db:seed, and check the API is up on ${API_URL}.`
    );
  }

  const raw = response.headers['Set-Cookie'] ?? '';
  const token = String(raw).split(';')[0];

  if (!token.startsWith(SESSION_COOKIE_NAME)) {
    throw new Error(`No ${SESSION_COOKIE_NAME} cookie in the sign-in response.`);
  }

  return { cookie: token };
}

/**
 * Code submission: the hottest query on the site, and the one this test exists for.
 *
 * Authenticated with the shared session, so the request goes all the way to the unique
 * index on `TicketCode.code` over 500,000 rows. The codes submitted are well-formed but
 * absent from the pool, so the answer is `UNKNOWN_CODE` and nothing is consumed, the
 * lookup is identical either way, a winning submission differing only by the INSERT that
 * follows.
 *
 * ⚠️ The API must be started with the rate limits raised, or every iteration past the
 * tenth returns RATE_LIMITED before the database is reached. The limits live on the
 * server, so k6 cannot raise them itself:
 *
 *     npm run dev:api:perf     instead of   npm run dev:api
 *
 * The API defaults remain the production values; only this entry point raises them. The
 * check below fails the run if a submission comes back as anything but UNKNOWN_CODE,
 * precisely so a forgotten `dev:api` cannot produce a fast, meaningless number.
 */
export function submitCode(data: { cookie: string }): void {
  group('submission', () => {
    const response = http.post(
      `${API_URL}/v1/participations`,
      JSON.stringify({ code: unknownCode() }),
      {
        headers: { 'Content-Type': 'application/json', Cookie: data.cookie },
        tags: { name: 'POST /v1/participations' },
      }
    );

    codeLookupDuration.add(response.timings.duration);

    const ok = check(response, {
      'submission reaches the lookup': (r) => r.status === 200,
      // The point of the assertion: anything else means the request stopped earlier than
      // the database, at the guard (401) or at the limiter (RATE_LIMITED), and the
      // duration recorded above would not be a lookup at all.
      'the answer is UNKNOWN_CODE, not a guard or the limiter': (r) =>
        r.status === 200 && r.json('outcome') === 'UNKNOWN_CODE',
      'submission never 5xx': (r) => r.status < 500,
    });
    businessErrors.add(!ok);

    // One real server-rendered page per iteration, so the measurement includes the Next.js
    // layer the customer actually goes through.
    const page = http.get(`${SITE_URL}/jeu-concours/lots`, { tags: { name: 'GET /jeu-concours/lots' } });
    check(page, { 'prizes page renders': (r) => r.status === 200 });
  });
}

/**
 * The till's read path: the state a terminal polls before printing anything.
 *
 * Deliberately a read and not a dispense. Dispensing would take codes out of the pool at
 * 5 a second and leave the conformity check counting a pool this test had eaten, so the
 * `FOR UPDATE SKIP LOCKED` pop is proven under contention by
 * `tests/participation-concurrency.integration.spec.ts` instead, where the codes can be
 * rolled back. What is measured here is that `codesRemaining`, an aggregate over 500,000
 * rows, stays fast while the submission scenario hammers the same table.
 */
export function dispenseCode(): void {
  group('pos', () => {
    const info = http.get(`${API_URL}/v1/pos/contest`, {
      headers: { 'x-api-key': API_KEY },
      tags: { name: 'GET /v1/pos/contest' },
    });

    posDispenseDuration.add(info.timings.duration);

    const ok = check(info, {
      'till reads the contest state': (r) => r.status === 200,
      'till is told how many codes remain': (r) =>
        r.status === 200 && typeof r.json('codesRemaining') === 'number',
    });
    businessErrors.add(!ok);
  });

  sleep(0.2);
}

/**
 * Writes the reports Jenkins archives.
 *
 * k6 has no JUnit reporter, so one is assembled here: the brief requires test reports to
 * be exported to the CI, and the Jenkins `junit` step is what turns a breached threshold
 * into a failed build rather than a line in a log nobody reads.
 */
export function handleSummary(data: Record<string, unknown>) {
  const metrics = (data['metrics'] ?? {}) as Record<string, { thresholds?: Record<string, { ok: boolean }> }>;

  const cases: string[] = [];
  let failures = 0;

  for (const [metric, detail] of Object.entries(metrics)) {
    for (const [threshold, result] of Object.entries(detail.thresholds ?? {})) {
      const name = `${metric} ${threshold}`;
      if (result.ok) {
        cases.push(`    <testcase classname="k6.threshold" name="${escapeXml(name)}" />`);
      } else {
        failures += 1;
        cases.push(
          `    <testcase classname="k6.threshold" name="${escapeXml(name)}">\n` +
            `      <failure message="threshold breached">${escapeXml(name)}</failure>\n` +
            `    </testcase>`
        );
      }
    }
  }

  const junit =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<testsuites>\n` +
    `  <testsuite name="k6 performance" tests="${cases.length}" failures="${failures}">\n` +
    `${cases.join('\n')}\n` +
    `  </testsuite>\n` +
    `</testsuites>\n`;

  return {
    'reports/junit/k6.xml': junit,
    // The full summary, for the measurement tables of the specification document.
    'reports/k6-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data),
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Minimal console summary: the figures that go into BENCHMARK.md. */
function textSummary(data: Record<string, unknown>): string {
  const metrics = (data['metrics'] ?? {}) as Record<string, { values?: Record<string, number> }>;

  const line = (label: string, metric: string, key = 'p(95)') => {
    const value = metrics[metric]?.values?.[key];
    return value === undefined ? '' : `  ${label.padEnd(34)} ${value.toFixed(1)} ms (${key})\n`;
  };

  return (
    '\nMesures (pour le CST partie I et BENCHMARK.md)\n' +
    line('catalogue public', 'catalogue_duration') +
    line('soumission de code', 'code_lookup_duration') +
    line('état du jeu, caisse', 'pos_dispense_duration') +
    `  ${'requêtes en échec'.padEnd(34)} ${((metrics['http_req_failed']?.values?.['rate'] ?? 0) * 100).toFixed(2)} %\n`
  );
}
