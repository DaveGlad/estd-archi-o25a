import type { ComponentProps } from 'react';
import { cn } from '../lib/utils';

/**
 * Headers at 11 px, uppercase, widely spaced; cells at 14.5 px.
 *
 * The size difference is enough to establish the hierarchy without vertical rules, which
 * add weight to a data table without adding information.
 */
export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="-mx-px overflow-x-auto">
      <table
        className={cn('w-full border-collapse text-[14.5px] leading-[1.5]', className)}
        {...props}
      />
    </div>
  );
}

export function Th({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      scope="col"
      className={cn(
        'border-b border-border px-4 py-3 text-left',
        'text-[11px] leading-none font-semibold tracking-[0.1em] text-fg-muted uppercase',
        className
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td
      className={cn('border-b border-border px-4 py-3.5 align-middle', className)}
      {...props}
    />
  );
}
