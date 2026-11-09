import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  IndianRupee,
  Clock,
  Layers,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import { useAnalyticsSummary } from "../api/analytics.js";
import { formatPaise, formatDate, formatRelativeTime } from "../lib/format.js";
import { AnimatedNumber } from "../components/motion/AnimatedNumber.js";
import { SpendChart } from "../components/charts/SpendChart.js";
import { StatusBadge } from "../components/orders/StatusBadge.js";
import { Button } from "../components/ui/Button.js";
import { Skeleton } from "../components/ui/Skeleton.js";

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-accent uppercase tracking-wider">
            <Building2 className="h-3.5 w-3.5" />
            <span>{business?.name || "Patel Supermarket"}</span>
            <span className="text-muted">• {business?.city || "Mumbai"}</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl sm:text-3xl font-extrabold text-ink">
            Welcome back, {user?.name?.split(" ")[0] || "Owner"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Autonomous purchasing agent is ready. Monitor spending and approve restock orders.
          </p>
        </div>

        <Link to="/procure" className="w-full sm:w-auto">
          <Button variant="accent" size="lg" className="w-full sm:w-auto gap-2 font-bold shadow-md shadow-accent/20">
            <Sparkles className="h-4 w-4" />
            New Purchase Request
          </Button>
        </Link>
      </div>

      {/* KPI Ticker Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Spend */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Spend</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-subtle text-ink">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-2xl font-black text-ink">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <AnimatedNumber value={spendRupees} prefix="₹" />
              )}
            </div>
            <p className="mt-1 text-xs text-muted">All-time settled procurement</p>
          </div>
        </div>

        {/* This Month's Spend */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">This Month</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-subtle text-accent">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-2xl font-black text-ink">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <AnimatedNumber value={monthSpendRupees} prefix="₹" />
              )}
            </div>
            <p className="mt-1 text-xs text-muted">
              Monthly budget: {business?.monthlyBudgetPaise ? formatPaise(business.monthlyBudgetPaise) : "₹1,00,000"}
            </p>
          </div>
        </div>

        {/* Budget Utilisation */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Budget Utilisation</span>
            <span className="font-mono text-xs font-bold text-ink">{budgetUtilization}%</span>
          </div>
          <div className="mt-4">
            <div className="font-mono text-2xl font-black text-ink">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <AnimatedNumber value={budgetUtilization} suffix="%" />
              )}
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-card-subtle">
              <div
                className={`h-full transition-all duration-500 ${
                  budgetUtilization > 90 ? "bg-rose-500" : budgetUtilization > 70 ? "bg-amber-400" : "bg-accent"
                }`}
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Estimated Savings */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Estimated Savings</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-subtle text-emerald-500">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <AnimatedNumber value={savingsRupees} prefix="₹" />
              )}
            </div>
            <p className="mt-1 text-xs text-muted">Via knapsack tier & shipping consolidation</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Spend Chart & Quick Action */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Spend Chart */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="font-heading text-base font-bold text-ink">Procurement Spend by Month</h2>
              <p className="text-xs text-muted mt-0.5">Authoritative invoice totals in INR</p>
            </div>
            <Link to="/analytics" className="text-xs font-semibold text-accent hover:underline">
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
        <div className="flex flex-col justify-between rounded-2xl border border-accent/40 bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 h-32 w-32 rounded-full bg-accent/10 blur-2xl pointer-events-none" />
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-ink">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-bold text-ink">
              Restock Kirana Catalogue
            </h3>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              Enter restock requests in natural English or Hinglish. ProcurePilot matches items, compares wholesale tiers, and drafts approved purchase orders.
            </p>

            <div className="mt-4 rounded-xl border border-border bg-card-subtle p-3 font-mono text-[11px] text-muted space-y-1">
              <div>• "30 packets of rice, 20 units cooking oil"</div>
              <div>• "Restock snacks under ₹10,000 fastest delivery"</div>
            </div>
          </div>

          <Link to="/procure" className="mt-6">
            <Button variant="accent" size="md" className="w-full gap-2 font-bold">
              Launch Agent <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <h2 className="font-heading text-base font-bold text-ink">Recent Purchase Orders</h2>
            <p className="text-xs text-muted mt-0.5">Live status from draft to PayPal capture</p>
          </div>
          <Link to="/orders" className="text-xs font-semibold text-accent hover:underline">
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
            <div className="py-12 text-center text-xs text-muted">
              <ShoppingBag className="mx-auto h-8 w-8 text-muted/60 mb-2" />
              No purchase orders created yet.
              <div className="mt-3">
                <Link to="/procure">
                  <Button variant="outline" size="sm">Create first request</Button>
                </Link>
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-muted uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Suppliers</th>
                  <th className="py-3 px-4">Authoritative Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {analytics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-card-subtle/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-ink">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-muted">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-ink">
                      {order.lines.length} {order.lines.length === 1 ? "line" : "lines"}
                    </td>
                    <td className="py-3.5 px-4 text-muted">
                      {order.supplierGroups.map((s) => s.supplierName).join(", ")}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-ink">
                      {formatPaise(order.totalPaise)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="font-semibold text-accent">
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
