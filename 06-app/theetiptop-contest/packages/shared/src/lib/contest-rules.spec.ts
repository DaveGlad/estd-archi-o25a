import { describe, expect, it } from 'vitest';

import {
  CODE_ALPHABET,
  CODE_LENGTH,
  CODE_PATTERN,
  GRAND_PRIZE,
  MINIMUM_PURCHASE_CENTS,
  PLANNED_CODE_COUNT,
  TICKET_PRIZES,
  assertDistributionIsExact,
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
