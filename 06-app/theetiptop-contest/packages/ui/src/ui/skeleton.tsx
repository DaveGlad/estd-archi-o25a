import { cn } from '../lib/utils';

/**
 * Loading placeholder.
 *
 * The animation is carried by a class, so the theme's `prefers-reduced-motion` rule
 * neutralises it — a pulsing block is exactly the kind of motion that setting exists for.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-[var(--radius-sm)] bg-muted', className)}
      aria-hidden="true"
    />
  );
}
