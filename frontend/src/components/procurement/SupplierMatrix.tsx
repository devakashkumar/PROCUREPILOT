import { useState } from "react";
import { ItemMatchResult, OptimizedLineItem } from "../../types/api.js";
import { formatInr } from "../../lib/format.js";
import { ChevronDown, ChevronUp, Layers, Check } from "lucide-react";
import { cn } from "../../lib/cn.js";

interface SupplierMatrixProps {
  matches: ItemMatchResult[];
  chosenLines: OptimizedLineItem[];
  warnings?: string[];
}

export function SupplierMatrix({ matches, chosenLines, warnings }: SupplierMatrixProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-5 sm:p-6 bg-surface border border-border rounded-[12px] flex flex-col gap-4 shadow-sm">
      {/* Header toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted" />
          <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted">
            Supplier Quote Matrix ({matches.length} items analyzed)
          </h4>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-mono text-muted hover:text-ink transition-colors cursor-pointer"
        >
          <span>{isOpen ? "Collapse" : "Compare all candidate offers"}</span>
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Warnings if any */}
      {warnings && warnings.length > 0 && (
        <div className="flex flex-col gap-1 p-3 rounded-[6px] bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-600 dark:text-amber-200">
          {warnings.map((w, idx) => (
            <div key={idx} className="flex items-start gap-1.5">
              <span className="text-amber-600 dark:text-amber-400 font-bold">NOTE:</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Collapsible Matrix table */}
      {isOpen && (
        <div className="flex flex-col gap-6 pt-2 border-t border-border">
          {matches.map((m, mIdx) => {
            const chosen = chosenLines.find((l) => l.productId === m.selectedProduct?.id);
            const offers = m.candidates[0]?.offers || [];

            return (
              <div key={mIdx} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-ink">
                  <span>{m.requirement.quantity}x {m.selectedProduct?.name}</span>
                  <span className="text-muted font-mono text-[11px]">Quotes: {offers.length}</span>
                </div>

                <div className="overflow-x-auto border border-border rounded-[6px]">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-elevated border-b border-border text-muted font-mono text-[10px] uppercase tracking-wider">
                        <th className="p-2.5">Distributor</th>
                        <th className="p-2.5 text-right">Unit Price</th>
                        <th className="p-2.5 text-right">Stock</th>
                        <th className="p-2.5 text-right">Delivery</th>
                        <th className="p-2.5 text-right">Reliability</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {offers.map((off, oIdx) => {
                        const isChosen = chosen?.supplierId === off.supplierId;

                        return (
                          <tr
                            key={oIdx}
                            className={cn(
                              "transition-colors",
                              isChosen
                                ? "bg-emerald-500/10 text-ink font-semibold"
                                : "text-muted hover:bg-surface-elevated"
                            )}
                          >
                            <td className="p-2.5">
                              <span className="text-ink">{off.supplierName || "Distributor"}</span>
                              {isChosen && (
                                <span className="ml-2 font-mono text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1 py-0.2 rounded-[2px]">
                                  Selected
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-right font-mono tabular-nums text-ink">
                              {formatInr(off.effectiveUnitPricePaise || off.basePricePaise)}
                            </td>
                            <td className="p-2.5 text-right font-mono tabular-nums">
                              {off.stockQty}
                            </td>
                            <td className="p-2.5 text-right font-mono">
                              {off.deliveryDays}d
                            </td>
                            <td className="p-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400">
                              {Math.round(off.reliabilityScore * 100)}%
                            </td>
                            <td className="p-2.5 text-center">
                              {isChosen ? (
                                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500 text-black">
                                  <Check className="h-3 w-3 stroke-[3]" />
                                </span>
                              ) : (
                                <span className="text-muted/40 font-mono text-[10px]">Alternate</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
