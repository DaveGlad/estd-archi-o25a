'use client';

import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartTooltipContent,
  type ChartConfig,
} from '../ui/chart';

const config: ChartConfig = {
  FEMALE: { label: 'Femmes', color: 'var(--chart-1)' },
  MALE: { label: 'Hommes', color: 'var(--chart-2)' },
  OTHER: { label: 'Autre', color: 'var(--chart-3)' },
  UNDISCLOSED: { label: 'Non renseigné', color: 'var(--chart-4)' },
};

const keys = ['FEMALE', 'MALE', 'OTHER', 'UNDISCLOSED'] as const;

/**
 * Part-to-whole across four classes: a single horizontal stacked bar rather than
 * a pie, so the segments share a common baseline and stay comparable.
 * Four series means direct labels are mandatory, colour alone cannot carry identity.
 */
export function GenderChart({
  data,
}: {
  data: { gender: string; count: number }[];
}) {
  const total = data.reduce((sum, row) => sum + row.count, 0);
  const row = Object.fromEntries(data.map((d) => [d.gender, d.count]));
  const chartData = [{ name: 'Participants', ...row }];

  return (
    <div className="space-y-4">
      <ChartContainer config={config} className="aspect-auto h-24 w-full">
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <XAxis type="number" hide domain={[0, total]} />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          {keys.map((key, index) => (
            <Bar
              isAnimationActive={false}
              key={key}
              dataKey={key}
              stackId="gender"
              fill={`var(--color-${key})`}
              stroke="var(--surface)"
              strokeWidth={2}
              radius={
                index === 0
                  ? [4, 0, 0, 4]
                  : index === keys.length - 1
                    ? [0, 4, 4, 0]
                    : 0
              }
            />
          ))}
        </BarChart>
      </ChartContainer>

      <ChartLegend config={config} keys={[...keys]} />

      <ul className="grid gap-2 sm:grid-cols-2">
        {keys.map((key) => {
          const value = row[key] ?? 0;
          return (
            <li
              key={key}
              className="flex items-baseline justify-between gap-3 border-b border-border pb-1.5 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-[2px]"
                  style={{ background: config[key].color }}
                />
                {config[key].label}
              </span>
              <span className="tabular-nums text-fg-muted">
                {value.toLocaleString('fr-FR')} ({Math.round((value / total) * 100)} %)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
