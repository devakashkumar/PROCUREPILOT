import { motion } from "framer-motion";
import { formatInr } from "../../lib/format.js";
import { AnimatedNumber } from "../motion/AnimatedNumber.js";
import { Button } from "../ui/Button.js";
import { AlertCircle, ShieldCheck, ShoppingBag } from "lucide-react";
import { OptimizedPlan } from "../../types/api.js";

interface BudgetMeterProps {
  plan: OptimizedPlan;
  onCreateOrder: () => void;
  isLoading?: boolean;
}

export function BudgetMeter({ plan, onCreateOrder, isLoading }: BudgetMeterProps) {
  const percentage = plan.budgetPaise > 0
    ? Math.min(100, Math.round((plan.totalPaise / plan.budgetPaise) * 100))
    : 100;

  return (
    <div className="p-6 sm:p-7 bg-surface border border-border rounded-[14px] flex flex-col gap-6 sticky top-20 shadow-xl">
      {/* Over-budget Warning if any */}
      {!plan.withinBudget && (
        <div className="p-3.5 rounded-[8px] bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5 text-xs font-sans">
            <span className="font-bold text-ink">Plan Exceeds Budget</span>
            <span className="text-rose-500 dark:text-rose-200">
              Shortfall of {formatInr(plan.shortfallPaise)}. Switch to cheapest strategy or raise budget.
            </span>
          </div>
        </div>
      )}

      {/* Authoritative Total */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-muted mb-1">
          <span>Authoritative Total</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck className="h-3.5 w-3.5" /> Deterministic Math
          </span>
        </div>
        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink font-mono tabular-nums">
          <AnimatedNumber value={plan.totalPaise} formatAs="inr" />
        </div>
        <div className="flex items-center justify-between text-xs font-mono text-muted mt-2 pt-2 border-t border-border">
          <span>Subtotal: {formatInr(plan.subtotalPaise)}</span>
          <span>Shipping: {plan.shippingPaise === 0 ? "FREE" : formatInr(plan.shippingPaise)}</span>
        </div>
      </div>

      {/* Used vs Remaining Budget Meter */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted">Budget Utilization</span>
          <span className="font-bold text-ink tabular-nums">{percentage}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-white/[0.06] overflow-hidden border border-border">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`h-full ${percentage > 100 ? "bg-rose-500" : percentage > 85 ? "bg-amber-500" : "bg-ink"}`}
          />
        </div>
        {plan.budgetPaise > 0 && (
          <div className="flex justify-between text-[10px] font-mono text-muted">
            <span>Target: {formatInr(plan.budgetPaise)}</span>
            <span>Est. Savings: {formatInr(plan.estimatedSavingsPaise)}</span>
          </div>
        )}
      </div>

      {/* Fulfillment Summary */}
      <div className="p-3.5 rounded-[8px] bg-surface-elevated border border-border flex flex-col gap-1.5 text-xs font-mono text-muted">
        <div className="flex justify-between">
          <span>Fulfillment Groups:</span>
          <span className="text-ink font-bold">{plan.supplierGroups.length} distributor(s)</span>
        </div>
        <div className="flex justify-between">
          <span>Total Restock Lines:</span>
          <span className="text-ink font-bold">{plan.lines.length} items</span>
        </div>
      </div>

      {/* Review & Approve Button */}
      <Button
        variant="primary"
        size="lg"
        isLoading={isLoading}
        onClick={onCreateOrder}
        className="w-full gap-2 font-bold text-sm shadow-md"
      >
        <ShoppingBag className="h-4 w-4" />
        <span>Create Purchase Order</span>
      </Button>
    </div>
  );
}
