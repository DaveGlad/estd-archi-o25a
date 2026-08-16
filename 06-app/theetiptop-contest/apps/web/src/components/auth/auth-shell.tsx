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
    <Container className="grid gap-12 py-14 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:py-20">
      <div className="mx-auto w-full max-w-md lg:mx-0">
        <h1 className="font-serif text-3xl">{title}</h1>
        {intro && <p className="mt-2 text-fg-muted">{intro}</p>}

        <Card className="mt-8">
          <CardBody>{children}</CardBody>
        </Card>

        <p className="mt-6 text-center text-sm text-fg-muted">{footer}</p>
      </div>

      {aside && (
        <aside className="hidden rounded-[var(--radius)] border border-border bg-surface p-8 lg:block">
          {aside}
        </aside>
      )}
    </Container>
  );
}

export function OAuthButtons({ label }: { label: string }) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        className="flex h-11 w-full items-center justify-center gap-3 rounded-[var(--radius-sm)] border border-border bg-surface text-sm font-medium hover:bg-muted"
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21.35 11.1H12v2.9h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.95S8.78 6.2 12 6.2c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.68 3.7 14.55 2.8 12 2.8 6.98 2.8 2.9 6.88 2.9 11.9S6.98 21 12 21c5.2 0 8.65-3.66 8.65-8.8 0-.6-.07-1.05-.15-1.5Z"
          />
        </svg>
        {label} avec Google
      </button>

      <button
        type="button"
        className="flex h-11 w-full items-center justify-center gap-3 rounded-[var(--radius-sm)] border border-border bg-surface text-sm font-medium hover:bg-muted"
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path
            fill="currentColor"
            d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z"
          />
        </svg>
        {label} avec Facebook
      </button>
    </div>
  );
}

export function Separator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
      <span className="text-xs text-fg-muted">{label}</span>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
    </div>
  );
}

export function LegalNote() {
  return (
    <p className="text-sm text-fg-muted">
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
