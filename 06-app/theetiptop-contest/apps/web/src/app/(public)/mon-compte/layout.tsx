import Link from 'next/link';
import { Container, PageHeader } from '../../../components/layout/container';
import { currentUser } from '../../../lib/mock';

const links = [
  { href: '/mon-compte', label: 'Mes gains' },
  { href: '/mon-compte/informations', label: 'Mes informations' },
  { href: '/mon-compte/confidentialite', label: 'Mes données et confidentialité' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = currentUser();

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
