/**
 * Seeds the reference data the contest cannot run without.
 *
 * Run with:  npm run db:seed
 *
 * Idempotent: every write is an upsert keyed on a natural key (contest slug, prize label,
 * store name, account email). Running it twice changes nothing, which is what lets the
 * Jenkins pipeline run it after every migration on dev and preprod without guarding it.
 *
 * It does NOT generate the 500,000 codes. That is `generate-codes.ts`: it takes about half
 * a minute, it must be measurable on its own, and it must be possible to replay the seed
 * without destroying a pool of codes that customers are already playing.
 */

import { hashPassword } from 'better-auth/crypto';
import {
  BAILIFF_NAME,
  CODE_LENGTH,
  GRAND_PRIZE,
  MINIMUM_PURCHASE_CENTS,
  PLANNED_CODE_COUNT,
  TICKET_PRIZES,
  assertDistributionIsExact,
} from '@theetiptop-contest/shared';

import { CONTEST, DEMO_ACCOUNTS, DEMO_PASSWORD, STORES } from './reference-data.js';
import { createScriptClient } from './script-client.js';

const prisma = createScriptClient();

/** Guard on the demo accounts: a known password must never reach production. */
const isProduction = process.env['NODE_ENV'] === 'production';

async function seedContest(): Promise<string> {
  const contest = await prisma.contest.upsert({
    where: { slug: CONTEST.slug },
    create: {
      name: CONTEST.name,
      slug: CONTEST.slug,
      startsAt: CONTEST.startsAt,
      endsAt: CONTEST.endsAt,
      claimDeadline: CONTEST.claimDeadline,
      minimumPurchaseCents: MINIMUM_PURCHASE_CENTS,
      plannedCodeCount: PLANNED_CODE_COUNT,
      codeLength: CODE_LENGTH,
      bailiffName: BAILIFF_NAME,
      rulesUrl: CONTEST.rulesUrl,
      rulesFiledAt: CONTEST.rulesFiledAt,
    },
    // On replay, refresh the rules but never the dates: moving `endsAt` under the feet of
    // customers who already played would change the deadline enforceable against them.
    update: {
      name: CONTEST.name,
      minimumPurchaseCents: MINIMUM_PURCHASE_CENTS,
      codeLength: CODE_LENGTH,
      bailiffName: BAILIFF_NAME,
      rulesUrl: CONTEST.rulesUrl,
    },
  });

  console.log(
    `  contest        ${contest.name} (${contest.startsAt.toISOString().slice(0, 10)} → ${contest.endsAt
      .toISOString()
      .slice(0, 10)})`
  );

  return contest.id;
}

async function seedPrizes(contestId: string): Promise<void> {
  // Fails before touching the database if the split does not add up to exactly 500,000.
  assertDistributionIsExact();

  for (const prize of TICKET_PRIZES) {
    await prisma.prize.upsert({
      where: { contestId_label: { contestId, label: prize.label } },
      create: {
        contestId,
        label: prize.label,
        description: prize.description,
        type: 'TICKET_PRIZE',
        valueCents: prize.valueCents,
        targetPercentage: prize.percentage,
        targetQuantity: prize.quantity,
        rank: prize.rank,
      },
      update: {
        description: prize.description,
        valueCents: prize.valueCents,
        targetPercentage: prize.percentage,
        targetQuantity: prize.quantity,
        rank: prize.rank,
      },
    });
  }

  await prisma.prize.upsert({
    where: { contestId_label: { contestId, label: GRAND_PRIZE.label } },
    create: {
      contestId,
      label: GRAND_PRIZE.label,
      description: GRAND_PRIZE.description,
      type: 'GRAND_PRIZE',
      valueCents: GRAND_PRIZE.valueCents,
      // Null, not zero: the grand prize is attached to no code at all, and a zero
      // percentage would read as "0% of the codes", which is a different statement.
      targetPercentage: null,
      targetQuantity: 1,
      rank: GRAND_PRIZE.rank,
    },
    update: {
      description: GRAND_PRIZE.description,
      valueCents: GRAND_PRIZE.valueCents,
      rank: GRAND_PRIZE.rank,
    },
  });

  console.log(`  prizes         ${TICKET_PRIZES.length} ticket prizes + 1 grand prize`);
}

