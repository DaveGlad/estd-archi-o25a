import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PLAYABLE_CODE_STATUSES } from '@theetiptop-contest/shared';

import { CONTEST } from '../prisma/reference-data';
import { createScriptClient } from '../prisma/script-client';
import type { PrismaClient } from '../apps/api/src/generated/prisma/client';

/**
 * The concurrency guarantee behind use case UC-01: **a code can be played exactly once, by
 * exactly one person.**
 *
 * Tested at the database level rather than through HTTP, deliberately. The guarantee is not
 * in the service — it is in the `UPDATE ... WHERE status IN (playable)` compare-and-swap and
 * in the unique constraint on `Participation.ticketCodeId`. Driving it through two
 * concurrent transactions tests the mechanism itself, and does not need a running API.
 *
 * What would pass a naive test and fail here: a read-then-write service. Between a
 * `SELECT status` and the `UPDATE`, a second request passes the same check, and two
 * participations are created for one code — a double click, a network retry, or a script.
 *
 * Requires a seeded and generated database.
 */
describe('playing a code, under concurrency', () => {
  let prisma: PrismaClient;
  let contestId: string;
  let customerId: string;
  let otherCustomerId: string;

  /** Codes this test consumed, so each case starts from a clean state. */
  const consumedCodeIds: string[] = [];

  /**
   * Takes an untouched code out of the pool for a test case.
   *
   * Picked from the far end of the pool rather than the first row, so the test does not
   * compete with codes the till endpoints may have dispensed during a manual run.
   */
  async function reserveCode(): Promise<{ id: string; code: string }> {
    const code = await prisma.ticketCode.findFirst({
      where: { contestId, status: 'AVAILABLE', id: { notIn: consumedCodeIds } },
      select: { id: true, code: true },
      orderBy: { id: 'desc' },
    });

    if (!code) throw new Error('No AVAILABLE code left in the pool. Run: npm run codes:reset && npm run codes:generate');

    consumedCodeIds.push(code.id);
    return code;
  }

  /** The compare-and-swap, exactly as `ParticipationsService.claimCode` performs it. */
  async function claim(ticketCodeId: string, userId: string, claimDeadline: Date) {
    return prisma.$transaction(async (tx) => {
      const claimed = await tx.ticketCode.updateMany({
        where: { id: ticketCodeId, status: { in: [...PLAYABLE_CODE_STATUSES] } },
        data: { status: 'USED', usedAt: new Date() },
      });

      if (claimed.count === 0) return null;

      return tx.participation.create({
        data: { userId, ticketCodeId, claimDeadline },
        select: { id: true, userId: true },
      });
    });
  }

  beforeAll(async () => {
    prisma = createScriptClient();

    const contest = await prisma.contest.findUnique({ where: { slug: CONTEST.slug } });
    if (!contest) throw new Error(`Contest "${CONTEST.slug}" not found. Run: npm run db:seed`);
    contestId = contest.id;

    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
      take: 2,
    });

    if (customers.length < 2) {
      throw new Error('Needs at least two customer accounts. Run: npm run db:seed');
    }

    customerId = customers[0].id;
    otherCustomerId = customers[1].id;
  });

  afterEach(async () => {
    // Puts every code this suite touched back in the pool, so the suite is re-runnable and
    // does not slowly eat the 500,000 codes across runs.
    if (consumedCodeIds.length === 0) return;

    await prisma.participation.deleteMany({ where: { ticketCodeId: { in: consumedCodeIds } } });
    await prisma.ticketCode.updateMany({
      where: { id: { in: consumedCodeIds } },
      data: { status: 'AVAILABLE', usedAt: null },
    });

    consumedCodeIds.length = 0;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates one participation for a first play', async () => {
    const code = await reserveCode();
    const participation = await claim(code.id, customerId, CONTEST.claimDeadline);

    expect(participation).not.toBeNull();
    expect(participation?.userId).toBe(customerId);

    const stored = await prisma.ticketCode.findUniqueOrThrow({
      where: { id: code.id },
      select: { status: true, usedAt: true },
    });

    expect(stored.status).toBe('USED');
    expect(stored.usedAt).not.toBeNull();
  });

  it('refuses a second play of the same code by the same customer', async () => {
    const code = await reserveCode();

    const first = await claim(code.id, customerId, CONTEST.claimDeadline);
    const second = await claim(code.id, customerId, CONTEST.claimDeadline);

    expect(first).not.toBeNull();
    // `null`, not a thrown error: losing the race is an ordinary outcome of UC-01, which
    // is what lets the API answer `ALREADY_USED` instead of a 500.
    expect(second).toBeNull();
  });

  it('refuses a second play by a different customer', async () => {
    const code = await reserveCode();

    const first = await claim(code.id, customerId, CONTEST.claimDeadline);
    const second = await claim(code.id, otherCustomerId, CONTEST.claimDeadline);

    expect(first).not.toBeNull();
    expect(second).toBeNull();
  });

  /**
   * The test that matters.
   *
   * Ten transactions race for one code. Exactly one must win. A read-then-write service
   * would create several participations here and only fail later, on the unique
   * constraint, as a 500.
   */
  it('lets exactly one of ten simultaneous attempts win', async () => {
    const code = await reserveCode();

    const attempts = Array.from({ length: 10 }, (_, index) =>
      claim(code.id, index % 2 === 0 ? customerId : otherCustomerId, CONTEST.claimDeadline)
    );

    const results = await Promise.all(attempts);
    const winners = results.filter((result) => result !== null);

    expect(winners).toHaveLength(1);

    const participations = await prisma.participation.count({
      where: { ticketCodeId: code.id },
    });

    expect(participations).toBe(1);
  });

  it('leaves exactly one participation per code across many concurrent plays', async () => {
    // Reserved sequentially, not with `Promise.all`: `reserveCode` excludes what it has
    // already handed out through `consumedCodeIds`, and three concurrent calls would all
    // read that list before any of them appended to it — returning the same code three
    // times. The concurrency under test is the claiming below, not the reserving.
    const codes = [await reserveCode(), await reserveCode(), await reserveCode()];

    // Three codes, four attempts each, all in flight at once.
    const attempts = codes.flatMap((code) =>
      Array.from({ length: 4 }, () => claim(code.id, customerId, CONTEST.claimDeadline))
    );

    const results = await Promise.all(attempts);

    expect(results.filter((result) => result !== null)).toHaveLength(3);

    for (const code of codes) {
      expect(await prisma.participation.count({ where: { ticketCodeId: code.id } })).toBe(1);
    }
  });

  it('refuses a voided code', async () => {
    const code = await reserveCode();

    await prisma.ticketCode.update({
      where: { id: code.id },
      data: { status: 'VOIDED', voidedReason: 'Receipt cancelled during the test' },
    });

    // A voided code is a winning ticket deliberately withdrawn from the game. It must
    // never become playable again.
    expect(await claim(code.id, customerId, CONTEST.claimDeadline)).toBeNull();
  });

  it('accepts a code a till has dispensed', async () => {
    const code = await reserveCode();

    await prisma.ticketCode.update({
      where: { id: code.id },
      data: { status: 'DISPENSED', dispensedAt: new Date(), purchaseAmountCents: 5_490 },
    });

    // DISPENSED is the nominal state of a code printed on a receipt. Refusing it would
    // mean refusing every customer who actually has a ticket.
    expect(await claim(code.id, customerId, CONTEST.claimDeadline)).not.toBeNull();
  });

  it('enforces the one-participation-per-code rule in the database, not only in code', async () => {
    const code = await reserveCode();

    await claim(code.id, customerId, CONTEST.claimDeadline);

    // Bypasses the compare-and-swap entirely and inserts a second participation directly.
    // The unique constraint on `ticketCodeId` is the last line of defence, and the one
    // that holds regardless of what the application layer does.
    await expect(
      prisma.participation.create({
        data: {
          userId: otherCustomerId,
          ticketCodeId: code.id,
          claimDeadline: CONTEST.claimDeadline,
        },
      })
    ).rejects.toThrow();
  });
});
