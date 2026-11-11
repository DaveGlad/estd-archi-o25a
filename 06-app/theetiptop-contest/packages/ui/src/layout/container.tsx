import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib/utils';

export function Container({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('mx-auto w-full max-w-[1180px] px-5 sm:px-8', className)} {...props} />
  );
}

/** Kicker above a page or section heading. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'text-[11.5px] leading-none font-semibold tracking-[0.13em] text-accent-strong uppercase',
        className
      )}
    >
      {children}
    </p>
  );
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
      <Container className="py-12 sm:py-16">
        {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
        <h1 className="max-w-3xl font-serif text-[clamp(2rem,1.4rem+2.2vw,2.75rem)] leading-[1.1] tracking-[-0.02em]">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-[62ch] text-[17px] leading-[1.6] text-fg-muted">
            {intro}
          </p>
        )}
      </Container>
    </header>
  );
}

/** In-page section heading, following the same grammar as PageHeader. */
export function SectionHeader({
  eyebrow,
  title,
  intro,
  id,
  action,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  id: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
        <h2
          id={id}
          className="font-serif text-[clamp(1.6rem,1.2rem+1.4vw,2.125rem)] leading-[1.15] tracking-[-0.02em]"
        >
          {title}
        </h2>
        {intro && (
          <p className="mt-3 max-w-[58ch] text-[16px] leading-[1.6] text-fg-muted">
            {intro}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