async function seedStores(): Promise<Map<string, string>> {
  const byName = new Map<string, string>();

  for (const store of STORES) {
    // `name` is not unique in the schema, so upsert-by-name is done by hand. Making it
    // unique would be wrong: two stores in the same city could legitimately share a name.
    const existing = await prisma.store.findFirst({ where: { name: store.name } });

    const record = existing
      ? await prisma.store.update({
          where: { id: existing.id },
          data: {
            address: store.address,
            postalCode: store.postalCode,
            city: store.city,
            phone: store.phone,
            openedAt: new Date(store.openedAt),
            active: true,
          },
        })
      : await prisma.store.create({
          data: {
            name: store.name,
            address: store.address,
            postalCode: store.postalCode,
            city: store.city,
            phone: store.phone,
            openedAt: new Date(store.openedAt),
            active: true,
          },
        });

    byName.set(store.name, record.id);
  }

  console.log(`  stores         ${STORES.length}, including Nice opened on the contest start date`);
  return byName;
}

async function seedDemoAccounts(storeIds: Map<string, string>): Promise<void> {
  if (isProduction) {
    console.log('  demo accounts  skipped (NODE_ENV=production)');
    return;
  }

  // Hashed with Better Auth's own function, so the accounts are indistinguishable from
  // ones created through the sign-up form. Hashing once outside the loop: it is a
  // deliberately slow function, and all demo accounts share the same password.
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  for (const account of DEMO_ACCOUNTS) {
    const storeId = account.storeName ? (storeIds.get(account.storeName) ?? null) : null;
    const now = new Date();

    const user = await prisma.user.upsert({
      where: { email: account.email },
      create: {
        email: account.email,
        emailVerified: true,
        name: `${account.firstName} ${account.lastName}`,
        firstName: account.firstName,
        lastName: account.lastName,
        phone: account.phone,
        role: account.role,
        gender: account.gender,
        birthDate: account.birthDate ? new Date(account.birthDate) : null,
        postalCode: account.postalCode,
        storeId,
        termsAcceptedAt: now,
        contestRulesAcceptedAt: account.role === 'CUSTOMER' ? now : null,
        marketingConsent: account.marketingConsent,
        marketingConsentAt: account.marketingConsent ? now : null,
      },
      update: {
        name: `${account.firstName} ${account.lastName}`,
        firstName: account.firstName,
        lastName: account.lastName,
        role: account.role,
        storeId,
      },
    });

    // Better Auth looks the credential up by (providerId, accountId); for a password
    // account, `accountId` is the user id.
    await prisma.account.upsert({
      where: { providerId_accountId: { providerId: 'credential', accountId: user.id } },
      create: {
        accountId: user.id,
        providerId: 'credential',
        userId: user.id,
        password: passwordHash,
      },
      update: { password: passwordHash },
    });
  }

  console.log(
    `  demo accounts  ${DEMO_ACCOUNTS.length} (1 admin, 1 employee, ${
      DEMO_ACCOUNTS.filter((a) => a.role === 'CUSTOMER').length
    } customers), password "${DEMO_PASSWORD}"`
  );
}

async function main(): Promise<void> {
  console.log('Seeding reference data');

  const contestId = await seedContest();
  await seedPrizes(contestId);
  const storeIds = await seedStores();
  await seedDemoAccounts(storeIds);

  const codeCount = await prisma.ticketCode.count({ where: { contestId } });
  console.log(
    codeCount === 0
      ? `\nNo ticket code in the database yet. Run: npm run codes:generate`
      : `\n${codeCount.toLocaleString('fr-FR')} ticket codes already in the database.`
  );
}

main()
  .catch((error: unknown) => {
    console.error('\nSeed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
