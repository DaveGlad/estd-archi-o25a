import { cn } from '../../lib/utils';

/**
 * Bloc de chargement. L'animation est portée par une classe, elle est donc
 * neutralisée par la règle prefers-reduced-motion du thème.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-[var(--radius-sm)] bg-muted', className)}
      aria-hidden="true"
    />
  );
}
