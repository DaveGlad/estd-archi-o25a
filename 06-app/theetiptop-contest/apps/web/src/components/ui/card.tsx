import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

/**
 * La carte porte un filet intérieur clair sur son bord supérieur. C'est ce
 * qui lui donne du relief sans ombre portée, et ce qui évite l'aspect
 * « rectangle bordé » que produit un simple border.
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

/** Variante cliquable : le relèvement au survol reste d'un seul pixel. */
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

export function CardTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      className={cn('text-[19px] leading-[1.3] font-semibold tracking-[-0.01em]', className)}
      {...props}
    />
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
