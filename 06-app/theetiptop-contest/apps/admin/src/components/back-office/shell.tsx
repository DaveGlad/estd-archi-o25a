'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition, type ComponentType } from 'react';
import {
  BarChart3,
  Download,
  LayoutDashboard,
  Search,
  Settings,
  Shuffle,
  Users,
} from 'lucide-react';
import { cn } from '@theetiptop-contest/ui/utils';
import { Logo } from '@theetiptop-contest/ui/logo';
import { ThemeToggle } from '@theetiptop-contest/ui/theme-toggle';
import { signOut } from '@theetiptop-contest/api-client/auth';

type Item = { href: string; label: string; icon: ComponentType<{ className?: string }> };

const employeeNav: Item[] = [
  { href: '/employe', label: 'Rechercher un client', icon: Search },
];

const adminNav: Item[] = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
  { href: '/admin/participants', label: 'Participants', icon: Users },
  { href: '/admin/export', label: 'Export emailing', icon: Download },
  { href: '/admin/parametrage', label: 'Paramétrage du jeu', icon: Settings },
  { href: '/admin/tirage', label: 'Tirage au sort', icon: Shuffle },
  // An administrator settling a dispute needs to see what an employee sees; without this
  // entry the only way there would be to type the URL.
  { href: '/employe', label: 'Espace boutique', icon: Search },
];

export function BackOfficeShell({
  children,
  user,
  role,
}: {
  children: React.ReactNode;
  user: { firstName: string; lastName: string; email: string };
  role: 'EMPLOYEE' | 'ADMIN';
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, startSignOut] = useTransition();
  const items = role === 'ADMIN' ? adminNav : employeeNav;

  function handleSignOut() {
    startSignOut(async () => {
      await signOut();
      // The layouts read the session server-side, so the server components have to
      // re-render; `push` alone would leave a stale shell behind.
      router.push('/admin');
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-border bg-surface lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 p-5">
          {/* The public site is a separate application on its own host, so this is a
              plain anchor to an absolute URL rather than a <Link> to "/", which would
              resolve inside the back office. */}
          <a
            href={process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000'}
            aria-label="Retour au site public"
          >
            <Logo />
          </a>
          <ThemeToggle />
        </div>

        <div className="px-5 pb-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-fg-muted uppercase">
            {role === 'ADMIN' ? 'Back-office' : 'Espace boutique'}
          </p>
        </div>

        <nav aria-label="Navigation du back-office" className="px-3 pb-5">
          <ul className="space-y-1">
            {items.map((item) => {
              const active =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm transition-colors',
                      active
                        ? 'bg-primary text-primary-fg'
                        : 'text-fg-muted hover:bg-muted hover:text-fg'
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto hidden border-t border-border p-5 lg:block">
          <p className="text-sm font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="mt-0.5 text-sm text-fg-muted">{user.email}</p>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-3 text-sm underline disabled:opacity-60"
          >
            {signingOut ? 'Déconnexion…' : 'Se déconnecter'}
          </button>
        </div>
      </aside>

      <main id="contenu" className="flex-1 bg-bg">
        {children}
      </main>
    </div>
  );
}
