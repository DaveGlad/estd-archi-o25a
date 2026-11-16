/**
 * The site's own public address.
 *
 * Read from `NEXT_PUBLIC_SITE_URL`, which is a BUILD argument: Next.js inlines
 * `NEXT_PUBLIC_*` into the bundle at compile time, which is why there is one `web` image
 * per environment (see 05-workflow/docker/README.md).
 *
 * It used to be hardcoded in four files — the layout's `metadataBase`, the sitemap, the
 * robots file and the JSON-LD. Four copies of one fact is four chances to move three of
 * them, and the one left behind would publish a canonical URL pointing at a domain the
 * site no longer answers on. That is an SEO defect nobody notices for weeks.
 *
 * The fallback is localhost rather than a plausible production domain, deliberately: a
 * forgotten variable then produces an obviously wrong URL during review, instead of a
 * convincing one that quietly outlives the mistake.
 */
export const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000';

/** Absolute URL for a path, with no double slash whichever way SITE_URL was written. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}
