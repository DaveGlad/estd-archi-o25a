import Link from 'next/link';
import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './global.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'WONK'],
});

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: false },
};

const links = [
  { href: '/', label: "Retour à l'accueil" },
  { href: '/participer', label: 'Saisir un code' },
  { href: '/jeu-concours/lots', label: 'Voir les lots' },
  { href: '/contact', label: 'Nous contacter' },
];

export default function NotFound() {
  return (
    <div
      className={`${inter.variable} ${fraunces.variable} flex min-h-screen items-center justify-center px-5`}
    >
      <div className="w-full max-w-lg text-center">
        <p className="font-serif text-7xl text-accent-strong">404</p>
        <h1 className="mt-4 font-serif text-3xl">Cette page n&apos;existe pas</h1>
        <p className="mt-3 text-fg-muted">
          Le lien est peut-être incomplet, ou la page a été déplacée. Si vous
          cherchiez à jouer un code, c&apos;est par ici.
        </p>

        <ul className="mt-8 flex flex-wrap justify-center gap-3">
          {links.map((link, index) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={
                  index === 0
                    ? 'inline-flex h-11 items-center rounded-[var(--radius-sm)] bg-primary px-5 text-sm font-medium text-primary-fg hover:bg-primary-hover'
                    : 'inline-flex h-11 items-center rounded-[var(--radius-sm)] border border-border px-5 text-sm font-medium hover:bg-muted'
                }
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
