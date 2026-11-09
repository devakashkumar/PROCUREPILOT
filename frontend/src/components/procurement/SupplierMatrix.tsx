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
    <div className="card-sharp p-6 bg-surface border border-border rounded-[20px] flex flex-col gap-4">
      {/* Header toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
            Supplier Quote Matrix ({matches.length} items analyzed)
          </h4>
        </div>
        <button className="flex items-center gap-1 text-xs font-bold text-muted hover:text-ink">
          <span>{isOpen ? "Collapse" : "Compare all candidate offers"}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Warnings if any */}
      {warnings && warnings.length > 0 && (
        <div className="flex flex-col gap-1 p-3 rounded-[12px] bg-warning/10 border border-warning/30 text-xs font-semibold text-ink">
          {warnings.map((w, idx) => (
            <div key={idx} className="flex items-start gap-1.5">
              <span className="text-warning font-bold">Note:</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Collapsible Matrix table */}
      {isOpen && (
        <div className="flex flex-col gap-6 pt-2">
          {matches.map((m, mIdx) => {
            const chosen = chosenLines.find((l) => l.productId === m.selectedProduct?.id);
            const offers = m.candidates[0]?.offers || [];

            return (
              <div key={mIdx} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-ink">
                  <span>{m.requirement.quantity}x {m.selectedProduct?.name}</span>
                  <span className="text-muted font-normal">Candidate offers: {offers.length}</span>
                </div>

                <div className="overflow-x-auto border border-border rounded-[12px]">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-subtle border-b border-border text-muted font-bold uppercase tracking-wider">
                        <th className="p-2.5">Supplier</th>
                        <th className="p-2.5 text-right">Unit Price</th>
                        <th className="p-2.5 text-right">Stock</th>
                        <th className="p-2.5 text-right">Delivery</th>
                        <th className="p-2.5 text-right">Reliability</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map((offer, oIdx) => {
                        const isChosen = chosen?.offerId === offer.offerId;

                        return (
                          <tr
                            key={oIdx}
                            className={cn(
                              "border-b border-border/50 hover:bg-subtle/50 transition-colors",
                              isChosen && "bg-accent/10 font-bold"
                            )}
                          >
                            <td className="p-2.5 flex items-center gap-1.5">
                              {isChosen && (
                                <span className="h-4 w-4 rounded-full bg-ink text-accent flex items-center justify-center shrink-0">
                                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                                </span>
                              )}
                              <span>{offer.supplierName}</span>
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold">
                              {formatInr(offer.effectiveUnitPricePaise)}
                            </td>
                            <td className="p-2.5 text-right font-mono">
                              {offer.stockQty} units
                            </td>
                            <td className="p-2.5 text-right font-mono">
                              {offer.deliveryDays}d
                            </td>
                            <td className="p-2.5 text-right font-mono">
                              {offer.reliabilityScore}%
                            </td>
                            <td className="p-2.5 text-center">
                              {isChosen ? (
                                <span className="px-2 py-0.5 rounded-full bg-accent text-accent-ink text-[10px] font-extrabold uppercase">
                                  Chosen
                                </span>
                              ) : (
                                <span className="text-muted text-[11px]">Quote</span>
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
