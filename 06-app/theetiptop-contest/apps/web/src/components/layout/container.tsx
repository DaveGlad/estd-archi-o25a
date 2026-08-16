import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)} {...props} />;
}

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="border-b border-border bg-surface">
      <Container className="py-10 sm:py-14">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-accent-strong uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-serif text-3xl sm:text-4xl">{title}</h1>
        {intro && <p className="mt-3 max-w-2xl text-fg-muted">{intro}</p>}
      </Container>
    </header>
  );
}
