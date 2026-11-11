/**
 * Loads `.env` into `process.env`, once, before anything reads it.
 *
 * Imported as the very first statement of `main.ts`: `loadConfig()` reads `process.env`
 * when the DI container builds, which is after every import has been evaluated, so the
 * side effect has to happen at import time.
 *
 * Deliberately not `@nestjs/config`. That package would add a second configuration
 * mechanism on top of the zod validation in `env.ts`, for the sole benefit of reading the
 * file — and the brief's eco-design section commits us to carrying no dependency we do
 * not need. In the deployed environments there is no `.env` at all: Jenkins injects the
 * variables and `dotenv` quietly finds nothing to do.
 */

import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// Candidates, most specific first. `process.cwd()` is the workspace root under `nx serve`
// and the application root once bundled, hence both.
const candidates = [join(process.cwd(), '.env'), join(process.cwd(), '..', '..', '.env')];

const found = candidates.find((candidate) => existsSync(candidate));
if (found) loadDotenv({ path: found, quiet: true });
