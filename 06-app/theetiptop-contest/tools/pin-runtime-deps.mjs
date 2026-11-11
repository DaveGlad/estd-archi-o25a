/**
 * Pins the generated runtime manifest to the exact versions the build stage installed.
 *
 * Run inside the Docker build, between `nx build` and the runtime install:
 *   node ../../05-workflow/docker/pin-runtime-deps.mjs apps/api/dist/package.json
 *
 * ── Why this exists ──────────────────────────────────────────────────────────────
 *
 * The API image needs a node_modules holding the ~20 packages the webpack bundle leaves
 * external, and nothing else. Getting there in an npm workspace turned out to need this
 * script. Three approaches were measured first:
 *
 *   1. `npm ci --omit=dev -w @theetiptop-contest/api --include-workspace-root`
 *      → installs the entire tree, 936 MB, TypeScript and Next included. npm's workspace
 *        filter does not restrict `ci`.
 *
 *   2. `npm prune --omit=dev --include-workspace-root`
 *      → same outcome, for the same reason.
 *
 *   3. `nx prune`, which emits a trimmed package.json AND a trimmed package-lock.json
 *      → the trimmed lockfile is inconsistent with the manifest beside it:
 *        `npm ci` stops on "Missing: content-type@1.0.5 from lock file". Express 5 pulls
 *        `content-type` through two paths and the pruner only records one.
 *
 * So the lockfile is dropped and the manifest is pinned instead. `generatePackageJson`
 * emits the declared RANGES (`^11.0.0`); this rewrites each one to the exact version
 * present in the build stage's node_modules, which `npm ci` resolved from the committed
 * lockfile. `npm install --no-package-lock` against an exactly-pinned manifest then
 * installs exactly those versions.
 *
 * The result is reproducible end to end — committed lockfile → build stage → pinned
 * manifest → runtime install — without depending on a lockfile pruner being correct.
 *
 * ── Limitation, stated plainly ───────────────────────────────────────────────────
 *
 * Only the direct dependencies are pinned. Their transitive dependencies resolve to
 * whatever satisfies their ranges at image build time, so two builds a month apart can
 * differ a patch version deep in the tree. Closing that gap means a correct pruned
 * lockfile, i.e. fixing `@nx/js:prune-lockfile` upstream or vendoring the prune. Written
 * down here rather than left as a surprise.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const manifestPath = process.argv[2];

if (!manifestPath) {
  console.error('usage: node pin-runtime-deps.mjs <path to generated package.json>');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const dependencies = manifest.dependencies ?? {};

// Resolved from the workspace root, which is where `npm ci` hoisted everything.
const require = createRequire(resolve(process.cwd(), 'package.json'));

const pinned = {};
const unresolved = [];

for (const [name, range] of Object.entries(dependencies)) {
  // The workspace packages are bundled into main.js by webpack, so they are not needed at
  // runtime at all. Keeping them would make the install reach for a version that was never
  // published to a registry.
  if (name.startsWith('@theetiptop-contest/')) continue;

  try {
    const { version } = require(`${name}/package.json`);
    pinned[name] = version;
  } catch {
    // A package whose package.json is not exported (some packages restrict `exports`).
    // Keep the declared range rather than dropping the dependency.
    pinned[name] = range;
    unresolved.push(name);
  }
}

writeFileSync(
  manifestPath,
  JSON.stringify(
    {
      name: manifest.name,
      version: manifest.version,
      private: true,
      main: manifest.main ?? 'main.js',
      dependencies: Object.fromEntries(Object.entries(pinned).sort(([a], [b]) => a.localeCompare(b))),
    },
    null,
    2
  ) + '\n'
);

console.log(`pinned ${Object.keys(pinned).length} runtime dependencies to exact versions`);
if (unresolved.length > 0) {
  console.log(`  kept as a range (package.json not exported): ${unresolved.join(', ')}`);
}
