export function Bar({
  label,
  value,
  max,
  caption,
}: {
  label: string;
  value: number;
  max: number;
  caption?: string;
}) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-fg-muted">{caption ?? `${pct} %`}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${label} : ${caption ?? `${pct} %`}`}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
