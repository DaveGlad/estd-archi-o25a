import type { MetadataRoute } from 'next';

const BASE = 'https://dsp5-archi-o25a-15m-g1.fr';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Signed-in areas. Nothing for a crawler to index, and keeping them out stops
        // the site's crawl budget being spent on pages that answer 307 to everyone.
        disallow: ['/admin', '/employe', '/mon-compte'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
