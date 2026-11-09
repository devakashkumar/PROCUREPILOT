import React from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Building2,
  IndianRupee,
  PieChart as PieIcon,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useAnalyticsSummary } from "../api/analytics.js";
import { formatPaise } from "../lib/format.js";
import { SpendChart } from "../components/charts/SpendChart.js";
import { SupplierShareChart } from "../components/charts/SupplierShareChart.js";
import { AnimatedNumber } from "../components/motion/AnimatedNumber.js";
import { Skeleton } from "../components/ui/Skeleton.js";
import { Button } from "../components/ui/Button.js";

export const Analytics: React.FC = () => {
  const { data: analytics, isLoading } = useAnalyticsSummary();

  const spendRupees = analytics ? Math.round(analytics.totalSpendPaise / 100) : 0;
  const monthSpendRupees = analytics ? Math.round(analytics.spendThisMonthPaise / 100) : 0;
  const savingsRupees = analytics ? Math.round(analytics.averageSavingsPaise / 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-accent uppercase tracking-wider">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Spend Intelligence</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl sm:text-3xl font-extrabold text-ink">
            Procurement Analytics
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Track spend trends, supplier distribution, and knapsack consolidation savings.
          </p>
        </div>

        <Link to="/procure">
          <Button variant="accent" size="sm" className="gap-2 font-bold shadow-sm">
            <Sparkles className="h-4 w-4" />
            New Sourcing Request
          </Button>
        </Link>
      </div>

      {/* KPI Tickers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">All-Time Spend</span>
          <div className="mt-3 font-mono text-2xl font-black text-ink">
            {isLoading ? <Skeleton className="h-8 w-28" /> : <AnimatedNumber value={spendRupees} prefix="₹" />}
          </div>
          <p className="mt-1 text-xs text-muted">Total settled invoices (paise precision)</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">This Month's Spend</span>
          <div className="mt-3 font-mono text-2xl font-black text-ink">
            {isLoading ? <Skeleton className="h-8 w-28" /> : <AnimatedNumber value={monthSpendRupees} prefix="₹" />}
          </div>
          <p className="mt-1 text-xs text-muted">
            Budget ceiling: {analytics ? formatPaise(analytics.monthlyBudgetPaise) : "₹1,00,000"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Budget Utilisation</span>
          <div className="mt-3 font-mono text-2xl font-black text-accent">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <AnimatedNumber value={analytics?.budgetUtilisationPercent || 0} suffix="%" />
            )}
          </div>
          <p className="mt-1 text-xs text-muted">Current billing period</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Estimated Savings</span>
          <div className="mt-3 font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {isLoading ? <Skeleton className="h-8 w-28" /> : <AnimatedNumber value={savingsRupees} prefix="₹" />}
          </div>
          <p className="mt-1 text-xs text-muted">Optimized wholesale discounts</p>
        </div>
      </div>

      {/* Visual Charts: Spend Trends & Supplier Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Monthly Spend Chart */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-7">
          <div className="border-b border-border/60 pb-3 mb-4">
            <h3 className="font-heading text-base font-bold text-ink">Monthly Spend Trend</h3>
            <p className="text-xs text-muted">Invoice totals in INR across previous billing cycles</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <SpendChart data={analytics?.monthlySpend || []} height={280} />
          )}
        </div>

        {/* Supplier Share Donut */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-5">
          <div className="border-b border-border/60 pb-3 mb-4">
            <h3 className="font-heading text-base font-bold text-ink">Supplier Spend Share</h3>
            <p className="text-xs text-muted">Distribution of procurement funds across wholesale vendors</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <SupplierShareChart data={analytics?.topSuppliers || []} height={280} />
          )}
        </div>
      </div>

      {/* Top Suppliers Table */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-heading text-base font-bold text-ink border-b border-border/60 pb-3 mb-4">
          Wholesale Partner Distribution
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !analytics?.topSuppliers || analytics.topSuppliers.length === 0 ? (
          <p className="text-xs text-muted py-6 text-center">No supplier transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-muted uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Supplier Name</th>
                  <th className="py-2.5 px-3 text-center">Orders Fulfilled</th>
                  <th className="py-2.5 px-3 text-right">Cumulative Spend</th>
                  <th className="py-2.5 px-3 text-right">Share of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {analytics.topSuppliers.map((supplier, idx) => {
                  const percent =
                    analytics.totalSpendPaise > 0
                      ? Math.round((supplier.totalSpendPaise / analytics.totalSpendPaise) * 100)
                      : 0;
                  return (
                    <tr key={idx} className="hover:bg-card-subtle/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-ink">
                        {supplier.supplierName}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-muted">
                        {supplier.orderCount}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-ink">
                        {formatPaise(supplier.totalSpendPaise)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-accent">
                        {percent}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
