'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType } from 'react';
import {
  BarChart3,
  Download,
  LayoutDashboard,
  Search,
  Settings,
  Shuffle,
  Users,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Logo } from '../layout/logo';
import { ThemeToggle } from '../layout/theme-toggle';

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
  const items = role === 'ADMIN' ? adminNav : employeeNav;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-border bg-surface lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 p-5">
          <Link href="/" aria-label="Retour au site public">
            <Logo />
          </Link>
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
          <p className="mt-0.5 text-xs text-fg-muted">{user.email}</p>
          <button type="button" className="mt-3 text-xs underline">
            Se déconnecter
          </button>
        </div>
      </aside>

      <main id="contenu" className="flex-1 bg-bg">
        {children}
      </main>
    </div>
  );
}
