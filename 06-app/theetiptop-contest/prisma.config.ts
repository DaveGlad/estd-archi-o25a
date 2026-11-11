// Prisma 7 configuration.
//
// Prisma 7 no longer reads the `prisma` key of package.json, and no longer auto-loads
// `.env`: both are now the job of this file. `dotenv/config` is imported first on
// purpose, so DATABASE_URL is populated before it is read below.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * Read directly from `process.env` rather than through Prisma's `env()` helper.
 *
 * `env()` throws when the variable is absent, and this file is evaluated by EVERY prisma
 * command — including `prisma generate`, which only reads the schema and writes TypeScript.
 * That matters in the Docker build: the build stage generates the client and has no
 * database, and no business having one. Requiring a connection string there would mean
 * passing a fake URL as a build argument, which is the kind of workaround that later gets
 * mistaken for configuration.
 *
 * The commands that genuinely need it — `migrate`, `db seed`, `studio` — still fail with
 * Prisma's own message when it is missing.
 */
const databaseUrl = process.env['DATABASE_URL'];

export default defineConfig({
  // Folder rather than a single file: the schema is split one file per domain, which is
  // the `deal-israel` convention and what keeps a 9-model schema readable. This folder is
  // also the source the MLD of the specification document is derived from.
  schema: 'prisma/schema',

  migrations: {
    // Committed alongside the code that runs them: it is the Jenkins pipeline that applies
    // them to dev, then preprod-QA, then prod.
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },

  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});
