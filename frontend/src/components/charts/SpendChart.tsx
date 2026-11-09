import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  TooltipProps,
} from "recharts";
import { formatPaise } from "../../lib/format.js";

interface MonthlySpendItem {
  month: string;
  spendPaise: number;
  orderCount: number;
}

interface SpendChartProps {
  data: MonthlySpendItem[];
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as MonthlySpendItem;
    return (
      <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
        <p className="font-semibold text-xs text-muted mb-1">{label}</p>
        <p className="font-mono text-sm font-bold text-ink">
          {formatPaise(data.spendPaise)}
        </p>
        <p className="text-xs text-muted mt-1">
          {data.orderCount} {data.orderCount === 1 ? "order" : "orders"}
        </p>
      </div>
    );
  }
  return null;
};

export const SpendChart: React.FC<SpendChartProps> = ({ data, height = 280 }) => {
  const chartData = data.map((item) => ({
    ...item,
    spendInr: item.spendPaise / 100,
  }));

  if (chartData.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-card-subtle text-xs text-muted"
      >
        No historical spend data yet.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "currentColor", fontSize: 12 }}
            className="text-muted"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "currentColor", fontSize: 12 }}
            className="text-muted"
            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(200, 255, 46, 0.08)" }} />
          <Bar
            dataKey="spendInr"
            fill="#C8FF2E"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
