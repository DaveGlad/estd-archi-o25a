/**
 * Wipes the code pool. Development only.
 *
 * Run with:  npm run codes:reset
 *
 * Exists because generation is a one-shot operation: `generate-codes.ts` refuses to run
 * against a contest that already holds codes, which is the right behaviour in production
 * and an obstacle while developing. Rather than let a developer reach for a manual
 * `DELETE FROM`, the reset is a named script that states its own danger and refuses to run
 * when NODE_ENV is production.
 *
 * Deletes participations and redemptions too: a participation points at a code, so the
 * foreign key would block the delete, and a participation whose code no longer exists
 * would be a worse state than no participation at all.
 */

import { CONTEST } from './reference-data.js';
import { createScriptClient } from './script-client.js';

const prisma = createScriptClient();

async function main(): Promise<void> {
  if (process.env['NODE_ENV'] === 'production') {
    throw new Error('Refusing to wipe the code pool with NODE_ENV=production.');
  }

  const contest = await prisma.contest.findUnique({ where: { slug: CONTEST.slug } });
  if (!contest) throw new Error(`Contest "${CONTEST.slug}" not found.`);

  // Order matters: children first, then the codes they point at.
  const redemptions = await prisma.prizeRedemption.deleteMany({});
  const participations = await prisma.participation.deleteMany({});
  const draws = await prisma.draw.deleteMany({ where: { contestId: contest.id } });
  const codes = await prisma.ticketCode.deleteMany({ where: { contestId: contest.id } });

  // Clear the auditability metadata as well, otherwise the next verification run compares
  // the new pool against the fingerprint of the old one.
  await prisma.contest.update({
    where: { id: contest.id },
    data: {
      codesGeneratedAt: null,
      codeGenerationSeedHash: null,
      codePoolFingerprint: null,
    },
  });

  console.log(`Reset of contest "${contest.name}"`);
  console.log(`  redemptions    ${redemptions.count.toLocaleString('fr-FR')} deleted`);
  console.log(`  participations ${participations.count.toLocaleString('fr-FR')} deleted`);
  console.log(`  draws          ${draws.count.toLocaleString('fr-FR')} deleted`);
  console.log(`  codes          ${codes.count.toLocaleString('fr-FR')} deleted`);
  console.log('\nRegenerate with: npm run codes:generate');
}

main()
  .catch((error: unknown) => {
    console.error('\nReset failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
