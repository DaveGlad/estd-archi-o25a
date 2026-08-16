import type { MetadataRoute } from 'next';

const BASE = 'https://dsp5-archi-o25a-15m-g1.fr';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Espaces authentifiés : aucun intérêt à être exploré, et cela
        // évite de gaspiller le budget d'exploration du site.
        disallow: ['/admin', '/employe', '/mon-compte'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
