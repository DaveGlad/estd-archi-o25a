/**
 * Données structurées Schema.org.
 * Elles ne changent rien à l'affichage mais permettent aux moteurs de
 * comprendre la nature de l'opération, et ouvrent l'affichage enrichi
 * sur les questions fréquentes.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Contenu figé côté serveur, aucune donnée utilisateur n'y transite.
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
