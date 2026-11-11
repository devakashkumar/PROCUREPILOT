import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  TooltipProps,
} from "recharts";
import { formatPaise } from "../../lib/format.js";
import { useUiStore } from "../../store/uiStore.js";
import { ANALYTICS_PALETTE } from "./chartTheme.js";

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
      <div className="rounded-[8px] border border-border bg-surface p-3 shadow-xl">
        <p className="font-mono text-[11px] text-muted mb-1">{label}</p>
        <p className="font-mono text-sm font-bold text-ink tabular-nums">
          {formatPaise(data.spendPaise)}
        </p>
        <p className="text-[11px] text-muted mt-1 font-mono">
          {data.orderCount} {data.orderCount === 1 ? "order" : "orders"}
        </p>
      </div>
    );
  }
  return null;
};

export const SpendChart: React.FC<SpendChartProps> = ({ data, height = 280 }) => {
  const { theme } = useUiStore();
  const isDark = theme === "dark";

  const chartData = data.map((item) => ({
    ...item,
    spendInr: item.spendPaise / 100,
  }));

  if (chartData.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-[8px] border border-dashed border-border bg-subtle/50 text-xs font-mono text-muted"
      >
        No historical spend data yet.
      </div>
    );
  }

  const gridStroke = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
  const axisStroke = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)";
  const tickColor = isDark ? "#A1A1AA" : "#71717A";
  const cursorColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)";

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            stroke={axisStroke}
            tick={{ fill: tickColor, fontSize: 11, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: axisStroke }}
          />
          <YAxis
            stroke={axisStroke}
            tick={{ fill: tickColor, fontSize: 11, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val: number) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorColor }} />
          <Bar
            dataKey="spendInr"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`bar-cell-${index}`}
                fill={ANALYTICS_PALETTE[index % ANALYTICS_PALETTE.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
