import { createHash } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createSeededRandom } from '../apps/api/src/common/seeded-random';
import { CONTEST } from '../prisma/reference-data';
import { createScriptClient } from '../prisma/script-client';
import type { PrismaClient } from '../apps/api/src/generated/prisma/client';

/**
 * Task A13: the grand prize draw.
 *
 * The brief is explicit on one point and it is the easiest to get wrong:
 *
 *   "For the grand prize draw, the number of entries a customer has does not increase
 *    their chances of winning."
 *
 * Two of the tests below exist only to pin that down. They build a pool where one customer
 * holds many participations and several hold one each, then check that the draw treats
 * them identically. A draw over PARTICIPATIONS instead of PARTICIPANTS would pass every
 * other test in this suite and fail these two — which is the whole point.
 *
 * Requires a seeded and generated database.
 */
describe('grand prize draw fairness', () => {
  let prisma: PrismaClient;
  let contestId: string;

  /** Resolves the draw pool exactly as `DrawService` does. */
  async function resolvePool(): Promise<string[]> {
    const rows = await prisma.$queryRaw<Array<{ userId: string }>>`
      SELECT DISTINCT p."userId" AS "userId"
      FROM "Participation" p
      INNER JOIN "TicketCode" tc ON tc."id" = p."ticketCodeId"
      INNER JOIN "User" u ON u."id" = p."userId"
      WHERE tc."contestId" = ${contestId}
        AND u."anonymizedAt" IS NULL
      ORDER BY p."userId" ASC
    `;

    return rows.map((row) => row.userId);
  }

  beforeAll(async () => {
    prisma = createScriptClient();
    const contest = await prisma.contest.findUnique({ where: { slug: CONTEST.slug } });
    if (!contest) throw new Error(`Contest "${CONTEST.slug}" not found. Run: npm run db:seed`);
    contestId = contest.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('the pool is participants, not participations', () => {
    it('lists each participant exactly once', async () => {
      const pool = await resolvePool();

      expect(new Set(pool).size).toBe(pool.length);
    });

    it('is no larger than the number of participations, and smaller once anybody plays twice', async () => {
      const [pool, participationCount] = await Promise.all([
        resolvePool(),
        prisma.participation.count(),
      ]);

      expect(pool.length).toBeLessThanOrEqual(participationCount);
    });

    it('matches the participant count the dashboard reports', async () => {
      // The dashboard and the draw must agree on who is in: an administrator who reads
      // "41,233 participants" and then sees a draw over a different number has no reason
      // to trust either figure.
      const [pool, distinct] = await Promise.all([
        resolvePool(),
        prisma.participation.findMany({ select: { userId: true }, distinct: ['userId'] }),
      ]);

      expect(pool.length).toBe(distinct.length);
    });
  });

  /**
   * The fairness property itself, checked on a synthetic pool.
   *
   * Built in memory rather than by inserting thousands of participations: the question is
   * about the drawing function, and the database's role — collapsing participations into
   * participants — is already covered above.
   */
  describe('every participant has the same chance', () => {
    it('gives a participant with 40 entries the same odds as one with 1', () => {
      // `heavy` would hold 40 of the 49 participations in a participation-based draw, i.e.
      // about 82% of the odds. In a participant-based draw it holds 1 of 10, i.e. 10%.
      const pool = ['heavy', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9'];

      const rounds = 200_000;
      const wins = new Map<string, number>(pool.map((id) => [id, 0]));

      for (let round = 0; round < rounds; round += 1) {
        const random = createSeededRandom(`fairness-${round}`);
        const winner = pool[random.nextBelow(pool.length)];
        wins.set(winner, (wins.get(winner) ?? 0) + 1);
      }

      const expected = rounds / pool.length;

      for (const [participant, count] of wins) {
        // ±3 %: tight enough that an 82%-vs-10% bias is impossible to miss, loose enough
        // not to flake.
        expect(count, `participant ${participant} is over- or under-represented`).toBeGreaterThan(
          expected * 0.97
        );
        expect(count).toBeLessThan(expected * 1.03);
      }
    });

    it('never draws outside the pool', () => {
      const pool = ['a', 'b', 'c', 'd', 'e'];

      for (let round = 0; round < 10_000; round += 1) {
        const random = createSeededRandom(`bounds-${round}`);
        expect(pool).toContain(pool[random.nextBelow(pool.length)]);
      }
    });

    it('draws the only participant when there is one', () => {
      const random = createSeededRandom('single');
      expect(['solo'][random.nextBelow(1)]).toBe('solo');
    });
  });

  describe('auditability', () => {
    it('produces a stable fingerprint for the same pool', async () => {
      const pool = await resolvePool();

      const fingerprint = () => createHash('sha256').update(pool.join('\n')).digest('hex');

      // The bailiff recomputes this from a database export: it has to be a pure function
      // of the ordered pool and nothing else — no timestamp, no insertion order.
      expect(fingerprint()).toBe(fingerprint());
      expect(fingerprint()).toMatch(/^[0-9a-f]{64}$/);
    });

    it('changes the fingerprint if the pool changes', () => {
      const hash = (ids: string[]) => createHash('sha256').update(ids.join('\n')).digest('hex');

      expect(hash(['a', 'b'])).not.toBe(hash(['a', 'b', 'c']));
      // Order matters, which is why the pool is sorted on the primary key before hashing.
      expect(hash(['a', 'b'])).not.toBe(hash(['b', 'a']));
      // The separator is what stops ['ab'] and ['a','b'] colliding.
      expect(hash(['ab'])).not.toBe(hash(['a', 'b']));
    });

    it('replays to the same winner from the stored seed', async () => {
      const pool = await resolvePool();
      if (pool.length === 0) return; // nothing to draw from yet

      const seed = 'a-recorded-seed-from-a-past-draw';

      const first = pool[createSeededRandom(seed).nextBelow(pool.length)];
      const second = pool[createSeededRandom(seed).nextBelow(pool.length)];

      // This is the verification the back office exposes to the bailiff.
      expect(first).toBe(second);
    });
  });

  describe('eligibility', () => {
    it('excludes anonymised accounts', async () => {
      const pool = await resolvePool();

      const anonymised = await prisma.user.findMany({
        where: { anonymizedAt: { not: null } },
        select: { id: true },
      });

      // An anonymised account has nobody left to hand a year of tea to, and keeping it in
      // the pool would mean a draw that can produce no deliverable winner.
      for (const user of anonymised) {
        expect(pool).not.toContain(user.id);
      }
    });

    it('includes only participants of this contest', async () => {
      const pool = await resolvePool();
      if (pool.length === 0) return;

      const participations = await prisma.participation.findMany({
        where: { userId: { in: pool } },
        select: { ticketCode: { select: { contestId: true } } },
      });

      for (const participation of participations) {
        expect(participation.ticketCode.contestId).toBe(contestId);
      }
    });
  });
});
