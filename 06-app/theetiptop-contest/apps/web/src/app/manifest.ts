import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Le Grand Jeu Thé Tip Top',
    short_name: 'Thé Tip Top',
    description:
      "100 % des tickets sont gagnants. Saisissez le code de votre ticket de caisse et découvrez votre lot.",
    start_url: '/',
    display: 'standalone',
    background_color: '#fcfaf4',
    theme_color: '#185b37',
    lang: 'fr',
    categories: ['food', 'shopping'],
  };
}
