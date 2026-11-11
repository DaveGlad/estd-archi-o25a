import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadDotenv } from 'dotenv';

import { PrismaClient } from '../apps/api/src/generated/prisma/client';

loadDotenv({ quiet: true });

/**
 * Helpers shared by the functional tests.
 *
 * The tests need two things the browser cannot give them: an untouched code to play, and a
 * way to put it back afterwards. Both go through a direct database connection, which is
 * the right tool — asking the UI to produce a fresh code would mean driving the till
 * endpoints through the back office on every test.
 *
 * The demo accounts come from `prisma/reference-data.ts`, so the credentials below cannot
 * drift away from what the seed actually inserts.
 */

export const ACCOUNTS = {
  customer: { email: 'camille.rousseau@example.fr', password: 'MotDePasse2026!' },
  secondCustomer: { email: 'theo.marchand@example.fr', password: 'MotDePasse2026!' },
  employee: { email: 'sofia.legrand@theetiptop.fr', password: 'MotDePasse2026!' },
  admin: { email: 'admin@theetiptop.fr', password: 'MotDePasse2026!' },
} as const;

export const CONTEST_SLUG = 'grand-jeu-2026';

function createClient(): PrismaClient {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) throw new Error('DATABASE_URL is not set. Copy .env.example to .env.');

  return new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 1 }), log: ['error'] });
}

/**
 * Takes one untouched code out of the pool.
 *
 * `orderBy: { id: 'asc' }` so the functional suite draws from the opposite end of the pool
 * to the concurrency integration suite, which takes from `desc`. The two can then run in
 * the same pipeline without competing for the same rows.
 */
export async function takeAvailableCode(): Promise<string> {
  const prisma = createClient();

  try {
    const contest = await prisma.contest.findUnique({ where: { slug: CONTEST_SLUG } });
    if (!contest) throw new Error('Contest not seeded. Run: npm run db:seed');

    const code = await prisma.ticketCode.findFirst({
      where: { contestId: contest.id, status: 'AVAILABLE' },
      select: { code: true },
      orderBy: { id: 'asc' },
    });

    if (!code) throw new Error('No AVAILABLE code left. Run: npm run codes:reset && npm run codes:generate');

    return code.code;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Puts a code and anything attached to it back to untouched.
 *
 * Called from `afterAll` so the functional suite is re-runnable, and so a failed run does
 * not leave a half-redeemed prize behind to confuse the next one.
 */
export async function releaseCode(code: string): Promise<void> {
  const prisma = createClient();

  try {
    const ticketCode = await prisma.ticketCode.findUnique({
      where: { code },
      select: { id: true, participation: { select: { id: true } } },
    });

    if (!ticketCode) return;

    if (ticketCode.participation) {
      // Children first: a redemption points at the participation.
      await prisma.prizeRedemption.deleteMany({
        where: { participationId: ticketCode.participation.id },
      });
      await prisma.participation.delete({ where: { id: ticketCode.participation.id } });
    }

    await prisma.ticketCode.update({
      where: { id: ticketCode.id },
      data: { status: 'AVAILABLE', usedAt: null, voidedReason: null },
    });
  } finally {
    await prisma.$disconnect();
  }
}

/** The prize a given code carries, so a test can assert the screen shows the right one. */
export async function prizeOfCode(code: string): Promise<string> {
  const prisma = createClient();

  try {
    const ticketCode = await prisma.ticketCode.findUnique({
      where: { code },
      select: { prize: { select: { label: true } } },
    });

    if (!ticketCode) throw new Error(`Code ${code} not found`);
    return ticketCode.prize.label;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Clears the rate-limit counters for a customer.
 *
 * The API limits code submission to 10 attempts per 10 minutes per account — the
 * brute-force protection the brief asks for. That limit is correct, and it is exactly what
 * makes a functional suite that plays several codes in a row fail on its third run of the
 * morning.
 *
 * So the suite resets its own counters before it starts, rather than the limit being
 * loosened for the tests. Loosening it would mean the pipeline no longer exercises the
 * configuration that ships.
 */
export async function clearRateLimit(email: string): Promise<void> {
  const prisma = createClient();
  const redisUrl = process.env['REDIS_URL'];

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user || !redisUrl) return;

    // Imported lazily: the module is only needed by this helper, and the fixtures file is
    // loaded by every spec including the ones that never touch Redis.
    const { default: Redis } = await import('ioredis');
    const redis = new Redis(redisUrl, { maxRetriesPerRequest: 1, lazyConnect: false });

    try {
      // Per-user key only. The per-IP window is shared with any real browsing happening on
      // the same machine, and clearing it would hide a genuine problem.
      await redis.del(`rl:participation:user:${user.id}`);
    } finally {
      await redis.quit().catch(() => redis.disconnect());
    }
  } finally {
    await prisma.$disconnect();
  }
}
