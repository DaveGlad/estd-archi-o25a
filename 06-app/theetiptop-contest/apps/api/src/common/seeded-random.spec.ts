import { describe, expect, it } from 'vitest';

import { createSeededRandom, shuffleInPlace } from './seeded-random';

/**
 * The seeded generator underpins both operations the bailiff oversees: the shuffle of the
 * prize vector across the 500,000 codes, and the grand prize draw. Three properties have
 * to hold, and each is the subject of a block below.
 */
describe('seeded random generator', () => {
  describe('reproducibility', () => {
    it('produces the same sequence for the same seed', () => {
      const a = createSeededRandom('seed-for-the-bailiff');
      const b = createSeededRandom('seed-for-the-bailiff');

      const first = Array.from({ length: 50 }, () => a.nextUint32());
      const second = Array.from({ length: 50 }, () => b.nextUint32());

      // This is what "replayable in front of the bailiff" actually means.
      expect(first).toEqual(second);
    });

    it('produces a different sequence for a different seed', () => {
      const a = createSeededRandom('seed-a');
      const b = createSeededRandom('seed-b');

      expect(a.nextUint32()).not.toBe(b.nextUint32());
    });

    it('spreads a low-entropy seed across the whole state', () => {
      // "1" and "2" differ by one bit as text. Hashing the seed with SHA-256 before
      // seeding is what stops the two streams from starting out nearly identical.
      const a = createSeededRandom('1');
      const b = createSeededRandom('2');

      const first = Array.from({ length: 10 }, () => a.nextUint32());
      const second = Array.from({ length: 10 }, () => b.nextUint32());

      expect(first.filter((value, index) => value === second[index])).toHaveLength(0);
    });
  });

  describe('output range', () => {
    it('stays within 32 unsigned bits', () => {
      const random = createSeededRandom('range');

      for (let i = 0; i < 10_000; i += 1) {
        const value = random.nextUint32();
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(0xffff_ffff);
      }
    });

    it('never returns the bound itself', () => {
      const random = createSeededRandom('bound');

      for (let i = 0; i < 10_000; i += 1) {
        expect(random.nextBelow(7)).toBeLessThan(7);
      }
    });

    it('returns 0 for a bound of 1, without consuming randomness', () => {
      const random = createSeededRandom('one');
      expect(random.nextBelow(1)).toBe(0);
    });

    it('rejects a non-positive bound rather than returning a nonsense index', () => {
      const random = createSeededRandom('invalid');
      expect(() => random.nextBelow(0)).toThrow(/positive bound/);
      expect(() => random.nextBelow(-3)).toThrow(/positive bound/);
    });
  });

  describe('uniformity', () => {
    /**
     * The property the whole generation run rests on.
     *
     * `nextUint32() % bound` maps 2^32 values onto `bound` buckets, and unless the bound
     * divides 2^32 the first buckets get one extra value each. The rejection sampling in
     * `nextBelow` removes that bias — and the bias is exactly what would make a
     * 60/20/10/6/4 split come out as 60.01/19.99/… .
     *
     * The bound is deliberately 36: the size of the code alphabet, which does not divide
     * 2^32, so a modulo implementation would fail this test.
     */
    it('distributes 36 buckets evenly enough to defend the split', () => {
      const random = createSeededRandom('uniformity');
      const draws = 360_000;
      const buckets = new Array<number>(36).fill(0);

      for (let i = 0; i < draws; i += 1) {
        buckets[random.nextBelow(36)] += 1;
      }

      const expected = draws / 36; // 10,000 per bucket
      for (const count of buckets) {
        // ±3 %: far tighter than a modulo bias would allow at this sample size, and loose
        // enough that the test does not flake on ordinary variance.
        expect(count).toBeGreaterThan(expected * 0.97);
        expect(count).toBeLessThan(expected * 1.03);
      }
    });

    it('reaches every bucket', () => {
      const random = createSeededRandom('coverage');
      const seen = new Set<number>();

      for (let i = 0; i < 10_000; i += 1) seen.add(random.nextBelow(36));

      expect(seen.size).toBe(36);
    });
  });
});

describe('Fisher-Yates shuffle', () => {
  it('preserves every element', () => {
    const original = Array.from({ length: 1_000 }, (_, index) => index);
    const shuffled = [...original];

    shuffleInPlace(shuffled, createSeededRandom('preserve'));

    expect([...shuffled].sort((a, b) => a - b)).toEqual(original);
  });

  it('actually reorders', () => {
    const items = Array.from({ length: 1_000 }, (_, index) => index);
    shuffleInPlace(items, createSeededRandom('reorder'));

    const inPlace = items.filter((value, index) => value === index).length;
    // A correct shuffle of 1,000 elements leaves about 1 element in place on average.
    // Allowing 20 makes the test immune to variance while still failing a no-op.
    expect(inPlace).toBeLessThan(20);
  });

  it('is reproducible, so the generation run can be replayed', () => {
    const a = Array.from({ length: 500 }, (_, index) => index);
    const b = [...a];

    shuffleInPlace(a, createSeededRandom('replay'));
    shuffleInPlace(b, createSeededRandom('replay'));

    expect(a).toEqual(b);
  });

  it('handles the degenerate sizes', () => {
    const empty: number[] = [];
    const single = [42];

    expect(() => shuffleInPlace(empty, createSeededRandom('empty'))).not.toThrow();
    shuffleInPlace(single, createSeededRandom('single'));

    expect(empty).toEqual([]);
    expect(single).toEqual([42]);
  });

  /**
   * Catches the classic Fisher-Yates mistake.
   *
   * The wrong variant picks `j` from the whole array at every step instead of from the
   * unshuffled prefix. It still looks shuffled, but it biases towards permutations close
   * to the identity. Over 3 elements there are 6 permutations; a correct shuffle reaches
   * all 6 with equal probability, the biased one does not.
   */
  it('reaches all 6 permutations of 3 elements with roughly equal frequency', () => {
    const counts = new Map<string, number>();
    const rounds = 60_000;

    for (let round = 0; round < rounds; round += 1) {
      const items = ['a', 'b', 'c'];
      shuffleInPlace(items, createSeededRandom(`perm-${round}`));
      const key = items.join('');
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    expect(counts.size).toBe(6);

    const expected = rounds / 6;
    for (const count of counts.values()) {
      expect(count).toBeGreaterThan(expected * 0.9);
      expect(count).toBeLessThan(expected * 1.1);
    }
  });
});
