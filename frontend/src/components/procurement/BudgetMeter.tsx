import { motion } from "framer-motion";
import { formatInr } from "../../lib/format.js";
import { AnimatedNumber } from "../motion/AnimatedNumber.js";
import { Button } from "../ui/Button.js";
import { AlertCircle, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
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
    <div className="card-sharp p-6 sm:p-8 bg-surface border border-border rounded-[28px] flex flex-col gap-6 sticky top-24">
      {/* Over-budget Warning if any */}
      {!plan.withinBudget && (
        <div className="p-4 rounded-[16px] bg-danger/10 border border-danger/30 text-danger flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-xs font-bold">
            <span className="text-sm font-extrabold">Plan Exceeds Budget</span>
            <span>
              Total shortfall of {formatInr(plan.shortfallPaise)}. Switch to the cheapest strategy or increase your budget.
            </span>
          </div>
        </div>
      )}

      {/* Authoritative Total */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted mb-1">
          <span>Authoritative Total</span>
          <span className="flex items-center gap-1 text-success font-extrabold">
            <ShieldCheck className="h-3.5 w-3.5" /> Deterministic Math
          </span>
        </div>
        <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink font-mono">
          <AnimatedNumber value={plan.totalPaise} formatAs="inr" />
        </div>
        <div className="flex items-center justify-between text-xs text-muted mt-2">
          <span>Subtotal: {formatInr(plan.subtotalPaise)}</span>
          <span>Shipping: {plan.shippingPaise === 0 ? "FREE" : formatInr(plan.shippingPaise)}</span>
        </div>
      </div>

      {/* Used vs Remaining Budget Meter */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-muted">Budget Utilization</span>
          <span className="font-mono font-bold text-ink">{percentage}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-subtle overflow-hidden border border-border">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${
              plan.withinBudget ? "bg-accent" : "bg-danger"
            }`}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-semibold text-muted">
          <span>Cap: {formatInr(plan.budgetPaise)}</span>
          <span className="text-ink font-bold">
            Buffer: {formatInr(plan.remainingBudgetPaise)}
          </span>
        </div>
      </div>

      {/* Key Fulfillment Metrics */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
        <div className="p-3 rounded-[12px] bg-subtle">
          <div className="flex items-center gap-1.5 text-xs text-muted font-bold uppercase">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            <span>Reliability</span>
          </div>
          <div className="text-xl font-extrabold text-ink font-mono mt-1">
            {plan.averageReliability}%
          </div>
        </div>

        <div className="p-3 rounded-[12px] bg-subtle">
          <div className="flex items-center gap-1.5 text-xs text-muted font-bold uppercase">
            <Truck className="h-3.5 w-3.5 text-info" />
            <span>Delivery</span>
          </div>
          <div className="text-xl font-extrabold text-ink font-mono mt-1">
            {plan.maxDeliveryDays} days
          </div>
        </div>
      </div>

      {/* Savings indicator */}
      {plan.estimatedSavingsPaise > 0 && (
        <div className="p-3 rounded-[12px] bg-success/10 border border-success/20 text-success text-xs font-bold text-center">
          Estimated Savings: {formatInr(plan.estimatedSavingsPaise)} vs unoptimized quotes
        </div>
      )}

      {/* Primary Action Button */}
      <Button
        onClick={onCreateOrder}
        isLoading={isLoading}
        variant="primary"
        size="lg"
        className="w-full h-16 text-lg font-extrabold"
      >
        Create Purchase Order
      </Button>

      <p className="text-[11px] text-muted text-center leading-normal">
        Requires explicit owner approval before checkout. Backend re-verifies live inventory and prices.
      </p>
    </div>
  );
}
