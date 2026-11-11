import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

/**
 * Two details separate these from a generic button.
 *
 * The label is very slightly tightened (-0.005em), which compensates for the optical
 * looseness of capitals at these weights; and pressing moves the button down by one pixel
 * rather than only changing its tint, so the press is felt as well as seen.
 */
const base =
  'group inline-flex items-center justify-center gap-2 rounded-[10px] font-medium tracking-[-0.005em] transition-[background-color,border-color,color,transform,box-shadow] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-45';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-fg shadow-[0_1px_0_0_color-mix(in_oklab,var(--primary-fg)_22%,transparent)_inset,0_1px_2px_0_color-mix(in_oklab,var(--fg)_18%,transparent)] hover:bg-primary-hover',
  secondary:
    'border border-border bg-surface text-fg hover:border-fg-muted/45 hover:bg-muted',
  ghost: 'text-fg-muted hover:bg-muted hover:text-fg',
  danger: 'bg-danger text-white hover:brightness-110',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-[52px] px-7 text-[16px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ComponentProps<'button'> & { variant?: Variant; size?: Size }) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
