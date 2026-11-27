/**
 * Warms a deployed environment, and fails loudly if it never answers.
 *
 *   node tools/warm-up.mjs http://127.0.0.1:3100 http://127.0.0.1:3101
 *
 * Called by the pipeline between the seed and the functional suite. It must run inside a
 * container started with `--network host`, because the addresses above are the HOST's
 * loopback, and a Jenkins agent is itself a container with a loopback of its own. The
 * first version ran as a plain `sh` step and spent sixty seconds failing to reach a port
 * that was never on its own interface.
 *
 * Why warm at all.
 *
 * A functional assertion waits ten seconds. The first request to a route on a freshly
 * started container is the slowest one it will ever serve: the server resolves the route
 * and the API behind it opens its first connection to a database that has just received
 * half a million rows. Build 34 failed on exactly that and on nothing else, with the
 * stores page reporting zero items to the test and ten to anyone who looked a minute
 * later.
 *
 * Loosening the assertion would have hidden it. Hitting each page once first measures the
 * application rather than its cold start, and when a page really is broken this says so
 * here, in one line, instead of three stages later inside a browser.
 */

const ATTEMPTS = 30;
const DELAY_MS = 2_000;
const TIMEOUT_MS = 20_000;

/** Pages whose first render is slow because they read the catalogue. */
const PUBLIC_PAGES = ['/', '/boutiques', '/jeu-concours', '/participer', '/connexion'];
const ADMIN_PAGES = ['/connexion'];

async function hit(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: 'manual' });
    return response.status;
  } catch (error) {
    return error.name === 'AbortError' ? 'délai dépassé' : error.cause?.code ?? error.message;
  } finally {
    clearTimeout(timer);
  }
}

async function warm(base, path) {
  const url = `${base}${path}`;
  let last;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    const started = Date.now();
    last = await hit(url);
    // 200 or a redirect both prove the route is served. `/participer` answers 307 to an
    // anonymous visitor, which is the behaviour one of the functional tests asserts.
    if (last === 200 || (typeof last === 'number' && last >= 300 && last < 400)) {
      const ms = Date.now() - started;
      console.log(`  ${url.padEnd(38)} ${last}  ${ms} ms${attempt > 1 ? `  (${attempt} essais)` : ''}`);
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  }
  console.error(`  ${url.padEnd(38)} ÉCHEC après ${ATTEMPTS} essais, dernier résultat : ${last}`);
  return false;
}

const [site, admin] = process.argv.slice(2);
if (!site) {
  console.error('usage: node tools/warm-up.mjs <url du site> [url du back-office]');
  process.exit(2);
}

console.log('Préchauffage de l\'environnement déployé');
let ok = true;
for (const path of PUBLIC_PAGES) ok = (await warm(site, path)) && ok;
if (admin) for (const path of ADMIN_PAGES) ok = (await warm(admin, path)) && ok;

if (!ok) {
  console.error('\nUne page au moins ne répond pas. La suite fonctionnelle ne sert à rien tant que');
  console.error('ce point n\'est pas réglé : elle produirait des échecs qui parlent du symptôme.');
  process.exit(1);
}
console.log('Toutes les pages répondent.');
