import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Gift, Lock, ShieldCheck } from 'lucide-react';
import { getCurrentUser } from '@theetiptop-contest/api-client/server';

import { AuthShell, LegalNote } from '../../../components/auth/auth-shell';
import { LoginForm } from '../../../components/auth/login-form';
import { OAuthButtons } from '../../../components/auth/oauth-buttons';

export const metadata: Metadata = {
  title: 'Se connecter',
  description:
    'Connectez-vous pour saisir vos codes et retrouver l’historique de vos gains.',
  // A login form has nothing to offer a search engine, and indexing it only creates a
  // second entry point competing with the pages that do.
  robots: { index: false, follow: true },
};

const reasons = [
  { icon: Gift, text: 'Retrouvez tous vos lots au même endroit' },
  { icon: ShieldCheck, text: 'Un gain rattaché à votre compte ne peut pas être perdu' },
  { icon: Lock, text: 'Vos données ne sont jamais cédées à des tiers' },
];

/**
 * Only internal paths are accepted as a return destination.
 *
 * Without this check, `/connexion?next=https://evil.example` would turn the login page
 * into an open redirect: a credible Thé Tip Top link that drops the visitor on somebody
 * else's site right after they typed their password.
 */
function safeNext(raw: string | undefined): string {
  if (!raw) return '/mon-compte';
  // Must start with a single slash: `//evil.example` is protocol-relative and leaves the site.
  return /^\/(?!\/)/.test(raw) ? raw : '/mon-compte';
}

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const destination = safeNext(next);

  // Already signed in: send them where they were going instead of showing a login form
  // they do not need.
  if (user) redirect(destination);

  return (
    <AuthShell
      title="Se connecter"
      intro="Retrouvez vos gains et saisissez de nouveaux codes."
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link
            href={`/inscription?next=${encodeURIComponent(destination)}`}
            className="font-medium underline"
          >
            Créer un compte
          </Link>
        </>
      }
      aside={
        <div>
          <h2 className="font-serif text-2xl">Pourquoi un compte ?</h2>
          <ul className="mt-6 space-y-4">
            {reasons.map((reason) => (
              <li key={reason.text} className="flex gap-3 text-sm">
                <reason.icon
                  className="mt-0.5 size-5 shrink-0 text-accent-strong"
                  aria-hidden="true"
                />
                <span>{reason.text}</span>
              </li>
            ))}
          </ul>
        </div>
      }
    >
      <div className="space-y-7">
        <LoginForm next={destination} />
        <OAuthButtons callbackURL={destination} />
        <LegalNote />
      </div>
    </AuthShell>
  );
}
