import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib/utils';

/**
 * The card carries a light inner rule along its top edge.
 *
 * That is what gives it relief without a drop shadow, and what avoids the flat
 * "outlined rectangle" look a plain border produces.
 */
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-[14px] border border-border bg-surface',
        'shadow-[0_1px_0_0_color-mix(in_oklab,var(--bg)_70%,white)_inset]',
        className
      )}
      {...props}
    />
  );
}

/**
 * Clickable variant. The hover lift stays at a single pixel: enough to read as
 * interactive, not enough to make a grid of cards feel unstable.
 */
export function CardInteractive({ className, ...props }: ComponentProps<'div'>) {
  return (
    <Card
      className={cn(
        'transition-[border-color,transform,box-shadow] duration-200',
        'hover:-translate-y-px hover:border-fg-muted/35',
        'hover:shadow-[0_2px_14px_-6px_color-mix(in_oklab,var(--fg)_28%,transparent)]',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('px-6 pt-6 pb-1', className)} {...props} />;
}

/**
 * `children` is required, not optional.
 *
 * That is what satisfies `jsx-a11y/heading-has-content`, and the rule is right: an empty
 * heading is announced by a screen reader as a heading with nothing in it, which breaks
 * heading navigation on the page. Making the prop required turns a runtime accessibility
 * defect into a compile error.
 *
 * It also rules out the pattern that produced the empty heading in the first place — a
 * title rendered from a value that can be undefined. The caller now has to decide what to
 * show instead.
 */
export function CardTitle({
  className,
  children,
  ...props
}: ComponentProps<'h2'> & { children: ReactNode }) {
  return (
    <h2
      className={cn('text-[19px] leading-[1.3] font-semibold tracking-[-0.01em]', className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function CardBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('px-6 py-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'border-t border-border px-6 py-4 text-[14px] leading-[1.5]',
        className
      )}
      {...props}
    />
  );
}
