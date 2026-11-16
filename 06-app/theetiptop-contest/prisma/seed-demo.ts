/**
 * Realistic demonstration dataset.
 *
 * Run with:  npm run db:seed:demo
 *            npm run db:seed:demo -- --customers=3000
 *
 * `db:seed` inserts the reference data and five accounts, which is what the tests need.
 * It is not what a demonstration needs: with five participations the administrator
 * dashboard shows a single bar, the age and gender charts are one slice each, and the
 * daily curve is a flat line. None of that demonstrates anything.
 *
 * This script populates the contest the way a month of real traffic would: customers
 * spread across every age bracket, participations distributed over the days of the
 * contest with heavier weekends, codes dispensed by the ten stores with Nice in front,
 * and most prizes handed over.
 *
 * ── Properties it deliberately preserves ────────────────────────────────────────
 *
 * It does NOT fabricate codes or prizes. Every participation consumes a real AVAILABLE
 * code from the generated pool and moves it through the states the till and the site
 * would: AVAILABLE → DISPENSED → USED. So the 60/20/10/6/4 split still holds afterwards,
 * `npm run codes:verify` still passes, and the per-store statistics are computed from the
 * same column the real till endpoints write.
 *
 * It is reproducible: the whole dataset is driven by one seeded generator, so two runs
 * with the same seed produce the same customers and the same curve. That matters for a
 * demonstration — the figures on the slides still match the screen a week later.
 *
 * ⚠️ Refuses to run with NODE_ENV=production. Every account it creates shares one known
 * password, which in production would be 1 200 ways into the back office of a contest.
 */

import { hashPassword } from 'better-auth/crypto';
import { CLAIM_WINDOW_DAYS, MINIMUM_PURCHASE_CENTS } from '@theetiptop-contest/shared';

import { createSeededRandom, type SeededRandom } from '../apps/api/src/common/seeded-random';
import { CONTEST, DEMO_PASSWORD, NICE_STORE_NAME } from './reference-data';
import { createScriptClient, formatDuration } from './script-client';

const prisma = createScriptClient();

/**
 * Marks every account this script creates, so a re-run can remove exactly its own data
 * and leave the five hand-written demo accounts and the integration-test fixtures alone.
 * `.invalid` is reserved by RFC 2606 and can never be a real domain.
 */
const DEMO_DOMAIN = 'demo.theetiptop.invalid';

const DEFAULT_CUSTOMERS = 1_200;

/** Rows per insert. Same reasoning as the code generator: well inside PostgreSQL's cap. */
const BATCH_SIZE = 1_000;

