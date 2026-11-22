import type { NextConfig } from 'next';

/**
 * Back office: administrator dashboard and in-store employee screens.
 *
 * A second Next.js application rather than a route group inside the public site. The
 * decision and its rationale are in `DECISIONS.md` § 3: the public site is the exposed
 * surface, indexed, crawled, open to anonymous visitors, and the back office is not.
 * Separating them means the administrator screens are not even reachable on the public
 * host, and the two deploy with different ingress rules.
 */
const nextConfig: NextConfig = {
  transpilePackages: ['@theetiptop-contest/ui', '@theetiptop-contest/shared'],
  output: 'standalone',
  poweredByHeader: false,

  /**
   * Serve the back office under a path prefix when one is given.
   *
   * Normally it has its own subdomain and this stays empty, which is the arrangement the
   * comment above describes. The prefix exists for the case where only ONE hostname is
   * available, a provider's default host, a demonstration server, a review environment,
   * and the three applications still have to be reachable.
   *
   * A build argument, not runtime configuration: Next.js rewrites every internal link and
   * asset URL at compile time, so the value has to be known when the bundle is produced.
   */
  basePath: process.env['NEXT_BASE_PATH'] || undefined,

  // Linting runs as its own pipeline stage (`nx run-many -t lint`), not inside the build.

  /**
   * The back office must never be indexed.
   *
   * Belt and braces alongside `robots.ts`: a `robots.txt` is a request a crawler may
   * honour, whereas `X-Robots-Tag` on every response is an instruction. For screens
   * holding customer names, email addresses and prize history, the stronger of the two is
   * the one worth having.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          // Nothing in the back office is meant to be framed by another site.
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ];
  },
};

export default nextConfig;
