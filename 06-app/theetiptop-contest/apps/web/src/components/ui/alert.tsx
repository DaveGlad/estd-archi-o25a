import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

type Tone = 'info' | 'success' | 'warning' | 'error';

const tones: Record<Tone, { box: string; Icon: typeof Info }> = {
  info: { box: 'border-border bg-muted text-fg', Icon: Info },
  success: { box: 'border-success/30 bg-success/10 text-fg', Icon: CheckCircle2 },
  warning: { box: 'border-warning/35 bg-warning/10 text-fg', Icon: AlertTriangle },
  error: { box: 'border-danger/35 bg-danger/10 text-fg', Icon: XCircle },
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
  const { box, Icon } = tones[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-[var(--radius-sm)] border p-4', box)}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="space-y-1 text-sm">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
}