function readIntArgument(name: string, fallback: number): number {
  const argument = process.argv.find((value) => value.startsWith(`--${name}=`));
  if (!argument) return fallback;

  const parsed = Number.parseInt(argument.slice(`--${name}=`.length), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/* ------------------------------------------------------------------ name pools */

const FIRST_NAMES_F = [
  'Camille', 'Léa', 'Chloé', 'Manon', 'Inès', 'Jade', 'Louise', 'Sarah', 'Emma', 'Zoé',
  'Lina', 'Anaïs', 'Clara', 'Nina', 'Alice', 'Juliette', 'Maëlys', 'Romane', 'Élise',
  'Amandine', 'Sofia', 'Leïla', 'Nour', 'Margaux', 'Céline', 'Sandrine', 'Nathalie',
  'Isabelle', 'Valérie', 'Catherine', 'Martine', 'Françoise', 'Hélène', 'Agnès',
];

const FIRST_NAMES_M = [
  'Lucas', 'Hugo', 'Nathan', 'Théo', 'Gabriel', 'Raphaël', 'Louis', 'Arthur', 'Jules',
  'Adam', 'Maël', 'Noah', 'Ethan', 'Tom', 'Antoine', 'Maxime', 'Julien', 'Thomas',
  'Nicolas', 'Guillaume', 'Sébastien', 'Olivier', 'Pierre', 'Philippe', 'Christophe',
  'Laurent', 'Patrick', 'Alain', 'Bernard', 'Michel', 'Youssef', 'Karim', 'Mehdi',
];

const LAST_NAMES = [
  'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois',
  'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David',
  'Bertrand', 'Morel', 'Fournier', 'Girard', 'Bonnet', 'Dupont', 'Lambert', 'Fontaine',
  'Rousseau', 'Vincent', 'Muller', 'Lefevre', 'Faure', 'Andre', 'Mercier', 'Blanc',
  'Guerin', 'Boyer', 'Garnier', 'Chevalier', 'Francois', 'Legrand', 'Gauthier', 'Garcia',
  'Perrin', 'Robin', 'Clement', 'Morin', 'Nicolas', 'Henry', 'Roussel', 'Mathieu',
  'Benali', 'Marchand', 'Chevallier', 'Nguyen', 'Dumont', 'Lopez', 'Fernandez',
];

/* ------------------------------------------------------- distribution weights */

/**
 * Age brackets, with weights roughly matching a premium tea retailer's customer base:
 * a 25-44 core, a solid 45-64 tail, fewer students and fewer over-65s online.
 *
 * Every bracket gets a non-zero weight on purpose. The dashboard chart has six
 * categories and a demonstration where two of them are empty reads as a broken chart
 * rather than as a finding.
 */
const AGE_BRACKETS = [
  { min: 18, max: 24, weight: 12 },
  { min: 25, max: 34, weight: 29 },
  { min: 35, max: 44, weight: 26 },
  { min: 45, max: 54, weight: 18 },
  { min: 55, max: 64, weight: 10 },
  { min: 65, max: 79, weight: 5 },
];

const GENDERS = [
  { value: 'FEMALE' as const, weight: 58 },
  { value: 'MALE' as const, weight: 36 },
  { value: 'UNDISCLOSED' as const, weight: 4 },
  { value: 'OTHER' as const, weight: 2 },
];

/** Tea buying skews female in every published panel; the weights reflect that rather than 50/50. */
const PROVIDERS = [
  { value: 'credential' as const, weight: 58 },
  { value: 'google' as const, weight: 27 },
  { value: 'facebook' as const, weight: 15 },
];

/**
 * How many codes one customer plays.
 *
 * Heavily weighted to one. A customer needs a separate receipt above 49 EUR per code, so
 * the long tail is thin — and this distribution is what makes the grand prize draw worth
 * demonstrating: a handful of customers hold five or six entries and still get one chance.
 */
const PARTICIPATION_COUNTS = [
  { value: 1, weight: 62 },
  { value: 2, weight: 21 },
  { value: 3, weight: 9 },
  { value: 4, weight: 5 },
  { value: 6, weight: 2 },
  { value: 11, weight: 1 },
];

/** Picks from a weighted list. */
function pickWeighted<T>(random: SeededRandom, items: ReadonlyArray<{ value: T; weight: number }>): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = random.nextBelow(total);

  for (const item of items) {
    roll -= item.weight;
    if (roll < 0) return item.value;
  }

  return items[items.length - 1].value;
}

function pick<T>(random: SeededRandom, items: readonly T[]): T {
  return items[random.nextBelow(items.length)];
}

/** A cuid-shaped identifier, so the demo rows are indistinguishable from real ones on screen. */
function demoId(random: SeededRandom): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'c';
  for (let i = 0; i < 24; i += 1) id += alphabet[random.nextBelow(alphabet.length)];
  return id;
}

/* -------------------------------------------------------------- the daily curve */

/**
 * Weight per day of the contest, from opening to today.
 *
 * Shaped rather than flat: a slow first days as word spreads, weekends above weekdays
 * because that is when people shop, and a lift over the last few days as the closing
 * date approaches. A uniform curve would make the dashboard chart look like a bug.
 */
function buildDailyWeights(start: Date, end: Date): Array<{ day: Date; weight: number }> {
  const days: Array<{ day: Date; weight: number }> = [];

  const total = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));

  for (let offset = 0; offset <= total; offset += 1) {
    const day = new Date(start.getTime() + offset * 86_400_000);
    const dayOfWeek = day.getUTCDay();

    // Ramp over the first week, then plateau.
    const ramp = Math.min(1, 0.35 + offset / 7);
    // Saturday and Sunday carry more traffic than a Tuesday.
    const weekend = dayOfWeek === 6 || dayOfWeek === 0 ? 1.45 : 1;
    // A lift over the closing stretch.
    const closing = offset >= total - 3 ? 1.3 : 1;

    days.push({ day, weight: Math.round(ramp * weekend * closing * 100) });
  }

  return days;
}

/** A timestamp somewhere inside the given day, during opening hours. */
function timeWithinDay(random: SeededRandom, day: Date): Date {
  // 09:00 to 20:00: a code is played after a purchase, and the stores are not open at 03:00.
  const hour = 9 + random.nextBelow(11);
  return new Date(
    Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      hour,
      random.nextBelow(60),
      random.nextBelow(60)
    )
  );
}

