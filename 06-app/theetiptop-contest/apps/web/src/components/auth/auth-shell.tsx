import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card, CardBody } from '@theetiptop-contest/ui/card';
import { Container } from '@theetiptop-contest/ui/container';

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
