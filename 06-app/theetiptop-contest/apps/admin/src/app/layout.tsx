import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './global.css';

/**
 * Same two typefaces as the public site, loaded the same way.
 *
 * `next/font` self-hosts them at build time: no request to fonts.googleapis.com at
 * runtime, which means no third-party font request to declare in the cookie banner and
 * no render-blocking round trip. It also removes the layout shift `display: 'swap'` alone
 * would leave.
 */
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
  title: {
    default: 'Back-office — Thé Tip Top',
    template: '%s | Back-office Thé Tip Top',
  },
  description: 'Administration du jeu-concours Thé Tip Top.',
  // The opposite of the public site, where indexing is a requirement. Reinforced by the
  // X-Robots-Tag header set in next.config.ts.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <head>
        {/* Applies the stored theme before the first paint. Without it a user on the dark
            theme gets a flash of the light background on every navigation. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
