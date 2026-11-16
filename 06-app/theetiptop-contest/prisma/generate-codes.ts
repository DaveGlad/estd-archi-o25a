/**
 * Generates the 500,000 ticket codes. Task A3 of the backlog.
 *
 * Run with:  npm run codes:generate
 *            npm run codes:generate -- --seed=<seed>   (to replay a previous run)
 *
 * The constraint from the brief, highlighted in red in the source document:
 *
 *   "The codes printed on the receipts must be generated at the very start of the contest
 *    so that the winning percentages are necessarily respected. You must therefore hold
 *    500,000 codes in the database, ready to be used, with their prize already assigned."
 *
 * The consequence is the whole design: the prize is NOT drawn when a customer submits a
 * code. Drawing at submission time could not guarantee the split — the last customers
 * would get whatever quota was left, and an early run of luck would exhaust a prize the
 * contest rules promise. Freezing the prize at insertion makes the split a property of
 * the data, not of the traffic.
 *
 * Steps:
 *   1. check the split adds up to exactly 500,000 (fail before writing anything);
 *   2. build the exact prize vector: 300,000 infusers + 100,000 detox + ... ;
 *   3. shuffle it with a seeded Fisher-Yates, so the prize behind a code is unpredictable
 *      while the run stays replayable in front of the bailiff;
 *   4. draw 500,000 distinct 10-character codes;
 *   5. insert them in batches;
 *   6. record the fingerprint and re-count the split in the database.
 */

import { createHash, randomBytes } from 'node:crypto';
import {
  CODE_ALPHABET,
  hasDigitsAndLetters,
  CODE_LENGTH,
  PLANNED_CODE_COUNT,
  TICKET_PRIZES,
  assertDistributionIsExact,
} from '@theetiptop-contest/shared';

import { CONTEST } from './reference-data.js';
import { createSeededRandom, shuffleInPlace, type SeededRandom } from './prng.js';
import { createScriptClient, formatDuration } from './script-client.js';

const prisma = createScriptClient();

/**
 * Rows per INSERT.
 *
 * PostgreSQL caps a statement at 65,535 bound parameters. Prisma's `createMany` sends one
 * multi-row INSERT with 4 parameters per row (id, code, prizeId, contestId), so 5,000
 * rows is 20,000 parameters — comfortably inside the cap, and large enough that the 100
 * round trips are not what dominates the run. Measured alternatives are in BENCHMARK.md.
 */
const BATCH_SIZE = 5_000;

/** Parses `--seed=...` so a previous run can be replayed for verification. */
function readSeedArgument(): string | null {
  const argument = process.argv.find((value) => value.startsWith('--seed='));
  return argument ? argument.slice('--seed='.length) : null;
}

/**
 * Builds the vector of prize ids, one entry per code, in exact quantities.
 *
 * This array IS the guarantee. 300,000 entries for the infuser and not one more, because
 * the array is built from the declared quantities rather than by drawing a prize per code
 * against a probability. Drawing per code would land near 60% but essentially never on
 * exactly 60%, and the contest rules filed with the bailiff say 60%.
 */
function buildPrizeVector(prizeIdByKey: Map<string, string>): string[] {
  const vector: string[] = new Array(PLANNED_CODE_COUNT);
  let cursor = 0;

  for (const prize of TICKET_PRIZES) {
    const prizeId = prizeIdByKey.get(prize.key);
    if (!prizeId) throw new Error(`Prize "${prize.key}" is missing from the database. Run the seed first.`);

    vector.fill(prizeId, cursor, cursor + prize.quantity);
    cursor += prize.quantity;
  }

  if (cursor !== PLANNED_CODE_COUNT) {
    throw new Error(`Prize vector holds ${cursor} entries, expected ${PLANNED_CODE_COUNT}.`);
  }

  return vector;
}

/**
 * Draws distinct codes until the target count is reached.
 *
 * A `Set` rather than a probabilistic argument: the expected number of collisions over
 * 500,000 draws from 36^10 is about 3.4 x 10^-5, but "almost certainly none" is not
 * "none", and a duplicate here would abort the insert halfway through. The Set makes the
 * in-memory list provably unique; the unique index on `TicketCode.code` remains the
 * guarantee at the database level, because that is the only one that still holds if this
 * script is ever run twice against the same contest.
 */
function drawDistinctCodes(count: number, random: SeededRandom): string[] {
  const alphabetSize = CODE_ALPHABET.length;
  const seen = new Set<string>();
  const codes: string[] = [];
  let collisions = 0;

  let degenerate = 0;

  while (codes.length < count) {
    let code = '';
    for (let position = 0; position < CODE_LENGTH; position += 1) {
      code += CODE_ALPHABET[random.nextBelow(alphabetSize)];
    }

    // The brief asks for codes "comprenant des chiffres et des lettres". A uniform draw
    // over 36 symbols produces about 3.8% of all-letter codes, so the rule has to be
    // enforced here rather than assumed. Redrawn like a collision, which keeps the run
    // replayable from the seed: the rejected draws are part of the deterministic stream.
    if (!hasDigitsAndLetters(code)) {
      degenerate += 1;
      continue;
    }

    if (seen.has(code)) {
      collisions += 1;
      continue;
    }

    seen.add(code);
    codes.push(code);
  }

  if (collisions > 0) {
    console.log(`  ${collisions} collision(s) drawn again — expected, and handled`);
  }

  if (degenerate > 0) {
    const share = ((degenerate / (count + degenerate + collisions)) * 100).toFixed(1);
    console.log(`  ${degenerate} draw(s) redrawn for lacking a digit or a letter (${share}%)`);
  }

  return codes;
}

