import { createHash } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  CODE_PATTERN,
  PLANNED_CODE_COUNT,
  TICKET_PRIZES,
} from '@theetiptop-contest/shared';

import { CONTEST } from '../prisma/reference-data';
import { createScriptClient } from '../prisma/script-client';
import type { PrismaClient } from '../apps/api/src/generated/prisma/client';

/**
 * Task A4 of the backlog: the automated conformity test for the prize split.
 *
 * This is the test the brief's central requirement rests on — "the winning percentages are
 * necessarily respected". It is an **integration** test on purpose: it counts the rows in
 * PostgreSQL rather than asserting on the generator's return value. A unit test of the
 * generator would prove the algorithm is right; only this one proves the database actually
 * holds what the rules filed with the bailiff promise.
 *
 * It fails the Jenkins build rather than merely reporting, which is what stops a contest
 * with a broken split from reaching production.
 *
 * Requires a seeded and generated database:
 *   npm run db:seed && npm run codes:generate
 */
describe('code pool conformity', () => {
  let prisma: PrismaClient;
  let contestId: string;
  let total: number;

  beforeAll(async () => {
    prisma = createScriptClient();

    const contest = await prisma.contest.findUnique({ where: { slug: CONTEST.slug } });
    if (!contest) {
      throw new Error(
        `Contest "${CONTEST.slug}" not found. Run: npm run db:seed && npm run codes:generate`
      );
    }

    contestId = contest.id;
    total = await prisma.ticketCode.count({ where: { contestId } });

    if (total === 0) {
      throw new Error('No ticket code in the database. Run: npm run codes:generate');
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('holds exactly 500,000 codes', () => {
    expect(total).toBe(PLANNED_CODE_COUNT);
  });

  describe('prize split, counted in the database', () => {
    it.each(TICKET_PRIZES.map((prize) => [prize.key, prize.label, prize.quantity, prize.percentage]))(
      '%s: %s — %i codes (%i %%)',
      async (_key, label, quantity, percentage) => {
        const prize = await prisma.prize.findUnique({
          where: { contestId_label: { contestId, label: label as string } },
          select: { id: true },
        });

        expect(prize, `prize "${label}" is missing from the database`).not.toBeNull();

        const count = await prisma.ticketCode.count({
          where: { contestId, prizeId: prize!.id },
        });

        expect(count).toBe(quantity);

        // The percentage is recomputed from the count rather than read back from the
        // stored target: the point of the check is that the two might disagree.
        expect((count / total) * 100).toBeCloseTo(percentage as number, 10);
      }
    );

    it('allocates every code to a prize, with none left over', async () => {
      const grouped = await prisma.ticketCode.groupBy({
        by: ['prizeId'],
        where: { contestId },
        _count: { _all: true },
      });

      const allocated = grouped.reduce((sum, row) => sum + row._count._all, 0);

      expect(allocated).toBe(PLANNED_CODE_COUNT);
      // Five ticket prizes and not one more: a sixth group would mean a code pointing at
      // the grand prize, or at a prize from another contest.
      expect(grouped).toHaveLength(TICKET_PRIZES.length);
    });

    it('attaches no code to the grand prize', async () => {
      const grandPrize = await prisma.prize.findFirst({
        where: { contestId, type: 'GRAND_PRIZE' },
        select: { id: true },
      });

      expect(grandPrize).not.toBeNull();

      // The grand prize is drawn at closing among the participants. A code carrying it
      // would mean two ways to win it, one of which nobody oversees.
      const count = await prisma.ticketCode.count({
        where: { contestId, prizeId: grandPrize!.id },
      });

      expect(count).toBe(0);
    });
  });

  describe('code integrity', () => {
    it('holds no duplicate', async () => {
      // Enforced by a unique index, so a mismatch here means the index is gone — which is
      // exactly the sort of thing a migration can do by accident.
      const distinct = await prisma.ticketCode.findMany({
        where: { contestId },
        select: { code: true },
        distinct: ['code'],
      });

      expect(distinct).toHaveLength(total);
    });

    it('matches the 10-character alphanumeric format throughout', async () => {
      const codes = await prisma.ticketCode.findMany({
        where: { contestId },
        select: { code: true },
      });

      const malformed = codes.filter((row) => !CODE_PATTERN.test(row.code));

      expect(malformed).toHaveLength(0);
    });

    it('still matches the fingerprint recorded at generation', async () => {
      const contest = await prisma.contest.findUniqueOrThrow({
        where: { id: contestId },
        select: { codePoolFingerprint: true, codesGeneratedAt: true },
      });

      expect(
        contest.codePoolFingerprint,
        'no fingerprint recorded: the pool predates the audit fields, regenerate it'
      ).not.toBeNull();
      expect(contest.codesGeneratedAt).not.toBeNull();

      const codes = await prisma.ticketCode.findMany({
        where: { contestId },
        select: { code: true },
      });

      const hash = createHash('sha256');
      for (const code of codes.map((row) => row.code).sort()) hash.update(code);

      // Proves no code was added, removed or rewritten since the generation run.
      expect(hash.digest('hex')).toBe(contest.codePoolFingerprint);
    });

    it('does not store the generation seed, only its hash', async () => {
      const contest = await prisma.contest.findUniqueOrThrow({
        where: { id: contestId },
        select: { codeGenerationSeedHash: true },
      });

      // Anyone holding the seed can derive all 500,000 codes and the prize behind each.
      // What the database keeps is a SHA-256 of it: enough to prove a seed presented later
      // is the right one, useless for deriving anything.
      expect(contest.codeGenerationSeedHash).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('lookup performance, the hottest query on the site', () => {
    it('resolves a code through the unique index in under 5 ms', async () => {
      const sample = await prisma.ticketCode.findMany({
        where: { contestId },
        select: { code: true },
        take: 100,
      });

      const start = performance.now();
      for (const row of sample) {
        await prisma.ticketCode.findUnique({
          where: { code: row.code },
          select: { id: true, prizeId: true, status: true },
        });
      }
      const averageMs = (performance.now() - start) / sample.length;

      // Measured at ~0.5 ms on the development machine (see 06-app/BENCHMARK.md). The
      // threshold is deliberately an order of magnitude looser: this test guards against
      // the index being dropped, not against a slow laptop.
      expect(averageMs).toBeLessThan(5);
    });
  });
});
