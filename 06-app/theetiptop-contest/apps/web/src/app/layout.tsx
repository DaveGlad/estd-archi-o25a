import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'WONK'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://dsp5-archi-o25a-15m-g1.fr'),
  title: {
    default: 'Le Grand Jeu Thé Tip Top, 100 % des tickets sont gagnants',
    template: '%s | Le Grand Jeu Thé Tip Top',
  },
  description:
    "Pour l'ouverture de notre dixième boutique à Nice, tout ticket de caisse de plus de 49 € porte un code gagnant. Saisissez le vôtre et découvrez votre lot.",
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Le Grand Jeu Thé Tip Top',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
