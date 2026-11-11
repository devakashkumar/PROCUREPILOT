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
import { useUiStore } from "../../store/uiStore.js";
import { ANALYTICS_PALETTE } from "./chartTheme.js";

interface SupplierShareItem {
  supplierName: string;
  totalSpendPaise: number;
  orderCount: number;
}

interface SupplierShareChartProps {
  data: SupplierShareItem[];
  height?: number;
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as SupplierShareItem & { spendInr: number };
    return (
      <div className="rounded-[8px] border border-border bg-surface p-3 shadow-xl">
        <p className="text-xs font-bold text-ink mb-1">{data.supplierName}</p>
        <p className="font-mono text-sm font-bold text-ink tabular-nums">
          {formatPaise(data.totalSpendPaise)}
        </p>
        <p className="text-[11px] text-muted mt-1 font-mono">
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
  const { theme } = useUiStore();
  const isDark = theme === "dark";

  const chartData = data.map((item) => ({
    ...item,
    spendInr: item.totalSpendPaise / 100,
  }));

  if (chartData.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-[8px] border border-dashed border-border bg-subtle/50 text-xs font-mono text-muted"
      >
        No supplier distribution data available yet.
      </div>
    );
  }

  const sliceBorderColor = isDark ? "#0D0E12" : "#FFFFFF";

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
            stroke={sliceBorderColor}
            strokeWidth={2}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`pie-cell-${index}`}
                fill={ANALYTICS_PALETTE[index % ANALYTICS_PALETTE.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-xs font-medium text-ink/80">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
