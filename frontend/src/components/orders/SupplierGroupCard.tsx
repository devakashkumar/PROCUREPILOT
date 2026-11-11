import { OptimizedSupplierGroup, OrderLine } from "../../types/api.js";
import { formatInr } from "../../lib/format.js";
import { Building2, Truck, Package } from "lucide-react";

interface SupplierGroupCardProps {
  group: OptimizedSupplierGroup;
  lines: OrderLine[];
}

export function SupplierGroupCard({ group, lines }: SupplierGroupCardProps) {
  const groupLines = lines.filter(
    (l) => l.supplierId.toString() === group.supplierId.toString()
  );

  return (
    <div className="p-5 sm:p-6 bg-surface border border-border rounded-[12px] flex flex-col gap-4 shadow-sm">
      {/* Group Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-border gap-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-[6px] bg-surface-elevated border border-border flex items-center justify-center text-ink">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink tracking-tight">{group.supplierName}</h4>
            <div className="flex items-center gap-2 text-[11px] font-mono text-muted mt-0.5">
              <span className="flex items-center gap-1">
                <Truck className="h-3 w-3" /> Est. {group.deliveryDays}d delivery
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Package className="h-3 w-3" /> {group.lineCount} item(s)
              </span>
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right font-mono">
          <div className="text-sm font-bold text-ink tabular-nums">
            {formatInr(group.subtotalPaise + group.shippingPaise)}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted">
            Shipping: {group.shippingPaise === 0 ? "FREE" : formatInr(group.shippingPaise)}
          </div>
        </div>
      </div>

      {/* Lines Table */}
      <div className="flex flex-col divide-y divide-border">
        {groupLines.map((line, idx) => (
          <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-ink bg-neutral-200 dark:bg-white/10 px-1.5 py-0.2 rounded-[3px] tabular-nums">
                {line.quantity}x
              </span>
              <span className="font-semibold text-ink">{line.productName}</span>
              <span className="text-muted font-mono text-[11px]">({formatInr(line.unitPricePaise)} / {line.unit})</span>
            </div>
            <span className="font-mono font-bold text-ink tabular-nums">{formatInr(line.lineTotalPaise)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
