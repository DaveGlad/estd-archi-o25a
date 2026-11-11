/**
 * Re-export of the seeded generator, whose canonical implementation lives with the API.
 *
 * Both callers need exactly the same algorithm: `generate-codes.ts` shuffles the prize
 * vector with it, and `DrawService` draws the grand prize winner with it. Two copies would
 * be two things to keep in step, and the one property both operations have to be able to
 * defend in front of the bailiff is that the generator is the one that was described.
 *
 * It is NOT in `@theetiptop-contest/shared`: that package is types and constants only, with
 * no runtime dependency, so it can be imported by a browser bundle. This generator derives
 * its state with `node:crypto`, which has no place in a client bundle.
 */

export {
  createSeededRandom,
  shuffleInPlace,
  type SeededRandom,
} from '../apps/api/src/common/seeded-random.js';
