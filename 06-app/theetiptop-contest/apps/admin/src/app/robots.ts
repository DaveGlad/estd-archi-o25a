import type { MetadataRoute } from 'next';

/**
 * Blocks the whole back office from crawlers.
 *
 * The weaker of the two measures in place, and kept anyway: a `robots.txt` is a request a
 * crawler may choose to honour, whereas the `X-Robots-Tag: noindex` header set in
 * `next.config.ts` is an instruction it cannot ignore. For screens holding customer names,
 * email addresses and prize history, having both is the right amount of caution.
 *
 * The public site's own `robots.txt` is the opposite — it invites indexing, because SEO is
 * an explicit requirement of the brief.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  };
}
