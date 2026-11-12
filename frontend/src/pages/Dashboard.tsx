import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Building2,
} from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import { useAnalyticsSummary } from "../api/analytics.js";
import { formatPaise, formatDate } from "../lib/format.js";
import { AnimatedNumber } from "../components/motion/AnimatedNumber.js";
import { SpendChart } from "../components/charts/SpendChart.js";
import { StatusBadge } from "../components/orders/StatusBadge.js";
import { Button } from "../components/ui/Button.js";
import { Skeleton } from "../components/ui/Skeleton.js";
import { AppDownloadWidget } from "../components/mobile/AppDownloadWidget.js";

export const Dashboard: React.FC = () => {
  const { user, business } = useAuthStore();
  const { data: analytics, isLoading } = useAnalyticsSummary();

  const spendRupees = analytics ? Math.round(analytics.totalSpendPaise / 100) : 0;
  const monthSpendRupees = analytics ? Math.round(analytics.spendThisMonthPaise / 100) : 0;
  const savingsRupees = analytics ? Math.round(analytics.averageSavingsPaise / 100) : 0;
  const budgetUtilization = analytics?.budgetUtilisationPercent || 0;

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted">
            <Building2 className="h-3.5 w-3.5 text-muted" />
            <span className="text-ink font-semibold">{business?.name || "Patel Supermarket"}</span>
            <span className="opacity-40">/</span>
            <span>{business?.city || "Mumbai"}</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Command Dashboard
          </h1>
          <p className="mt-1 text-xs text-muted">
            Welcome back, {user?.name?.split(" ")[0] || "Owner"}. Your purchase dashboard is ready.
          </p>
        </div>

        <Link to="/procure" className="w-full sm:w-auto">
          <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 font-bold text-xs h-10 px-5 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            New Purchase Request
          </Button>
        </Link>
      </div>

      {/* KPI Ticker Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Spend */}
        <div className="rounded-[10px] border border-border bg-surface p-5 shadow-sm hover:border-border-strong transition-all">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider">All-Time Spend</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-surface-elevated text-ink">
              <IndianRupee className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono text-2xl font-black text-ink tabular-nums">
              {isLoading ? (
                <Skeleton className="h-7 w-32" />
              ) : (
                <AnimatedNumber value={spendRupees} prefix="₹" />
              )}
            </div>
            <p className="mt-1 text-[11px] text-muted font-mono">Settled via PayPal</p>
          </div>
        </div>

        {/* This Month's Spend */}
        <div className="rounded-[10px] border border-border bg-surface p-5 shadow-sm hover:border-border-strong transition-all">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider">This Month</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-surface-elevated text-ink">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono text-2xl font-black text-ink tabular-nums">
              {isLoading ? (
                <Skeleton className="h-7 w-32" />
              ) : (
                <AnimatedNumber value={monthSpendRupees} prefix="₹" />
              )}
            </div>
            <p className="mt-1 text-[11px] text-muted font-mono">
              Cap: {business?.monthlyBudgetPaise ? formatPaise(business.monthlyBudgetPaise) : "₹1,50,000"}
            </p>
          </div>
        </div>

        {/* Budget Utilisation */}
        <div className="rounded-[10px] border border-border bg-surface p-5 shadow-sm hover:border-border-strong transition-all">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider">Budget Utilisation</span>
            <span className="font-mono text-xs font-bold text-ink tabular-nums">{budgetUtilization}%</span>
          </div>
          <div className="mt-3">
            <div className="font-mono text-2xl font-black text-ink tabular-nums">
              {isLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <AnimatedNumber value={budgetUtilization} suffix="%" />
              )}
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-white/[0.06]">
              <div
                className={`h-full transition-all duration-500 ${
                  budgetUtilization > 90 ? "bg-rose-500" : budgetUtilization > 70 ? "bg-amber-400" : "bg-ink"
                }`}
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Estimated Savings */}
        <div className="rounded-[10px] border border-border bg-surface p-5 shadow-sm hover:border-border-strong transition-all">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider">Optimized Savings</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-surface-elevated text-emerald-600 dark:text-emerald-400">
              <TrendingDown className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-mono text-2xl font-black text-ink tabular-nums">
              {isLoading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <AnimatedNumber value={savingsRupees} prefix="₹" />
              )}
            </div>
            <p className="mt-1 text-[11px] text-muted font-mono">Supplier & freight savings</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Spend Chart & Quick Action */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Spend Chart */}
        <div className="rounded-[12px] border border-border bg-surface p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-sm font-bold text-ink tracking-tight">Procurement Spend by Month</h2>
              <p className="text-xs text-muted mt-0.5">Authoritative invoice totals in INR</p>
            </div>
            <Link to="/analytics" className="text-xs font-mono text-muted hover:text-ink transition-colors">
              Full Analytics →
            </Link>
          </div>
          <div className="mt-6">
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <SpendChart data={analytics?.monthlySpend || []} height={260} />
            )}
          </div>
        </div>

        {/* Fast CTA Card */}
        <div className="flex flex-col justify-between rounded-[12px] border border-border bg-surface p-6 shadow-sm relative overflow-hidden group">
          <div>
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-ink text-background font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="mt-4 text-base font-bold text-ink tracking-tight">
              Smart Restock
            </h3>
            <p className="mt-2 text-xs text-muted leading-relaxed font-sans">
              Enter restock requests in natural English or Hinglish. ProcurePilot matches items, compares wholesale tiers, and drafts approved purchase orders.
            </p>

            <div className="mt-4 rounded-[6px] border border-border bg-surface-elevated p-3 font-mono text-[11px] text-muted space-y-1">
              <div>· "30 packets of rice, 20 units cooking oil"</div>
              <div>· "Restock snacks under ₹10,000 fastest"</div>
            </div>
          </div>

          <Link to="/procure" className="mt-6">
            <Button variant="primary" size="md" className="w-full gap-2 font-bold text-xs h-10">
              Start Sourcing <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Companion App Download Widget */}
      <AppDownloadWidget variant="dashboard" />

      {/* Recent Orders Section */}
      <div className="rounded-[12px] border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-sm font-bold text-ink tracking-tight">Recent Purchase Orders</h2>
            <p className="text-xs text-muted mt-0.5">Live status from draft to PayPal capture</p>
          </div>
          <Link to="/orders" className="text-xs font-mono text-muted hover:text-ink transition-colors">
            View All Orders →
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          {isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !analytics?.recentOrders || analytics.recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted font-mono">
              <ShoppingBag className="mx-auto h-8 w-8 text-muted mb-2" />
              No purchase orders created yet.
              <div className="mt-3">
                <Link to="/procure">
                  <Button variant="outline" size="sm">Create First Request</Button>
                </Link>
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="border-b border-border text-muted uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Suppliers</th>
                  <th className="py-3 px-4">Total (INR)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analytics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-elevated transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-ink">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-muted font-mono">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-ink">
                      {order.lines.length} {order.lines.length === 1 ? "line" : "lines"}
                    </td>
                    <td className="py-3.5 px-4 text-muted truncate max-w-[180px]">
                      {order.supplierGroups.map((s) => s.supplierName).join(", ")}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-ink tabular-nums">
                      {formatPaise(order.totalPaise)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="font-mono text-xs text-muted hover:text-ink h-7 px-2.5">
                          View →
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
