import type { ComponentProps } from 'react';
import { cn } from '../lib/utils';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent';

/**
 * 12 px, uppercase, open letter-spacing.
 *
 * The badge stays readable because it is short: widely spaced capitals are read by the
 * shape of the whole word rather than letter by letter, which stops working past three or
 * four words.
 */
const tones: Record<Tone, string> = {
  neutral: 'bg-muted text-fg-muted ring-border',
  success: 'bg-success/10 text-success ring-success/25',
  warning: 'bg-warning/12 text-warning ring-warning/25',
  danger: 'bg-danger/10 text-danger ring-danger/25',
  accent: 'bg-accent/14 text-accent-strong ring-accent/30',
};

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: ComponentProps<'span'> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] ring-1 ring-inset',
        'text-[12px] leading-none font-semibold tracking-[0.06em] uppercase',
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
