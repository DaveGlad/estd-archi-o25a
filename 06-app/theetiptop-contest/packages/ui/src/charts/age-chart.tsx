'use client';

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '../ui/chart';

const config: ChartConfig = {
  count: { label: 'Participants', color: 'var(--chart-1)' },
};

/**
 * Ordered bins compared by magnitude: a single-series column chart in one hue.
 * No legend, the title already names the series.
 */
export function AgeChart({ data }: { data: { range: string; count: number }[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="range"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tickFormatter={(value: string) => `${value} ans`}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
        />
        <Tooltip
          cursor={{ fill: 'var(--muted)' }}
          content={
            <ChartTooltipContent
              labelFormatter={(label) => `${label} ans`}
            />
          }
        />
        <Bar
              isAnimationActive={false} dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
