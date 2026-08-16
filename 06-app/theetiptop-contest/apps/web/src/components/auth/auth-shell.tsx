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

function AppleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.55 4.3-3.74 4.25z"
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
 * conditions d'utilisation imposent. Apple prend son aplat noir, comme le
 * prévoient ses propres règles de marque.
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
          className={`${base} border border-transparent bg-black text-white hover:bg-black/90`}
        >
          <AppleIcon />
          {label} avec Apple
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
