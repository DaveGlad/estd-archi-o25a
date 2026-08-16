import type { ReactNode } from 'react';
import { Card } from './card';

export function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-fg-muted">{label}</p>
        {icon && <span className="text-accent-strong">{icon}</span>}
      </div>
      <p className="mt-2 font-serif text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-fg-muted">{hint}</p>}
    </Card>
  );
}
