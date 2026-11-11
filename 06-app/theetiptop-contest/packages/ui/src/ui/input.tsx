import type { ComponentProps } from 'react';
import { cn } from '../lib/utils';

/**
 * 16 px body text on every input: below that, iOS zooms the page in on focus, which on a
 * form is read as the layout breaking.
 *
 * The background goes from grey to white as the field is filled in, so the active state is
 * signalled by more than the focus ring alone.
 */
const field = cn(
  'w-full rounded-[10px] border border-border bg-muted/45 px-3.5 text-[16px] text-fg',
  'transition-[background-color,border-color] duration-150',
  'placeholder:text-fg-muted/60',
  'hover:border-fg-muted/40',
  'focus:border-primary focus:bg-surface',
  'disabled:cursor-not-allowed disabled:opacity-50'
);

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(field, 'h-12', className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <select className={cn(field, 'h-12 pr-9', className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea className={cn(field, 'min-h-32 py-3 leading-[1.6]', className)} {...props} />
  );
}
