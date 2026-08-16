import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent';

/**
 * 12 px, capitales, interlettrage ouvert. La pastille reste lisible parce
 * qu'elle est courte : les capitales espacées se lisent par la forme du mot
 * entier, pas lettre à lettre.
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
