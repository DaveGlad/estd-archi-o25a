import Link from 'next/link';
import { Container } from './container';
import { Logo } from './logo';

const columns = [
  {
    title: 'Le jeu-concours',
    links: [
      { href: '/jeu-concours', label: 'Comment participer' },
      { href: '/jeu-concours/lots', label: 'Les lots à gagner' },
      { href: '/jeu-concours/reglement', label: 'Règlement du jeu' },
      { href: '/participer', label: 'Saisir un code' },
    ],
  },
  {
    title: 'Mon compte',
    links: [
      { href: '/connexion', label: 'Se connecter' },
      { href: '/inscription', label: 'Créer un compte' },
      { href: '/mon-compte', label: 'Mes gains' },
      { href: '/mon-compte/confidentialite', label: 'Mes données' },
    ],
  },
  {
    title: 'Thé Tip Top',
    links: [
      { href: '/boutiques', label: 'Nos boutiques' },
      { href: '/contact', label: 'Nous contacter' },
    ],
  },
  {
    title: 'Informations légales',
    links: [
      { href: '/mentions-legales', label: 'Mentions légales' },
      { href: '/cgu', label: "Conditions générales d'utilisation" },
      { href: '/confidentialite', label: 'Politique de confidentialité' },
      { href: '/cookies', label: 'Gestion des cookies' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-fg-muted">
              Thés bio et faits main depuis nos dix boutiques, de Paris à Nice.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="font-serif text-sm font-semibold">{column.title}</h2>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-fg-muted hover:text-fg">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 space-y-2 border-t border-border pt-6 text-xs text-fg-muted">
          <p>
            Jeu-concours ouvert à toute personne majeure résidant en France
            métropolitaine, pour tout ticket de caisse ou facture supérieure à 49 €.
            Règlement déposé auprès de Maître Arnaud Rick, huissier de justice.
          </p>
          <p className="font-medium text-fg">
            Projet étudiant fictif réalisé dans le cadre d&apos;une formation. Aucun
            achat, aucune réservation et aucune participation réelle ne peut être
            effectué sur ce site.
          </p>
          <p>© 2026 Thé Tip Top. Site conçu par Furious Ducks.</p>
        </div>
      </Container>
    </footer>
  );
}
