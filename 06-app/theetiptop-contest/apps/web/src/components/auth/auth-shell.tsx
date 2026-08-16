import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card, CardBody } from '../ui/card';
import { Container } from '../layout/container';

export function AuthShell({
  title,
  intro,
  children,
  footer,
  aside,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
  footer: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <Container className="grid gap-14 py-14 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:py-20">
      <div className="mx-auto w-full max-w-md lg:mx-0">
        <h1 className="font-serif text-[clamp(1.75rem,1.4rem+1.2vw,2.25rem)] leading-[1.1] tracking-[-0.02em]">
          {title}
        </h1>
        {intro && (
          <p className="mt-3 text-[16px] leading-[1.6] text-fg-muted">{intro}</p>
        )}

        <Card className="mt-8">
          <CardBody className="px-6 py-7">{children}</CardBody>
        </Card>

        <p className="mt-6 text-center text-[15px] leading-[1.5] text-fg-muted">
          {footer}
        </p>
      </div>

      {aside && (
        <aside className="hidden rounded-[14px] border border-border bg-surface p-8 lg:block">
          {aside}
        </aside>
      )}
    </Container>
  );
}

function GoogleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.01 24.01 0 000 21.56l7.98-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z"
      />
    </svg>
  );
}

/**
 * Connexions tierces, placées sous le formulaire.
 *
 * L'ordre n'est pas neutre : le formulaire reste le chemin principal, parce
 * que c'est le seul qui fonctionne quel que soit l'état de validation des
 * applications tierces. Les connexions sociales sont une
 * alternative, elles se présentent donc comme telle.
 *
 * Google garde ses couleurs officielles sur un bouton neutre, ce que ses
 * conditions d'utilisation imposent. Facebook prend son bleu de marque en
 * aplat, ce qui distingue les deux boutons autrement que par leur icône.
 *
 * Ces deux fournisseurs sont ceux nommés par le client, objectif n°2 point 2
 * de l'expression de besoin. Ils ne sont pas interchangeables.
 */
export function OAuthButtons({ label = 'Continuer' }: { label?: string }) {
  const base =
    'flex h-11 w-full items-center justify-center gap-3 rounded-[12px] text-[15px] font-medium transition-[background-color,border-color,transform] duration-150 active:scale-[0.99]';

  return (
    <div className="space-y-4">
      <div className="relative">
        <span aria-hidden="true" className="block h-px bg-border" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-3 text-[12.5px] font-medium text-fg-muted">
          ou continuer avec
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          className={`${base} border border-border bg-surface text-fg hover:border-fg-muted/45 hover:bg-muted/60`}
        >
          <GoogleIcon />
          {label} avec Google
        </button>

        <button
          type="button"
          className={`${base} border border-transparent bg-[#1877F2] text-white hover:bg-[#1568d8]`}
        >
          <FacebookIcon />
          {label} avec Facebook
        </button>
      </div>
    </div>
  );
}

export function LegalNote() {
  return (
    <p className="text-[13.5px] leading-[1.55] text-fg-muted">
      En créant un compte, vous acceptez le{' '}
      <Link href="/jeu-concours/reglement" className="underline">
        règlement du jeu
      </Link>{' '}
      et les{' '}
      <Link href="/cgu" className="underline">
        conditions générales d&apos;utilisation
      </Link>
      . Vos données sont traitées conformément à notre{' '}
      <Link href="/confidentialite" className="underline">
        politique de confidentialité
      </Link>
      .
    </p>
  );
}
