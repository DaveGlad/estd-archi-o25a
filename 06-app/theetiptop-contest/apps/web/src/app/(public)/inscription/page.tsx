import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Alert } from '@theetiptop-contest/ui/alert';
import { getCurrentUser } from '@theetiptop-contest/api-client/server';

import { AuthShell, LegalNote } from '../../../components/auth/auth-shell';
import { OAuthButtons } from '../../../components/auth/oauth-buttons';
import { RegisterForm } from '../../../components/auth/register-form';

export const metadata: Metadata = {
  title: 'Créer un compte',
  description:
    'Créez votre compte en quelques secondes pour jouer vos codes et suivre vos gains.',
  // Nothing here for a crawler, and indexing it creates a second entry point competing
  // with the pages that do have something to say.
  robots: { index: false, follow: true },
};

/** Only internal paths are accepted, so `?next=` cannot become an open redirect. */
function safeNext(raw: string | undefined): string {
  if (!raw) return '/participer';
  return /^\/(?!\/)/.test(raw) ? raw : '/participer';
}

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const destination = safeNext(next);

  if (user) redirect(destination);

  return (
    <AuthShell
      title="Créer un compte"
      intro="Deux minutes suffisent. Votre premier code peut être joué juste après."
      footer={
        <>
          Vous avez déjà un compte ?{' '}
          <Link
            href={`/connexion?next=${encodeURIComponent(destination)}`}
            className="font-medium underline"
          >
            Se connecter
          </Link>
        </>
      }
      aside={
        <div>
          <h2 className="font-serif text-2xl">Pourquoi ces informations ?</h2>
          <dl className="mt-6 space-y-5 text-sm">
            <div>
              <dt className="font-medium">Nom, prénom et courriel</dt>
              <dd className="mt-1 text-fg-muted">
                Pour rattacher vos gains à votre compte et vous les remettre en
                boutique.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Année de naissance et genre</dt>
              <dd className="mt-1 text-fg-muted">
                Uniquement pour établir des statistiques anonymes sur les
                gagnants. Ces données ne sont jamais utilisées à d&apos;autres
                fins.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Code postal</dt>
              <dd className="mt-1 text-fg-muted">
                Pour vous proposer la boutique la plus proche lors du retrait.
              </dd>
            </div>
          </dl>
        </div>
      }
    >
      <div className="space-y-7">
        <RegisterForm next={destination} />

        <OAuthButtons label="S’inscrire" callbackURL={destination} />

        <Alert tone="info">
          <p>
            Un seul compte est autorisé par personne. La création de plusieurs
            comptes entraîne l&apos;annulation des participations.
          </p>
        </Alert>

        <LegalNote />
      </div>
    </AuthShell>
  );
}
