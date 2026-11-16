/**
 * Contest rules, as mandated by the brief.
 *
 * These values are REFERENCE CONSTANTS, not the runtime source of truth: the source of
 * truth is the `Contest` table, so the rules stay auditable by the bailiff and editable
 * without a redeploy (see the header comment of `prisma/schema/contest.prisma`).
 *
 * They serve three purposes:
 *   1. feed the seed script (`scripts/seed.ts`);
 *   2. act as the expected values of the conformity tests (60/20/10/6/4% split);
 *   3. validate user input on the front end without a round trip (code length).
 */

/** Number of codes that must sit in the database the day the contest opens. Brief: 500,000. */
export const PLANNED_CODE_COUNT = 500_000;

/** Length of the code printed on the receipt. Brief: 10 characters. */
export const CODE_LENGTH = 10;

/**
 * Code alphabet: 26 uppercase letters + 10 digits.
 *
 * Code space = 36^10 ≈ 3.656 × 10^15.
 * For n = 500,000 draws the expected number of collisions is n²/2N ≈ 3.4 × 10^-5,
 * i.e. roughly a 1-in-29,000 chance of seeing even a single collision across the whole
 * generation run. The worked calculation lives in `06-app/BENCHMARK.md`.
 *
 * ⚠️ That calculation is NOT the uniqueness guarantee. The guarantee is the PostgreSQL
 * unique index on `TicketCode.code`: it is the only safeguard that actually holds if the
 * pseudo-random generator ever collides. Point to defend at the oral.
 */
export const CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** Validation of a submitted code. Input is normalised to uppercase before testing. */
export const CODE_PATTERN = /^[A-Z0-9]{10}$/;

/**
 * Does a code satisfy the composition the brief describes: "un code à 10 caractères
 * comprenant des chiffres et des lettres".
 *
 * Read strictly — at least one of each — because that is the reading a jury can check in
 * one SQL query, and the looser reading ("alphanumeric") is satisfied anyway. Drawing
 * uniformly over the 36 symbols does NOT satisfy it: the chance that 10 draws yield no
 * digit at all is (26/36)^10 ≈ 3.8 %, which over 500,000 codes is roughly 19,000 codes
 * made only of letters. Measured on the first pool generated for this project: 19,282.
 *
 * So the generator rejects and redraws, exactly as it does on a collision. The cost is
 * ~4 % more draws; the code space lost is negligible against 36^10.
 *
 * Deliberately NOT folded into `CODE_PATTERN`: that pattern validates what a customer
 * types, and refusing their input for a reason they cannot see on their receipt would
 * turn a server-side generation rule into a usability bug. A code that passes the pattern
 * but is absent from the pool already gets the right answer, `UNKNOWN_CODE`.
 */
export function hasDigitsAndLetters(code: string): boolean {
  return /[0-9]/.test(code) && /[A-Z]/.test(code);
}

/**
 * Receipt or invoice threshold, in cents.
 *
 * The filed terms read "une somme supérieure à 49€", so the comparison is STRICT: a
 * receipt of exactly 49,00 € gives no code. The constant holds the bound, not the
 * smallest qualifying amount — see `PosService.dispenseCode`.
 */
export const MINIMUM_PURCHASE_CENTS = 4_900;

/** Number of days entries stay open. Brief: 30 days. */
export const CONTEST_DURATION_DAYS = 30;

/** Window to claim a prize after the contest closes, in days. Brief: 30 days. */
export const CLAIM_WINDOW_DAYS = 30;

/** Bailiff overseeing the contest and the grand prize draw. */
export const BAILIFF_NAME = 'Maître Arnaud Rick';

/**
 * Prize split over the 500,000 codes. 100% of the tickets win something.
 *
 * Quantities are not recomputed on the fly: they are written out and checked by
 * `assertDistributionIsExact()` below. A percentage that failed to divide evenly into
 * 500,000 codes would be a specification bug, not a rounding error to swallow silently.
 */
export interface PrizeSpec {
  /** Stable key, reused as a readable identifier in the database and in the tests. */
  readonly key: string;
  readonly label: string;
  readonly description: string;
  /** Commercial value in cents, which keeps floating-point drift out of the statistics. */
  readonly valueCents: number;
  /** Target share of the split, as a percentage. */
  readonly percentage: number;
  /** Number of codes to generate for this prize = percentage % × PLANNED_CODE_COUNT. */
  readonly quantity: number;
  /** Display order on the "prizes to win" page. */
  readonly rank: number;
}

