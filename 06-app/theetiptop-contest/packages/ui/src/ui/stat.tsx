import type { ReactNode } from 'react';
import { Card } from './card';

/**
 * The figure is set in roman, tabular and slightly tightened.
 *
 * Tabular is the functional half: a column of statistics stays aligned from one row to the
 * next, which proportional digits break. The tightening is what gives the tile an
 * editorial character rather than that of a generic dashboard widget.
 */
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
        <p className="text-[11px] leading-none font-semibold tracking-[0.1em] text-fg-muted uppercase">
          {label}
        </p>
        {icon && <span className="text-accent-strong">{icon}</span>}
      </div>

      <p className="mt-3 font-serif text-[34px] leading-none tracking-[-0.02em] tabular-nums">
        {value}
      </p>

      {hint && (
        <p className="mt-2 text-[13.5px] leading-[1.45] text-fg-muted">{hint}</p>
      )}
    </Card>
  );
}
