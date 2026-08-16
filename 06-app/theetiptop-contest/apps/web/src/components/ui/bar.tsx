/**
 * Jauge de proportion. Le remplissage garde toujours deux pixels visibles,
 * y compris à zéro pour cent, sans quoi une valeur nulle et une valeur
 * absente se ressemblent.
 */
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
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[14.5px] leading-[1.4]">{label}</span>
        <span className="text-[13px] leading-[1.4] text-fg-muted tabular-nums">
          {caption ?? `${pct} %`}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${label} : ${caption ?? `${pct} %`}`}
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `max(2px, ${pct}%)` }}
        />
      </div>
    </div>
  );
}
