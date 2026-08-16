import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

const field =
  'w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3.5 text-fg placeholder:text-fg-muted/70 disabled:opacity-50';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(field, 'h-11', className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <select className={cn(field, 'h-11', className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(field, 'py-2.5 min-h-28', className)} {...props} />;
}