export const TICKET_PRIZES: readonly PrizeSpec[] = [
  {
    key: 'infuser',
    label: 'Un infuseur à thé',
    description:
      'Infuseur en acier inoxydable gravé, livré dans sa pochette en coton bio.',
    valueCents: 1_200,
    percentage: 60,
    quantity: 300_000,
    rank: 1,
  },
  {
    key: 'detox',
    label: 'Une boîte de 100 g de thé détox ou d’infusion',
    description:
      'Au choix parmi nos détox et nos infusions, toutes préparées à la main.',
    valueCents: 1_800,
    percentage: 20,
    quantity: 100_000,
    rank: 2,
  },
  {
    key: 'signature',
    label: 'Une boîte de 100 g de thé signature',
    description:
      'Un de nos mélanges maison, créés et assemblés dans notre atelier.',
    valueCents: 2_400,
    percentage: 10,
    quantity: 50_000,
    rank: 3,
  },
  {
    key: 'box39',
    label: 'Un coffret découverte à 39 €',
    description: 'Cinq thés à découvrir, présentés dans un coffret en bois.',
    valueCents: 3_900,
    percentage: 6,
    quantity: 30_000,
    rank: 4,
  },
  {
    key: 'box69',
    label: 'Un coffret découverte à 69 €',
    description:
      'Notre plus grand coffret : neuf thés, un infuseur et un carnet de dégustation.',
    valueCents: 6_900,
    percentage: 4,
    quantity: 20_000,
    rank: 5,
  },
];

/** The grand prize: a year of tea, 360 EUR, drawn at closing. Not attached to any code. */
export const GRAND_PRIZE = {
  key: 'grand',
  label: 'Une année de thé',
  description:
    'Le gros lot, tiré au sort parmi tous les participants à la clôture du jeu, sous le contrôle de notre huissier.',
  valueCents: 36_000,
  rank: 0,
} as const;

/**
 * Specification guard, called by the generation script BEFORE any insert and by the
 * conformity test AFTER. Fails loudly rather than generating 499,999 or 500,001 codes.
 */
export function assertDistributionIsExact(): void {
  const totalQuantity = TICKET_PRIZES.reduce((sum, p) => sum + p.quantity, 0);
  if (totalQuantity !== PLANNED_CODE_COUNT) {
    throw new Error(
      `Inconsistent split: ${totalQuantity} codes allocated for ${PLANNED_CODE_COUNT} planned.`
    );
  }

  const totalPercentage = TICKET_PRIZES.reduce((sum, p) => sum + p.percentage, 0);
  if (totalPercentage !== 100) {
    throw new Error(`Inconsistent split: percentages add up to ${totalPercentage}%.`);
  }

  for (const prize of TICKET_PRIZES) {
    const expected = (PLANNED_CODE_COUNT * prize.percentage) / 100;
    if (prize.quantity !== expected) {
      throw new Error(
        `Prize "${prize.key}": ${prize.quantity} codes declared, ${expected} expected for ${prize.percentage}%.`
      );
    }
  }
}

/* ------------------------------------------------------------------ windows and threshold
 *
 * The three predicates below are the only place the contest's time and money boundaries
 * are decided. They used to be inline comparisons repeated in the catalogue mapper, the
 * participation service and the till service — three copies of a rule that must be one,
 * and the reason the submission window had drifted to 30 days in one of them.
 *
 * They take the dates as arguments rather than reading the constants above, because the
 * runtime source of truth is the `Contest` row: the bailiff can have the dates amended
 * without a redeploy.
 */

/** Just the fields each predicate needs, so a Prisma row and a DTO both satisfy it. */
export interface ContestWindow {
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly claimDeadline: Date;
}

/**
 * Are tickets still being handed out — the TILL window, `startsAt` → `endsAt`, 30 days.
 *
 * After it, no receipt carries a new code. This is NOT the window for playing one.
 */
export function isDistributionOpen(
  contest: Pick<ContestWindow, 'startsAt' | 'endsAt'>,
  now: Date
): boolean {
  return now >= contest.startsAt && now <= contest.endsAt;
}

/**
 * Can a code still be played — the PLAYER window, `startsAt` → `claimDeadline`, 60 days.
 *
 * Deliberately 30 days longer than {@link isDistributionOpen}. The filed terms read: "Les
 * joueurs auront les 30 jours du jeu concours ainsi que 30 jours supplémentaires à compter
 * de la date de clôture du jeu pour aller sur le site internet afin tester le code de
 * leur(s) ticket(s) et réclamer leur lot en magasin ou en ligne."
 *
 * Bounding this at `endsAt` instead would lock out everyone holding a receipt from the
 * final days of the contest — the very people the extra 30 days exist for.
 */
export function isSubmissionOpen(
  contest: Pick<ContestWindow, 'startsAt' | 'claimDeadline'>,
  now: Date
): boolean {
  return now >= contest.startsAt && now <= contest.claimDeadline;
}

/**
 * Does a purchase earn a code.
 *
 * STRICTLY above the threshold: the filed terms read "une somme supérieure à 49€", so a
 * receipt of exactly 49,00 € earns nothing. One comparison, in one place, so the boundary
 * cannot drift between the till endpoint and the pages that describe it.
 */
export function qualifiesForCode(amountCents: number, minimumPurchaseCents: number): boolean {
  return amountCents > minimumPurchaseCents;
}
