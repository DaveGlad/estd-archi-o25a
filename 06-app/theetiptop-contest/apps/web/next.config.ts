import type { NextConfig } from 'next';

/**
 * Public contest site.
 *
 * Next.js was chosen for its server rendering, which is what makes the contest pages
 * indexable — SEO is an explicit requirement of the brief, and a client-rendered
 * single-page application would hand a crawler an empty document.
 */
const nextConfig: NextConfig = {
  // The workspace packages ship TypeScript sources, not built JavaScript: that is what
  // `nx affected` needs in order to see a change in packages/ui as a change to this app.
  // Next therefore has to compile them itself rather than treat them as prebuilt deps.
  transpilePackages: ['@theetiptop-contest/ui', '@theetiptop-contest/shared'],

  // A thrown error must not be served as a 200 with a stack trace, and the standalone
  // output is what keeps the production image small — see 05-workflow/docker.
  output: 'standalone',

  // Hides the framework and version from response headers. Free, and one fewer hint for
  // an automated scanner.
  poweredByHeader: false,

  // Note: Next 16 no longer accepts an `eslint` key here. Linting is a pipeline stage of
  // its own (`nx run-many -t lint`), run in parallel with the build rather than inside it.
};

export default nextConfig;
