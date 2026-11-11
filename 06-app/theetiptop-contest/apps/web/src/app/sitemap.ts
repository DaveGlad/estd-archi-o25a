import type { MetadataRoute } from 'next';

const BASE = 'https://dsp5-archi-o25a-15m-g1.fr';

/**
 * Generated from code rather than maintained by hand, so a route added later cannot be
 * forgotten here.
 *
 * The back office and the in-store area are excluded; they are also blocked in robots.txt
 * and carry an `X-Robots-Tag: noindex` header. Three layers, because the back office holds
 * customer names and prize history.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date('2026-11-18');

  const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '', priority: 1, changeFrequency: 'daily' },
    { path: '/jeu-concours', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/jeu-concours/lots', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/jeu-concours/reglement', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/participer', priority: 0.9, changeFrequency: 'daily' },
    { path: '/boutiques', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/connexion', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/inscription', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/mentions-legales', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/cgu', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/confidentialite', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/cookies', priority: 0.2, changeFrequency: 'yearly' },
  ];

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
