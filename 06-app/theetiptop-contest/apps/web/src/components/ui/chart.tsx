'use client';

import type { ComponentProps, ReactNode } from 'react';
import { createContext, useContext, useId, useMemo } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';

/**
 * Chart primitives, shadcn/ui "chart" API on top of Recharts.
 *
 * The palette is not decorative: the four categorical slots were validated with
 * the data-viz checks (lightness band, chroma floor, CVD separation, contrast
 * against the chart surface) in both light and dark mode. Slots are assigned in
 * a fixed order and never cycled. Charts carrying four series must also be
 * direct-labelled, since the green/brass pair sits in the CVD floor band in dark
 * mode and colour alone would not carry identity.
 */

export type ChartConfig = Record<
  string,
  { label: string; color?: string }
>;

const ChartContext = createContext<{ config: ChartConfig } | null>(null);

export function useChart() {
  const context = useContext(ChartContext);
  if (!context) throw new Error('useChart must be used inside a ChartContainer');
  return context;
}

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: ComponentProps<'div'> & {
  config: ChartConfig;
  children: ComponentProps<typeof ResponsiveContainer>['children'];
}) {
  const uniqueId = useId();
  const chartId = `chart-${uniqueId.replace(/:/g, '')}`;

  const colorVars = useMemo(
    () =>
      Object.entries(config)
        .filter(([, value]) => value.color)
        .map(([key, value]) => `  --color-${key}: ${value.color};`)
        .join('\n'),
    [config]
  );

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          'flex aspect-video justify-center text-xs',
          '[&_.recharts-cartesian-axis-tick_text]:fill-[var(--fg-muted)]',
          '[&_.recharts-cartesian-grid_line]:stroke-[var(--border)]',
          '[&_.recharts-surface]:overflow-visible',
          className
        )}
        {...props}
      >
        {colorVars && (
          <style
            dangerouslySetInnerHTML={{
              __html: `[data-chart=${chartId}] {\n${colorVars}\n}`,
            }}
          />
        )}
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

type TooltipPayloadItem = {
  name?: string;
  dataKey?: string | number;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
};

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter = (value: number) => value.toLocaleString('fr-FR'),
  hideLabel = false,
  nameKey,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  labelFormatter?: (label: string | number) => ReactNode;
  valueFormatter?: (value: number) => string;
  hideLabel?: boolean;
  nameKey?: string;
}) {
  const { config } = useChart();
  if (!active || !payload?.length) return null;

  const heading = hideLabel
    ? null
    : labelFormatter
      ? labelFormatter(label ?? '')
      : ((nameKey && (payload[0]?.payload?.[nameKey] as string)) ?? label);

  return (
    <div className="min-w-40 rounded-[var(--radius-sm)] border border-border bg-surface p-3 shadow-lg">
      {heading != null && heading !== '' && (
        <p className="mb-2 text-xs font-medium text-fg">{heading}</p>
      )}
      <ul className="space-y-1.5">
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index);
          const entry = config[key];
          return (
            <li key={key} className="flex items-center justify-between gap-4 text-xs">
              <span className="flex items-center gap-2 text-fg-muted">
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-[2px]"
                  style={{ background: item.color ?? entry?.color }}
                />
                {entry?.label ?? item.name ?? key}
              </span>
              <span className="font-medium text-fg tabular-nums">
                {typeof item.value === 'number'
                  ? valueFormatter(item.value)
                  : item.value}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Legend rendered outside the SVG, so it stays selectable and readable by
 * assistive technology. Identity is never carried by colour alone.
 */
export function ChartLegend({
  config,
  keys,
  className,
}: {
  config: ChartConfig;
  keys: string[];
  className?: string;
}) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-5 gap-y-2', className)}>
      {keys.map((key) => (
        <li key={key} className="flex items-center gap-2 text-xs text-fg-muted">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-[2px]"
            style={{ background: config[key]?.color }}
          />
          {config[key]?.label ?? key}
        </li>
      ))}
    </ul>
  );
}
