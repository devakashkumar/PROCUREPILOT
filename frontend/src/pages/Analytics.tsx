import React from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useAnalyticsSummary } from "../api/analytics.js";
import { formatPaise } from "../lib/format.js";
import { SpendChart } from "../components/charts/SpendChart.js";
import { SupplierShareChart } from "../components/charts/SupplierShareChart.js";
import { ANALYTICS_PALETTE } from "../components/charts/chartTheme.js";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted">
            <TrendingUp className="h-3.5 w-3.5 text-muted" />
            <span>Spend Intelligence</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Procurement Analytics
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Track spend trends, supplier distribution, and knapsack consolidation savings.
          </p>
        </div>

        <Link to="/procure">
          <Button variant="primary" size="sm" className="gap-2 font-bold text-xs h-9 px-4 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <Sparkles className="h-3.5 w-3.5" />
            New Sourcing Request
          </Button>
        </Link>
      </div>

      {/* KPI Tickers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[10px] border border-border bg-surface p-5 shadow-sm hover:border-border-strong transition-all font-mono">
          <span className="text-[11px] uppercase tracking-wider text-muted block">All-Time Spend</span>
          <div className="mt-3 text-2xl font-black text-ink tabular-nums">
            {isLoading ? <Skeleton className="h-7 w-28" /> : <AnimatedNumber value={spendRupees} prefix="₹" />}
          </div>
          <p className="mt-1 text-[11px] text-muted">Total settled invoices (paise precision)</p>
        </div>

        <div className="rounded-[10px] border border-border bg-surface p-5 shadow-sm hover:border-border-strong transition-all font-mono">
          <span className="text-[11px] uppercase tracking-wider text-muted block">This Month's Spend</span>
          <div className="mt-3 text-2xl font-black text-ink tabular-nums">
            {isLoading ? <Skeleton className="h-7 w-28" /> : <AnimatedNumber value={monthSpendRupees} prefix="₹" />}
          </div>
          <p className="mt-1 text-[11px] text-muted">
            Cap: {analytics ? formatPaise(analytics.monthlyBudgetPaise) : "₹1,50,000"}
          </p>
        </div>

        <div className="rounded-[10px] border border-border bg-surface p-5 shadow-sm hover:border-border-strong transition-all font-mono">
          <span className="text-[11px] uppercase tracking-wider text-muted block">Budget Utilisation</span>
          <div className="mt-3 text-2xl font-black text-ink tabular-nums">
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <AnimatedNumber value={analytics?.budgetUtilisationPercent || 0} suffix="%" />
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted">Current billing period</p>
        </div>

        <div className="rounded-[10px] border border-border bg-surface p-5 shadow-sm hover:border-border-strong transition-all font-mono">
          <span className="text-[11px] uppercase tracking-wider text-muted block">Estimated Savings</span>
          <div className="mt-3 text-2xl font-black text-emerald-400 tabular-nums">
            {isLoading ? <Skeleton className="h-7 w-28" /> : <AnimatedNumber value={savingsRupees} prefix="₹" />}
          </div>
          <p className="mt-1 text-[11px] text-muted">Optimized wholesale discounts</p>
        </div>
      </div>

      {/* Visual Charts: Spend Trends & Supplier Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Monthly Spend Chart */}
        <div className="rounded-[12px] border border-border bg-surface p-6 shadow-sm lg:col-span-7">
          <div className="border-b border-border pb-3 mb-4">
            <h3 className="text-sm font-bold text-ink tracking-tight">Monthly Spend Trend</h3>
            <p className="text-xs text-muted mt-0.5">Invoice totals in INR across billing cycles</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <SpendChart data={analytics?.monthlySpend || []} height={280} />
          )}
        </div>

        {/* Supplier Share Donut */}
        <div className="rounded-[12px] border border-border bg-surface p-6 shadow-sm lg:col-span-5">
          <div className="border-b border-border pb-3 mb-4">
            <h3 className="text-sm font-bold text-ink tracking-tight">Supplier Spend Share</h3>
            <p className="text-xs text-muted mt-0.5">Distribution of procurement funds across wholesale vendors</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <SupplierShareChart data={analytics?.topSuppliers || []} height={280} />
          )}
        </div>
      </div>

      {/* Top Suppliers Table */}
      <div className="rounded-[12px] border border-border bg-surface p-6 shadow-sm">
        <h3 className="text-sm font-bold text-ink tracking-tight border-b border-border pb-3 mb-4">
          Wholesale Partner Distribution
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !analytics?.topSuppliers || analytics.topSuppliers.length === 0 ? (
          <p className="text-xs font-mono text-muted py-6 text-center">No supplier transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="border-b border-border text-muted uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Supplier Name</th>
                  <th className="py-2.5 px-3 text-center">Orders Fulfilled</th>
                  <th className="py-2.5 px-3 text-right">Cumulative Spend</th>
                  <th className="py-2.5 px-3 text-right">Share of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analytics.topSuppliers.map((supplier, idx) => {
                  const percent =
                    analytics.totalSpendPaise > 0
                      ? Math.round((supplier.totalSpendPaise / analytics.totalSpendPaise) * 100)
                      : 0;
                  const supplierColor = ANALYTICS_PALETTE[idx % ANALYTICS_PALETTE.length];
                  return (
                    <tr key={idx} className="hover:bg-surface-elevated transition-colors">
                      <td className="py-3 px-3 font-bold text-ink">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-xs"
                            style={{ backgroundColor: supplierColor }}
                            aria-hidden="true"
                          />
                          <span>{supplier.supplierName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-muted tabular-nums">
                        {supplier.orderCount}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-ink tabular-nums">
                        {formatPaise(supplier.totalSpendPaise)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-ink tabular-nums">
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
