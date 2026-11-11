import { defineConfig } from 'vitest/config';

// `.mts` rather than `.ts`: still TypeScript, but with an extension that tells Vite's
// native config loader the file is ESM. With a plain `.ts` and no `"type": "module"` in
// the root package.json, Vite warns on every run that it is loading ESM syntax as
// CommonJS — and that loader is slated to become the default.

/**
 * Vitest configuration for the whole workspace.
 *
 * Two projects, split by what they need rather than by where the files live:
 *
 *   - **unit** needs nothing. Pure functions: the prize split, the seeded generator, the
 *     CSV escaping, the age computation. They run in milliseconds and in parallel, which
 *     is what makes them worth running on every commit.
 *
 *   - **integration** needs PostgreSQL and the 500,000 generated codes. These are the
 *     tests that actually prove the brief's requirement — that the 60/20/10/6/4% split is
 *     respected — because they count it in the database rather than in a mock. They run
 *     single-file-at-a-time against one shared database, hence `fileParallelism: false`.
 *
 * The brief requires the test reports to be exported to Jenkins, so both projects emit
 * JUnit XML alongside the human-readable output. Jenkins' `junit` step reads those files
 * and turns a failing split into a failing build.
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['{apps,packages}/**/*.spec.ts'],
          exclude: ['**/node_modules/**', '**/dist/**', '**/*.integration.spec.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'integration',
          include: ['{apps,packages,prisma}/**/*.integration.spec.ts', 'tests/**/*.integration.spec.ts'],
          exclude: ['**/node_modules/**', '**/dist/**'],
          environment: 'node',
          // One shared database: two files counting and mutating the same 500,000 rows in
          // parallel would make each other's assertions non-deterministic.
          fileParallelism: false,
          // Counting and fingerprinting 500,000 rows is not a millisecond operation.
          testTimeout: 120_000,
          hookTimeout: 120_000,
        },
      },
    ],

    reporters: [
      'default',
      // Consumed by the Jenkins `junit` step. Written to a path the pipeline archives.
      ['junit', { outputFile: 'reports/junit/vitest.xml', suiteName: 'theetiptop-contest' }],
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      reportsDirectory: 'reports/coverage',
      // Only the code the tests are actually about. Counting generated Prisma output or a
      // page component in the same figure makes the number meaningless.
      include: [
        'packages/shared/src/**/*.ts',
        'apps/api/src/common/**/*.ts',
        'apps/api/src/modules/**/*.service.ts',
        'prisma/prng.ts',
      ],
      exclude: ['**/*.spec.ts', 'apps/api/src/generated/**'],
    },
  },
});
