/**
 * Verifies the generated pool against the contest rules. Task A4 of the backlog.
 *
 * Run with:  npm run codes:verify
 *
 * This is the script the brief's requirement rests on: the winning percentages must be
 * "necessarily respected". The generation script asserts the split before writing; this
 * one re-counts it in the database afterwards, which is the only check that would catch a
 * batch that failed halfway, a manual UPDATE, or a second generation run.
 *
 * Exits non-zero on any discrepancy, so the Jenkins pipeline fails the build rather than
 * deploying a contest whose split does not match the filed rules. The same assertions are
 * run as a Vitest integration test; this entry point exists so an operator — or the
 * bailiff — can run the check without the test harness.
 */

import { createHash } from 'node:crypto';
import {
  CODE_LENGTH,
  CODE_PATTERN,
  PLANNED_CODE_COUNT,
  TICKET_PRIZES,
  assertDistributionIsExact,
  hasDigitsAndLetters,
} from '@theetiptop-contest/shared';

import { CONTEST } from './reference-data.js';
import { createScriptClient, formatDuration } from './script-client.js';

const prisma = createScriptClient();

interface CheckResult {
  label: string;
  expected: string;
  actual: string;
  passed: boolean;
}

const results: CheckResult[] = [];

function check(label: string, expected: unknown, actual: unknown): void {
  results.push({
    label,
    expected: String(expected),
    actual: String(actual),
    passed: String(expected) === String(actual),
  });
}

async function main(): Promise<void> {
  assertDistributionIsExact();

  const contest = await prisma.contest.findUnique({
    where: { slug: CONTEST.slug },
    include: { prizes: { orderBy: { rank: 'asc' } } },
  });

  if (!contest) throw new Error(`Contest "${CONTEST.slug}" not found. Run: npm run db:seed`);

  // --- 1. Total volume --------------------------------------------------------
  const total = await prisma.ticketCode.count({ where: { contestId: contest.id } });
  check('total codes', PLANNED_CODE_COUNT, total);

  // --- 2. Split per prize -----------------------------------------------------
  // groupBy rather than one count per prize: a single aggregation over the
  // (prizeId, status) index instead of five sequential scans.
  const grouped = await prisma.ticketCode.groupBy({
    by: ['prizeId'],
    where: { contestId: contest.id },
    _count: { _all: true },
  });

  const countByPrizeId = new Map(grouped.map((row) => [row.prizeId, row._count._all]));

  for (const spec of TICKET_PRIZES) {
    const prize = contest.prizes.find((candidate) => candidate.label === spec.label);
    if (!prize) {
      check(`prize "${spec.key}" present`, 'yes', 'missing');
      continue;
    }

    const actual = countByPrizeId.get(prize.id) ?? 0;
    check(`${spec.key} — count`, spec.quantity, actual);

    // The percentage is recomputed from the actual count rather than trusted: the whole
    // point of the check is that the stored target and the reality might disagree.
    const actualPercentage = total > 0 ? ((actual / total) * 100).toFixed(2) : '0.00';
    check(`${spec.key} — share`, `${spec.percentage.toFixed(2)} %`, `${actualPercentage} %`);
  }

  // --- 3. The grand prize is attached to no code ------------------------------
  const grandPrize = contest.prizes.find((prize) => prize.type === 'GRAND_PRIZE');
  const grandPrizeCodes = grandPrize ? (countByPrizeId.get(grandPrize.id) ?? 0) : 0;
  check('grand prize — codes attached', 0, grandPrizeCodes);

  // --- 4. Uniqueness ----------------------------------------------------------
  // Enforced by a unique index, so a mismatch would mean the index is gone — which is
  // exactly the kind of thing a migration can do by accident.
  const distinct = await prisma.ticketCode.findMany({
    where: { contestId: contest.id },
    select: { code: true },
    distinct: ['code'],
  });
  check('distinct codes', total, distinct.length);

  // --- 5. Code format ---------------------------------------------------------
  const malformed = distinct.filter((row) => !CODE_PATTERN.test(row.code));
  check(`malformed codes (not ${CODE_LENGTH} chars A-Z0-9)`, 0, malformed.length);

  // The brief asks for codes "comprenant des chiffres et des lettres". Counted here and
  // not assumed from the generator: a uniform draw over the 36 symbols yields about 3.8%
  // of all-letter codes, so this check fails loudly against a pool generated without the
  // rule rather than letting 19,000 non-conforming codes reach the tills.
  const degenerate = distinct.filter((row) => !hasDigitsAndLetters(row.code));
  check('codes without both a digit and a letter', 0, degenerate.length);

  // --- 6. Pool fingerprint ----------------------------------------------------
  // Recomputed from the table and compared with what the generation run recorded: proves
  // no code was added, removed or rewritten since.
  if (contest.codePoolFingerprint) {
    const hash = createHash('sha256');
    for (const code of distinct.map((row) => row.code).sort()) hash.update(code);
    check('pool fingerprint', contest.codePoolFingerprint, hash.digest('hex'));
  } else {
    results.push({
      label: 'pool fingerprint',
      expected: 'recorded at generation',
      actual: 'absent — pool generated before this check existed',
      passed: false,
    });
  }

  // --- 7. Lookup latency, the hottest query on the site -----------------------
  // Every customer submission is a lookup by `code`. Measured here so the figure in the
  // specification is a measurement rather than an estimate.
  const sample = distinct.slice(0, 200).map((row) => row.code);
  const lookupStart = performance.now();
  for (const code of sample) {
    await prisma.ticketCode.findUnique({ where: { code }, select: { id: true, prizeId: true } });
  }
  const lookupMs = (performance.now() - lookupStart) / sample.length;

  // --- Report -----------------------------------------------------------------
  const width = Math.max(...results.map((result) => result.label.length));
  console.log(`Conformity of the code pool — contest "${contest.name}"\n`);

  for (const result of results) {
    const status = result.passed ? '✓' : '✗';
    const detail = result.passed
      ? result.actual
      : `${result.actual}  (expected ${result.expected})`;
    console.log(`  ${status} ${result.label.padEnd(width)}  ${detail}`);
  }

  const failed = results.filter((result) => !result.passed);

  console.log(
    `\n  lookup by code  ${formatDuration(lookupMs)} on average over ${sample.length} reads` +
      ` of a ${total.toLocaleString('fr-FR')}-row table`
  );

  if (failed.length > 0) {
    console.error(`\n${failed.length} check(s) failed. The pool does not match the filed rules.`);
    process.exitCode = 1;
    return;
  }

  console.log('\nAll checks passed: the 60/20/10/6/4 % split is exact in the database.');
}

main()
  .catch((error: unknown) => {
    console.error('\nVerification failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