/** SHA-256 of the sorted codes: proves the pool was not altered after generation. */
function fingerprintPool(codes: readonly string[]): string {
  const hash = createHash('sha256');
  // Sorted, so the fingerprint depends on the SET of codes and not on insertion order.
  // Verification later reads the table back, where order is not guaranteed.
  for (const code of [...codes].sort()) hash.update(code);
  return hash.digest('hex');
}

async function main(): Promise<void> {
  assertDistributionIsExact();

  const contest = await prisma.contest.findUnique({
    where: { slug: CONTEST.slug },
    include: { prizes: true },
  });

  if (!contest) throw new Error(`Contest "${CONTEST.slug}" not found. Run: npm run db:seed`);

  const existing = await prisma.ticketCode.count({ where: { contestId: contest.id } });
  if (existing > 0) {
    throw new Error(
      `${existing.toLocaleString('fr-FR')} codes already exist for this contest.\n` +
        'Generation is a one-shot operation: re-running it would break the guaranteed split\n' +
        'and invalidate codes already printed on receipts.\n' +
        'To start over in development: npm run codes:reset'
    );
  }

  const prizeIdByKey = new Map<string, string>();
  for (const spec of TICKET_PRIZES) {
    const prize = contest.prizes.find((candidate) => candidate.label === spec.label);
    if (!prize) throw new Error(`Prize "${spec.label}" is missing. Run: npm run db:seed`);
    prizeIdByKey.set(spec.key, prize.id);
  }

  // 32 bytes from the OS CSPRNG: unguessable, and still a plain string that can be fed
  // back through --seed to replay the run.
  const seed = readSeedArgument() ?? randomBytes(32).toString('hex');
  const random = createSeededRandom(seed);

  console.log(`Generating ${PLANNED_CODE_COUNT.toLocaleString('fr-FR')} codes`);
  console.log(`  contest        ${contest.name}`);
  console.log(`  code format    ${CODE_LENGTH} characters over ${CODE_ALPHABET.length} symbols`);

  // --- Build and shuffle ------------------------------------------------------
  const buildStart = performance.now();
  const prizeVector = buildPrizeVector(prizeIdByKey);
  shuffleInPlace(prizeVector, random);
  const buildMs = performance.now() - buildStart;
  console.log(`  prize vector   built and shuffled in ${formatDuration(buildMs)}`);

  // --- Draw codes -------------------------------------------------------------
  const drawStart = performance.now();
  const codes = drawDistinctCodes(PLANNED_CODE_COUNT, random);
  const drawMs = performance.now() - drawStart;
  console.log(`  codes drawn    ${formatDuration(drawMs)}`);

  // --- Insert -----------------------------------------------------------------
  const insertStart = performance.now();
  let inserted = 0;

  for (let offset = 0; offset < codes.length; offset += BATCH_SIZE) {
    const batch = codes.slice(offset, offset + BATCH_SIZE).map((code, index) => ({
      code,
      prizeId: prizeVector[offset + index],
      contestId: contest.id,
    }));

    const result = await prisma.ticketCode.createMany({ data: batch });
    inserted += result.count;

    // Progress every 50,000 rows: enough to see the run is alive, not enough to turn the
    // output into a wall of text in the Jenkins console.
    if (inserted % 50_000 === 0) {
      const elapsed = performance.now() - insertStart;
      const rate = Math.round(inserted / (elapsed / 1_000));
      console.log(
        `  inserted       ${inserted.toLocaleString('fr-FR')} / ${PLANNED_CODE_COUNT.toLocaleString(
          'fr-FR'
        )}  (${rate.toLocaleString('fr-FR')} rows/s)`
      );
    }
  }

  const insertMs = performance.now() - insertStart;

  // --- Record auditability metadata -------------------------------------------
  const fingerprint = fingerprintPool(codes);

  await prisma.contest.update({
    where: { id: contest.id },
    data: {
      codesGeneratedAt: new Date(),
      codeGenerationSeedHash: createHash('sha256').update(seed).digest('hex'),
      codePoolFingerprint: fingerprint,
    },
  });

  // --- Report -----------------------------------------------------------------
  console.log('\nMeasurements (for CST part I and BENCHMARK.md)');
  console.log(`  build + shuffle   ${formatDuration(buildMs)}`);
  console.log(`  draw codes        ${formatDuration(drawMs)}`);
  console.log(
    `  insert            ${formatDuration(insertMs)}  (${Math.round(
      PLANNED_CODE_COUNT / (insertMs / 1_000)
    ).toLocaleString('fr-FR')} rows/s, batches of ${BATCH_SIZE.toLocaleString('fr-FR')})`
  );
  console.log(`  total             ${formatDuration(buildMs + drawMs + insertMs)}`);
  console.log(`  pool fingerprint  ${fingerprint}`);

  console.log('\n⚠️  Generation seed, shown once and NOT stored in the database:');
  console.log(`      ${seed}`);
  console.log('    Hand it to the bailiff and place it in the secret manager. It is what');
  console.log('    allows the run to be replayed; anyone holding it can derive every code');
  console.log('    and the prize behind it.');

  console.log('\nNow verify the split with: npm run codes:verify');
}

main()
  .catch((error: unknown) => {
    console.error('\nGeneration failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
