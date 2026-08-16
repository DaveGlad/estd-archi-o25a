'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, User, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Container } from './container';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';

const nav = [
  { href: '/jeu-concours', label: 'Le jeu-concours' },
  { href: '/participer', label: 'Participer' },
  { href: '/boutiques', label: 'Nos boutiques' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Thé Tip Top, retour à l'accueil">
          <Logo />
        </Link>

        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors',
                      active ? 'bg-muted font-medium text-fg' : 'text-fg-muted hover:text-fg'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/mon-compte"
            className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted md:inline-flex"
          >
            <User className="size-4" aria-hidden="true" />
            Mon compte
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            className="grid size-10 place-items-center rounded-full border border-border md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
            <span className="sr-only">{open ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
          </button>
        </div>
      </Container>

      {open && (
        <nav id="menu-mobile" aria-label="Navigation mobile" className="border-t border-border md:hidden">
          <Container className="py-2">
            <ul className="flex flex-col">
              {[...nav, { href: '/mon-compte', label: 'Mon compte' }].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-[var(--radius-sm)] px-3 py-3 text-sm hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      )}
    </header>
  );
}
