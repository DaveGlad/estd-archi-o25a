import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Container, PageHeader } from '@theetiptop-contest/ui/container';
import { getCurrentUser } from '@theetiptop-contest/api-client/server';

const links = [
  { href: '/mon-compte', label: 'Mes gains' },
  { href: '/mon-compte/informations', label: 'Mes informations' },
  { href: '/mon-compte/confidentialite', label: 'Mes données et confidentialité' },
];

/**
 * Guards the whole personal area.
 *
 * Checked in the layout rather than in each page: a layout wraps every route beneath it,
 * so a page added later is protected by default. The alternative — a check per page — is
 * how one screen ends up reachable without a session after a refactor.
 *
 * The API enforces this independently; this redirect is about not showing a visitor an
 * empty, broken page.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/connexion?next=/mon-compte');

  return (
    <>
      <PageHeader
        eyebrow="Mon compte"
        title={`${user.firstName} ${user.lastName}`}
        intro={user.email}
      />
      <Container className="grid gap-10 py-12 lg:grid-cols-[240px_1fr] lg:items-start">
        <nav aria-label="Navigation de mon compte">
          <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
            {links.map((link) => (
              <li key={link.href} className="shrink-0">
                <Link
                  href={link.href}
                  className="block rounded-[var(--radius-sm)] px-3 py-2 text-sm whitespace-nowrap text-fg-muted hover:bg-muted hover:text-fg"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>{children}</div>
      </Container>
    </>
  );
}
