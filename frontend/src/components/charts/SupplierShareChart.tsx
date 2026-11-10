import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  TooltipProps,
} from "recharts";
import { formatPaise } from "../../lib/format.js";

interface SupplierShareItem {
  supplierName: string;
  totalSpendPaise: number;
  orderCount: number;
}

interface SupplierShareChartProps {
  data: SupplierShareItem[];
  height?: number;
}

const PALETTE = [
  "#C8FF2E", // ProcurePilot Volt
  "#38BDF8", // Sky blue
  "#A78BFA", // Violet
  "#F472B6", // Pink
  "#FBBF24", // Amber
  "#34D399", // Emerald
  "#94A3B8", // Slate
];

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as SupplierShareItem & { spendInr: number };
    return (
      <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
        <p className="font-semibold text-xs text-ink">{data.supplierName}</p>
        <p className="font-mono text-sm font-bold text-accent">
          {formatPaise(data.totalSpendPaise)}
        </p>
        <p className="text-xs text-muted mt-1">
          {data.orderCount} {data.orderCount === 1 ? "order fulfilled" : "orders fulfilled"}
        </p>
      </div>
    );
  }
  return null;
};

export const SupplierShareChart: React.FC<SupplierShareChartProps> = ({
  data,
  height = 280,
}) => {
  const chartData = data.map((item) => ({
    ...item,
    spendInr: item.totalSpendPaise / 100,
  }));

  if (chartData.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-card-subtle text-xs text-muted"
      >
        No supplier distribution data available yet.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="spendInr"
            nameKey="supplierName"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={PALETTE[index % PALETTE.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-xs font-medium text-ink">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
