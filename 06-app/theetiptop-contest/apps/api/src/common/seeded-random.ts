/**
 * Seeded pseudo-random generator, for the one operation that has to be replayable.
 *
 * Why not `Math.random()`: it cannot be seeded, so the code generation could never be
 * replayed in front of the bailiff.
 *
 * Why not `crypto.randomInt()` for the shuffle: same reason — unseedable, hence not
 * replayable. The seed itself IS produced by `crypto.randomBytes`, so the output is
 * unpredictable to anyone who does not hold it; see the comment block on
 * `Contest.codeGenerationSeedHash` for how the seed is kept out of the database.
 *
 * xoshiro128** is used rather than a 32-bit generator such as mulberry32: a 32-bit state
 * has only 2^32 reachable streams, which for a shuffle of 500,000 elements means the vast
 * majority of permutations are unreachable. 2^128 does not make every one of the 500,000!
 * permutations reachable either — no finite-state generator can — but it moves the limit
 * so far past any statistical test applied to a 60/20/10/6/4 split that it stops being a
 * meaningful objection. Honest statement of the limit, rather than a claim of perfection.
 */

import { createHash } from 'node:crypto';

/** Derives four 32-bit state words from an arbitrary seed string. */
function deriveState(seed: string): [number, number, number, number] {
  // SHA-256 gives 32 bytes, exactly the four 32-bit words xoshiro128** needs, and spreads
  // a low-entropy seed ("test") across the whole state instead of leaving it mostly zero.
  const digest = createHash('sha256').update(seed).digest();

  const state: [number, number, number, number] = [
    digest.readUInt32LE(0),
    digest.readUInt32LE(4),
    digest.readUInt32LE(8),
    digest.readUInt32LE(12),
  ];

  // An all-zero state is a fixed point of the generator: it would emit zeros forever.
  // Practically unreachable from SHA-256, but the check costs nothing.
  if (state.every((word) => word === 0)) state[0] = 1;

  return state;
}

export interface SeededRandom {
  /** Uniform 32-bit unsigned integer. */
  nextUint32(): number;
  /** Uniform integer in [0, bound), without modulo bias. */
  nextBelow(bound: number): number;
}

export function createSeededRandom(seed: string): SeededRandom {
  const state = deriveState(seed);

  const rotateLeft = (value: number, shift: number): number =>
    ((value << shift) | (value >>> (32 - shift))) >>> 0;

  function nextUint32(): number {
    // Math.imul keeps the multiplications in 32-bit integer space; a plain `*` would
    // overflow into a float and silently lose the low bits.
    const result = (rotateLeft(Math.imul(state[1], 5) >>> 0, 7) * 9) >>> 0;

    const t = (state[1] << 9) >>> 0;
    state[2] = (state[2] ^ state[0]) >>> 0;
    state[3] = (state[3] ^ state[1]) >>> 0;
    state[1] = (state[1] ^ state[2]) >>> 0;
    state[0] = (state[0] ^ state[3]) >>> 0;
    state[2] = (state[2] ^ t) >>> 0;
    state[3] = rotateLeft(state[3], 11);

    return result;
  }

  /**
   * Rejection sampling rather than `nextUint32() % bound`.
   *
   * Modulo maps 2^32 values onto `bound` buckets, and unless `bound` divides 2^32 the
   * first few buckets receive one more value than the rest. Over 500,000 draws that bias
   * is measurable — and the one property this generation run has to be able to defend is
   * that the 60/20/10/6/4 split is exact.
   */
  function nextBelow(bound: number): number {
    if (bound <= 0) throw new Error(`nextBelow requires a positive bound, got ${bound}`);
    if (bound === 1) return 0;

    const limit = Math.floor(0x1_0000_0000 / bound) * bound;

    let draw = nextUint32();
    while (draw >= limit) draw = nextUint32();

    return draw % bound;
  }

  return { nextUint32, nextBelow };
}

/**
 * Fisher-Yates, in place, iterating downwards.
 *
 * The downward form is the correct one: each step picks uniformly from the still-unshuffled
 * prefix, which makes every permutation equally likely. The variant that picks from the
 * whole array at each step (a common mistake) does not — it biases towards permutations
 * close to the identity.
 */
export function shuffleInPlace<T>(items: T[], random: SeededRandom): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = random.nextBelow(i + 1);
    const swap = items[i];
    items[i] = items[j];
    items[j] = swap;
  }
}
