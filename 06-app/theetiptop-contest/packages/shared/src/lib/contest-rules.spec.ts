import { describe, expect, it } from 'vitest';

import {
  CLAIM_WINDOW_DAYS,
  CODE_ALPHABET,
  CODE_LENGTH,
  CODE_PATTERN,
  CONTEST_DURATION_DAYS,
  GRAND_PRIZE,
  MINIMUM_PURCHASE_CENTS,
  PLANNED_CODE_COUNT,
  TICKET_PRIZES,
  assertDistributionIsExact,
  hasDigitsAndLetters,
  isDistributionOpen,
  isSubmissionOpen,
  qualifiesForCode,
} from './contest-rules';

/**
 * The contest rules, tested against the brief.
 *
 * These assertions are not testing the implementation — there is barely any. They pin the
 * numbers the brief dictates, so that a well-meaning edit to a percentage fails the build
 * instead of silently producing a contest whose split no longer matches the rules filed
 * with the bailiff.
 */
describe('contest rules', () => {
  it('plans exactly 500,000 codes, as the brief requires', () => {
    expect(PLANNED_CODE_COUNT).toBe(500_000);
  });

  it('uses a 10-character code', () => {
    expect(CODE_LENGTH).toBe(10);
    expect(CODE_PATTERN.test('A7K2M9QX41')).toBe(true);
    expect(CODE_PATTERN.test('A7K2M9QX4')).toBe(false); // 9 characters
    expect(CODE_PATTERN.test('A7K2M9QX412')).toBe(false); // 11 characters
    expect(CODE_PATTERN.test('a7k2m9qx41')).toBe(false); // lowercase is normalised before testing
    expect(CODE_PATTERN.test('A7K2M9QX4-')).toBe(false); // not alphanumeric
  });

  it('draws codes from 36 distinct symbols', () => {
    expect(CODE_ALPHABET).toHaveLength(36);
    // Distinct as well as 36 long: a duplicated symbol would silently shrink the code
    // space, and the collision probability in BENCHMARK.md is computed on 36.
    expect(new Set(CODE_ALPHABET).size).toBe(36);
  });

  it('sets the participation threshold at 49 EUR, in cents', () => {
    expect(MINIMUM_PURCHASE_CENTS).toBe(4_900);
  });

  it('splits the prizes 60/20/10/6/4 %', () => {
    expect(TICKET_PRIZES.map((prize) => prize.percentage)).toEqual([60, 20, 10, 6, 4]);
  });

  it('allocates quantities that match the percentages exactly', () => {
    expect(TICKET_PRIZES.map((prize) => prize.quantity)).toEqual([
      300_000, 100_000, 50_000, 30_000, 20_000,
    ]);
  });

  it('allocates every one of the 500,000 codes', () => {
    const total = TICKET_PRIZES.reduce((sum, prize) => sum + prize.quantity, 0);
    expect(total).toBe(PLANNED_CODE_COUNT);
  });

  it('passes its own consistency guard', () => {
    expect(() => assertDistributionIsExact()).not.toThrow();
  });

  it('values the grand prize at 360 EUR and attaches it to no code', () => {
    expect(GRAND_PRIZE.valueCents).toBe(36_000);
    // It is drawn at closing, not carried by a ticket: it must never appear among the
    // prizes the codes are spread over.
    expect(TICKET_PRIZES.some((prize) => prize.key === GRAND_PRIZE.key)).toBe(false);
  });

  it('gives every prize a distinct key and label', () => {
    const keys = TICKET_PRIZES.map((prize) => prize.key);
    const labels = TICKET_PRIZES.map((prize) => prize.label);

    // The label is the natural key the seed upserts on, so a duplicate would silently
    // collapse two prizes into one.
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('orders the prizes for display without gaps or duplicates', () => {
    expect(TICKET_PRIZES.map((prize) => prize.rank)).toEqual([1, 2, 3, 4, 5]);
  });
});

/**
 * The two boundaries the brief is most easily misread on.
 *
 * Both of these were wrong in the first implementation, and neither was caught by any
 * other test: the submission window was closed at `endsAt` instead of `claimDeadline`, and
 * the purchase threshold accepted exactly 49,00 €. They are boundary conditions, so they
 * are tested exactly on the boundary — a test that only checks the middle of each range
 * passes against both the correct and the incorrect implementation.
 */
describe('the contest windows', () => {
  // A contest laid out as the brief dictates: 30 days of play, then 30 more to come and
  // test a code. Fixed dates rather than offsets from "now", so the test cannot pass or
  // fail depending on the day it runs.
  const contest = {
    startsAt: new Date('2026-04-01T00:00:00.000Z'),
    endsAt: new Date('2026-04-30T23:59:59.999Z'),
    claimDeadline: new Date('2026-05-30T23:59:59.999Z'),
  };

  it('lays the fixture out as the brief does: 30 days, then 30 more', () => {
    const day = 24 * 60 * 60 * 1000;
    const play = (contest.endsAt.getTime() - contest.startsAt.getTime()) / day;
    const claim = (contest.claimDeadline.getTime() - contest.endsAt.getTime()) / day;

    expect(Math.ceil(play)).toBe(CONTEST_DURATION_DAYS);
    expect(Math.round(claim)).toBe(CLAIM_WINDOW_DAYS);
  });

  describe('ticket distribution', () => {
    it('is closed the day before the contest opens', () => {
      expect(isDistributionOpen(contest, new Date('2026-03-31T23:59:59.999Z'))).toBe(false);
    });

    it('is open on the first and the last instant of the 30 days', () => {
      expect(isDistributionOpen(contest, contest.startsAt)).toBe(true);
      expect(isDistributionOpen(contest, contest.endsAt)).toBe(true);
    });

    it('closes at `endsAt` and does NOT run into the claim window', () => {
      // The whole point of the separation: tills stop printing codes at closing, even
      // though players keep the right to play the ones already printed.
      expect(isDistributionOpen(contest, new Date('2026-05-01T00:00:00.000Z'))).toBe(false);
      expect(isDistributionOpen(contest, contest.claimDeadline)).toBe(false);
    });
  });

  describe('playing a code', () => {
    it('is refused before the contest opens', () => {
      expect(isSubmissionOpen(contest, new Date('2026-03-31T23:59:59.999Z'))).toBe(false);
    });

    it('stays open for the 30 days AFTER the contest closes', () => {
      // The regression that mattered. A customer who bought tea on the last day must be
      // able to go home, find the site, and play the code — for a further 30 days.
      expect(isSubmissionOpen(contest, new Date('2026-05-01T00:00:00.000Z'))).toBe(true);
      expect(isSubmissionOpen(contest, new Date('2026-05-15T12:00:00.000Z'))).toBe(true);
      expect(isSubmissionOpen(contest, contest.claimDeadline)).toBe(true);
    });

    it('is refused one millisecond after the claim deadline', () => {
      expect(isSubmissionOpen(contest, new Date('2026-05-31T00:00:00.000Z'))).toBe(false);
    });

    it('is open strictly longer than distribution, never shorter', () => {
      // Guards the relationship rather than the dates: whatever the bailiff amends the
      // calendar to, the player window must contain the till window.
      expect(contest.claimDeadline.getTime()).toBeGreaterThan(contest.endsAt.getTime());
    });
  });
});

describe('the purchase threshold', () => {
  it('refuses a purchase below 49 EUR', () => {
    expect(qualifiesForCode(4_899, MINIMUM_PURCHASE_CENTS)).toBe(false);
    expect(qualifiesForCode(0, MINIMUM_PURCHASE_CENTS)).toBe(false);
  });

  it('refuses a purchase of exactly 49,00 EUR', () => {
    // "une somme supérieure à 49€" — strictly above. This single assertion is the
    // difference between the brief and a plausible misreading of it.
    expect(qualifiesForCode(MINIMUM_PURCHASE_CENTS, MINIMUM_PURCHASE_CENTS)).toBe(false);
  });

  it('accepts one cent above the threshold', () => {
    expect(qualifiesForCode(4_901, MINIMUM_PURCHASE_CENTS)).toBe(true);
  });
});

describe('code composition', () => {
  it('accepts a code mixing digits and letters', () => {
    expect(hasDigitsAndLetters('A1B2C3D4E5')).toBe(true);
    expect(hasDigitsAndLetters('ABCDEFGHI9')).toBe(true);
    expect(hasDigitsAndLetters('0123456789'.slice(0, 9) + 'Z')).toBe(true);
  });

  it('refuses a code made only of letters', () => {
    // The case that actually occurs: a uniform draw over 36 symbols produces one of these
    // about 3.8% of the time, which is ~19,000 codes over a 500,000-code pool.
    expect(hasDigitsAndLetters('ABCDEFGHIJ')).toBe(false);
  });

  it('refuses a code made only of digits', () => {
    expect(hasDigitsAndLetters('0123456789')).toBe(false);
  });

  it('is a rule the format pattern deliberately does not carry', () => {
    // `CODE_PATTERN` validates what a customer types. An all-letter code is a generation
    // defect, not a typing mistake, so the pattern must keep accepting it — the right
    // answer for such an input is UNKNOWN_CODE, not INVALID_FORMAT.
    expect(CODE_PATTERN.test('ABCDEFGHIJ')).toBe(true);
    expect(hasDigitsAndLetters('ABCDEFGHIJ')).toBe(false);
  });
});
