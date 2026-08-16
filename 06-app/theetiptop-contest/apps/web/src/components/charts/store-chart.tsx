'use client';

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '../ui/chart';

const config: ChartConfig = {
  codesUsed: { label: 'Codes joués', color: 'var(--chart-1)' },
};

/**
 * Ten stores ranked by volume. Horizontal, because the labels are long and the
 * comparison is a ranking rather than a trend.
 */
export function StoreChart({
  data,
}: {
  data: { name: string; codesUsed: number }[];
}) {
  return (
    <ChartContainer config={config} className="aspect-auto h-96 w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 48, bottom: 4, left: 4 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={150}
        />
        <Tooltip
          cursor={{ fill: 'var(--muted)' }}
          content={<ChartTooltipContent />}
        />
        <Bar
              isAnimationActive={false} dataKey="codesUsed" fill="var(--color-codesUsed)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