/* ----------------------------------------------------------------------- main */

async function main(): Promise<void> {
  if (process.env['NODE_ENV'] === 'production') {
    throw new Error(
      'Refusing to run with NODE_ENV=production: every account created here shares one known password.'
    );
  }

  const customerCount = readIntArgument('customers', DEFAULT_CUSTOMERS);
  const seed = process.argv.find((v) => v.startsWith('--seed='))?.slice('--seed='.length) ?? 'theetiptop-demo';
  const random = createSeededRandom(seed);

  const started = performance.now();

  const contest = await prisma.contest.findUnique({
    where: { slug: CONTEST.slug },
    include: { prizes: true },
  });
  if (!contest) throw new Error(`Contest "${CONTEST.slug}" not found. Run: npm run db:seed`);

  const stores = await prisma.store.findMany({ where: { active: true } });
  if (stores.length === 0) throw new Error('No store seeded. Run: npm run db:seed');

  const employees = await prisma.user.findMany({
    where: { role: { in: ['EMPLOYEE', 'ADMIN'] } },
    select: { id: true, storeId: true },
  });
  if (employees.length === 0) throw new Error('No staff account. Run: npm run db:seed');

  console.log(`Seeding a demonstration dataset (seed "${seed}")`);

  /* --- 1. Remove what a previous run of THIS script created ------------------ */
  const previous = await prisma.user.findMany({
    where: { email: { endsWith: `@${DEMO_DOMAIN}` } },
    select: { id: true },
  });

  if (previous.length > 0) {
    const ids = previous.map((user) => user.id);

    const codes = await prisma.participation.findMany({
      where: { userId: { in: ids } },
      select: { ticketCodeId: true },
    });

    await prisma.prizeRedemption.deleteMany({ where: { participation: { userId: { in: ids } } } });
    await prisma.participation.deleteMany({ where: { userId: { in: ids } } });

    // The codes go back into the pool, so re-running does not slowly consume the 500 000.
    await prisma.ticketCode.updateMany({
      where: { id: { in: codes.map((row) => row.ticketCodeId) } },
      data: {
        status: 'AVAILABLE',
        usedAt: null,
        dispensedAt: null,
        storeId: null,
        purchaseAmountCents: null,
        dispenseReference: null,
      },
    });

    await prisma.account.deleteMany({ where: { userId: { in: ids } } });
    await prisma.session.deleteMany({ where: { userId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });

    console.log(`  cleaned up      ${previous.length} customer(s) from a previous run`);
  }

  /* --- 2. Build the customers ----------------------------------------------- */
  const now = new Date();
  const curveEnd = now < contest.endsAt ? now : contest.endsAt;
  const dailyWeights = buildDailyWeights(contest.startsAt, curveEnd);

  // Hashed once and shared. The function is deliberately slow, so hashing 1 200 times
  // would take minutes for no benefit: every demo account has the same password anyway.
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  interface DemoCustomer {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    gender: 'FEMALE' | 'MALE' | 'OTHER' | 'UNDISCLOSED';
    birthDate: Date;
    postalCode: string;
    phone: string | null;
    provider: 'credential' | 'google' | 'facebook';
    marketingConsent: boolean;
    createdAt: Date;
    participations: number;
  }

  const customers: DemoCustomer[] = [];
  const usedEmails = new Set<string>();

  for (let index = 0; index < customerCount; index += 1) {
    const gender = pickWeighted(random, GENDERS);
    // OTHER and UNDISCLOSED still need a name: drawing from either pool keeps the
    // dataset from implying a gender the customer declined to give.
    const firstName =
      gender === 'MALE'
        ? pick(random, FIRST_NAMES_M)
        : gender === 'FEMALE'
          ? pick(random, FIRST_NAMES_F)
          : pick(random, random.nextBelow(2) === 0 ? FIRST_NAMES_F : FIRST_NAMES_M);
    const lastName = pick(random, LAST_NAMES);

    const bracket = pickWeighted(random, AGE_BRACKETS.map((b) => ({ value: b, weight: b.weight })));
    const age = bracket.min + random.nextBelow(bracket.max - bracket.min + 1);
    const birthDate = new Date(
      Date.UTC(now.getUTCFullYear() - age, random.nextBelow(12), 1 + random.nextBelow(28))
    );

    // A postcode from one of the store cities, so the geography is coherent with where
    // the codes were dispensed.
    const store = pick(random, stores);

    const slug = `${firstName}.${lastName}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z.]/g, '');

    let email = `${slug}@${DEMO_DOMAIN}`;
    let suffix = 1;
    while (usedEmails.has(email)) {
      suffix += 1;
      email = `${slug}${suffix}@${DEMO_DOMAIN}`;
    }
    usedEmails.add(email);

    // Registered on or shortly before the day they first played.
    const signupDay = pickWeighted(random, dailyWeights.map((d) => ({ value: d.day, weight: d.weight })));

    customers.push({
      id: demoId(random),
      email,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      gender,
      birthDate,
      postalCode: store.postalCode,
      phone: random.nextBelow(100) < 45 ? `06 ${10 + random.nextBelow(80)} ${10 + random.nextBelow(80)} ${10 + random.nextBelow(80)} ${10 + random.nextBelow(80)}` : null,
      provider: pickWeighted(random, PROVIDERS),
      marketingConsent: random.nextBelow(100) < 55,
      createdAt: timeWithinDay(random, signupDay),
      participations: pickWeighted(random, PARTICIPATION_COUNTS),
    });
  }

  const totalParticipations = customers.reduce((sum, c) => sum + c.participations, 0);

  /* --- 3. Reserve the codes -------------------------------------------------- */
  const available = await prisma.ticketCode.findMany({
    where: { contestId: contest.id, status: 'AVAILABLE' },
    select: { id: true },
    // Taken from the middle of the pool, so this script does not compete with the
    // integration suite (which takes from the end) or the e2e suite (from the start).
    orderBy: { id: 'asc' },
    skip: 1_000,
    take: totalParticipations,
  });

  if (available.length < totalParticipations) {
    throw new Error(
      `Only ${available.length} AVAILABLE codes left, ${totalParticipations} needed. ` +
        'Run: npm run codes:reset && npm run codes:generate'
    );
  }

  /* --- 4. Insert ------------------------------------------------------------- */
  await insertInBatches('customers', customers, (batch) =>
    prisma.user.createMany({
      data: batch.map((c) => ({
        id: c.id,
        email: c.email,
        emailVerified: true,
        name: c.name,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        role: 'CUSTOMER',
        gender: c.gender,
        birthDate: c.birthDate,
        postalCode: c.postalCode,
        termsAcceptedAt: c.createdAt,
        contestRulesAcceptedAt: c.createdAt,
        marketingConsent: c.marketingConsent,
        marketingConsentAt: c.marketingConsent ? c.createdAt : null,
        createdAt: c.createdAt,
        updatedAt: c.createdAt,
      })),
    })
  );

  await insertInBatches('accounts', customers, (batch) =>
    prisma.account.createMany({
      data: batch.map((c) => ({
        id: demoId(random),
        accountId: c.id,
        providerId: c.provider,
        userId: c.id,
        // Only a credential account carries a hash; the two social providers do not.
        password: c.provider === 'credential' ? passwordHash : null,
        createdAt: c.createdAt,
        updatedAt: c.createdAt,
      })),
    })
  );

  // The participations, with their codes dispensed and played.
  interface DemoParticipation {
    id: string;
    userId: string;
    ticketCodeId: string;
    storeId: string;
    purchaseAmountCents: number;
    dispensedAt: Date;
    usedAt: Date;
    redeemed: boolean;
  }

  const participations: DemoParticipation[] = [];
  let codeCursor = 0;

  // Nice first: its opening is what the contest celebrates, so it carries more traffic.
  const storeWeights = stores.map((store) => ({
    value: store,
    weight: store.name === NICE_STORE_NAME ? 240 : 60 + random.nextBelow(120),
  }));

  for (const customer of customers) {
    for (let n = 0; n < customer.participations; n += 1) {
      const day = pickWeighted(random, dailyWeights.map((d) => ({ value: d.day, weight: d.weight })));
      const playedAt = timeWithinDay(random, day);
      // A code is dispensed at the till, then played minutes to hours later.
      const dispensedAt = new Date(playedAt.getTime() - (5 + random.nextBelow(180)) * 60_000);
      const store = pickWeighted(random, storeWeights);

      participations.push({
        id: demoId(random),
        userId: customer.id,
        ticketCodeId: available[codeCursor].id,
        storeId: store.id,
        // Above the threshold, with a realistic spread for a tea purchase.
        // `+ 1` because the threshold is strict: a receipt of exactly 49,00 € earns no
        // code, so the demo data must not contain one that did.
        purchaseAmountCents: MINIMUM_PURCHASE_CENTS + 1 + random.nextBelow(9_000),
        dispensedAt,
        usedAt: playedAt,
        // Most prizes get collected; the rest are still waiting.
        redeemed: random.nextBelow(100) < 62,
      });

      codeCursor += 1;
    }
  }

  await insertInBatches('codes dispensed and played', participations, async (batch) => {
    // One UPDATE per batch rather than per row: the status, the store, the amount and the
    // two timestamps all differ per code, so this is a CASE expression over the batch.
    for (const row of batch) {
      await prisma.ticketCode.update({
        where: { id: row.ticketCodeId },
        data: {
          status: 'USED',
          dispensedAt: row.dispensedAt,
          storeId: row.storeId,
          purchaseAmountCents: row.purchaseAmountCents,
          dispenseReference: `TK-${row.dispensedAt.toISOString().slice(0, 10).replace(/-/g, '')}-${row.id.slice(-6).toUpperCase()}`,
          usedAt: row.usedAt,
        },
      });
    }
    return { count: batch.length };
  });

  await insertInBatches('participations', participations, (batch) =>
    prisma.participation.createMany({
      data: batch.map((p) => ({
        id: p.id,
        userId: p.userId,
        ticketCodeId: p.ticketCodeId,
        prizeStatus: p.redeemed ? 'REDEEMED' : 'TO_CLAIM',
        claimDeadline: contest.claimDeadline,
        createdAt: p.usedAt,
      })),
    })
  );

  const redeemed = participations.filter((p) => p.redeemed);

  await insertInBatches('prizes handed over', redeemed, (batch) =>
    prisma.prizeRedemption.createMany({
      data: batch.map((p) => {
        const issuer = pick(random, employees);
        // Handed over between the day it was won and today.
        const span = Math.max(1, Math.round((now.getTime() - p.usedAt.getTime()) / 86_400_000));
        const issuedAt = new Date(p.usedAt.getTime() + random.nextBelow(span) * 86_400_000 + 3_600_000);

        // A small share is claimed online, which the brief allows.
        const online = random.nextBelow(100) < 12;

        return {
          id: demoId(random),
          participationId: p.id,
          issuedById: issuer.id,
          storeId: online ? null : (issuer.storeId ?? p.storeId),
          channel: online ? ('ONLINE' as const) : ('IN_STORE' as const),
          issuedAt: issuedAt > now ? now : issuedAt,
        };
      }),
    })
  );

  /* --- 5. Report ------------------------------------------------------------- */
  const elapsed = performance.now() - started;

  const [userTotal, participationTotal, redemptionTotal, optIn, codesUsed] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.participation.count(),
    prisma.prizeRedemption.count(),
    prisma.user.count({ where: { role: 'CUSTOMER', marketingConsent: true } }),
    prisma.ticketCode.count({ where: { contestId: contest.id, status: 'USED' } }),
  ]);

  const n = (value: number) => value.toLocaleString('fr-FR');

  console.log(`\nDemonstration dataset in place, in ${formatDuration(elapsed)}`);
  console.log(`  customers          ${n(userTotal)}`);
  console.log(`  participations     ${n(participationTotal)}`);
  console.log(`  codes played       ${n(codesUsed)} of 500 000`);
  console.log(`  prizes handed over ${n(redemptionTotal)}`);
  console.log(`  mailing opt-in     ${n(optIn)}`);
  console.log(`  contest days       ${dailyWeights.length}`);
  console.log(`\nThe 60/20/10/6/4 split is untouched: verify with npm run codes:verify`);
  console.log(`Every account's password is "${DEMO_PASSWORD}"`);
}

/** Inserts in batches, reporting progress. */
async function insertInBatches<T>(
  label: string,
  rows: readonly T[],
  insert: (batch: T[]) => Promise<{ count: number }>
): Promise<void> {
  if (rows.length === 0) {
    console.log(`  ${label.padEnd(28)} none`);
    return;
  }

  const started = performance.now();
  let done = 0;

  for (let offset = 0; offset < rows.length; offset += BATCH_SIZE) {
    const batch = rows.slice(offset, offset + BATCH_SIZE) as T[];
    const result = await insert(batch);
    done += result.count;
  }

  console.log(
    `  ${label.padEnd(28)} ${done.toLocaleString('fr-FR')} in ${formatDuration(performance.now() - started)}`
  );
}

main()
  .catch((error: unknown) => {
    console.error('\nDemo seed failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
