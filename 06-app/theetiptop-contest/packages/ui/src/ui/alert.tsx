import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

type Tone = 'info' | 'success' | 'warning' | 'error';

/**
 * The coloured rule is vertical, on the left, rather than a tinted border on all four
 * sides: the block stays quiet in the page and the colour does not compete with the text.
 *
 * The icon duplicates whatever the colour conveys. That is not decoration — colour alone
 * is not an accessible signal (WCAG 1.4.1), and a red block means nothing to a reader who
 * cannot tell it apart from the warning one.
 */
const tones: Record<Tone, { box: string; rule: string; icon: string; Icon: typeof Info }> = {
  info: { box: 'bg-muted/60', rule: 'bg-fg-muted/40', icon: 'text-fg-muted', Icon: Info },
  success: { box: 'bg-success/8', rule: 'bg-success', icon: 'text-success', Icon: CheckCircle2 },
  warning: { box: 'bg-warning/8', rule: 'bg-warning', icon: 'text-warning', Icon: AlertTriangle },
  error: { box: 'bg-danger/8', rule: 'bg-danger', icon: 'text-danger', Icon: XCircle },
};

export function Alert({
  tone = 'info',
  title,
  children,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
}) {
  const { box, rule, icon, Icon } = tones[tone];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('relative overflow-hidden rounded-[12px] pr-5 pl-5', box)}
    >
      <span aria-hidden="true" className={cn('absolute inset-y-0 left-0 w-[3px]', rule)} />

      <div className="flex gap-3 py-4">
        <Icon className={cn('mt-[2px] size-[18px] shrink-0', icon)} aria-hidden="true" />
        <div className="space-y-1">
          {title && (
            <p className="text-[15px] leading-[1.4] font-semibold tracking-[-0.005em]">
              {title}
            </p>
          )}
          <div className="space-y-2 text-[14.5px] leading-[1.55] text-fg-muted">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
