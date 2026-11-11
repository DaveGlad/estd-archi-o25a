'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { LogOut, Menu, User, X } from 'lucide-react';
import type { Role } from '@theetiptop-contest/shared';
import { cn } from '@theetiptop-contest/ui/utils';
import { Container } from '@theetiptop-contest/ui/container';
import { Logo } from '@theetiptop-contest/ui/logo';
import { ThemeToggle } from '@theetiptop-contest/ui/theme-toggle';
import { signOut } from '@theetiptop-contest/api-client/auth';

const nav = [
  { href: '/jeu-concours', label: 'Le jeu-concours' },
  { href: '/participer', label: 'Participer' },
  { href: '/boutiques', label: 'Nos boutiques' },
  { href: '/contact', label: 'Contact' },
];

/** Only what the header renders. Not the whole `UserDto`: a header has no use for a postcode. */
interface HeaderUser {
  firstName: string;
  role: Role;
}

export function SiteHeader({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();

  function handleSignOut() {
    startSignOut(async () => {
      await signOut();
      // `refresh()` as well as `push()`: the layout read the session server-side, so the
      // server components have to re-render or the header keeps showing the old state.
      router.push('/');
      router.refresh();
    });
  }

  const accountLinks = user
    ? [{ href: '/mon-compte', label: 'Mon compte' }]
    : [
        { href: '/connexion', label: 'Se connecter' },
        { href: '/inscription', label: 'Créer un compte' },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <Container className="flex h-[72px] items-center justify-between gap-4">
        <Link href="/" aria-label="Thé Tip Top, retour à l'accueil">
          <Logo />
        </Link>

        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-1.5">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative px-3 py-2 text-[15px] leading-none transition-colors',
                      'after:absolute after:inset-x-3 after:-bottom-[7px] after:h-px after:origin-left',
                      'after:bg-accent-strong after:transition-transform after:duration-200',
                      active
                        ? 'font-medium text-fg after:scale-x-100'
                        : 'text-fg-muted after:scale-x-0 hover:text-fg hover:after:scale-x-100'
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

          {user ? (
            <>
              <Link
                href="/mon-compte"
                className="hidden h-10 items-center gap-2 rounded-full border border-border px-4 text-[14.5px] transition-colors hover:border-fg-muted/45 hover:bg-muted md:inline-flex"
              >
                <User className="size-4" aria-hidden="true" />
                {user.firstName}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="hidden size-10 place-items-center rounded-full border border-border transition-colors hover:border-fg-muted/45 hover:bg-muted disabled:opacity-60 md:grid"
              >
                <LogOut className="size-4" aria-hidden="true" />
                <span className="sr-only">Se déconnecter</span>
              </button>
            </>
          ) : (
            <Link
              href="/connexion"
              className="hidden h-10 items-center gap-2 rounded-full border border-border px-4 text-[14.5px] transition-colors hover:border-fg-muted/45 hover:bg-muted md:inline-flex"
            >
              <User className="size-4" aria-hidden="true" />
              Se connecter
            </Link>
          )}

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
        <nav
          id="menu-mobile"
          aria-label="Navigation mobile"
          className="border-t border-border md:hidden"
        >
          <Container className="py-2">
            <ul className="flex flex-col">
              {[...nav, ...accountLinks].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-[10px] px-3 py-3.5 text-[15.5px] hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {user && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      handleSignOut();
                    }}
                    disabled={signingOut}
                    className="flex w-full items-center gap-2 rounded-[10px] px-3 py-3.5 text-left text-[15.5px] hover:bg-muted disabled:opacity-60"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    Se déconnecter
                  </button>
                </li>
              )}
            </ul>
          </Container>
        </nav>
      )}
    </header>
  );
}
