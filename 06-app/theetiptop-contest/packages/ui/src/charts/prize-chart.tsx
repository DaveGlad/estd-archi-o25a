'use client';

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartTooltipContent,
  type ChartConfig,
} from '../ui/chart';

const config: ChartConfig = {
  redeemed: { label: 'Lots remis', color: 'var(--chart-1)' },
  pending: { label: 'En attente de retrait', color: 'var(--muted-strong)' },
};

/**
 * Emphasis rather than two competing series: the number that matters is the
 * share already handed over, the remainder is context and stays neutral.
 */
export function PrizeChart({
  data,
}: {
  data: { name: string; redeemed: number; pending: number }[];
}) {
  return (
    <div className="space-y-4">
      <ChartContainer config={config} className="aspect-auto h-72 w-full">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
        >
          <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            width={190}
          />
          <Tooltip
            cursor={{ fill: 'var(--muted)' }}
            content={<ChartTooltipContent />}
          />
          <Bar
              isAnimationActive={false}
            dataKey="redeemed"
            stackId="prize"
            fill="var(--color-redeemed)"
            stroke="var(--surface)"
            strokeWidth={2}
            radius={[4, 0, 0, 4]}
          />
          <Bar
              isAnimationActive={false}
            dataKey="pending"
            stackId="prize"
            fill="var(--color-pending)"
            stroke="var(--surface)"
            strokeWidth={2}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ChartContainer>

      <ChartLegend config={config} keys={['redeemed', 'pending']} />
    </div>
  );
}
