/**
 * Schema.org structured data.
 *
 * Changes nothing on screen. What it does is let a search engine understand what the
 * operation actually is, and makes the frequently-asked questions eligible for a rich
 * result — which is one of the few SEO levers that is entirely under our control.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Server-authored content only, with no user input anywhere in it. That is what
      // makes `dangerouslySetInnerHTML` acceptable here: the JSON is built from constants
      // and from the contest row, never from a request parameter.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const BASE = 'https://dsp5-archi-o25a-15m-g1.fr';

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Thé Tip Top',
  url: BASE,
  logo: `${BASE}/icon`,
  description:
    'Maison de thés bio et faits main, dix boutiques en France.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '18 rue Léon Frot',
    postalCode: '75011',
    addressLocality: 'Paris',
    addressCountry: 'FR',
  },
};

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Le Grand Jeu Thé Tip Top',
  url: BASE,
  inLanguage: 'fr-FR',
};

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE}${item.path}`,
    })),
  };
}
