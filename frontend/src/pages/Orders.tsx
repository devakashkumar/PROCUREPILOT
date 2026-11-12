import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Search, Plus, ArrowRight } from "lucide-react";
import { useOrders } from "../api/orders.js";
import { OrderStatus } from "../types/api.js";
import { formatPaise, formatDate } from "../lib/format.js";
import { StatusBadge } from "../components/orders/StatusBadge.js";
import { Button } from "../components/ui/Button.js";
import { Input } from "../components/ui/Input.js";
import { Skeleton } from "../components/ui/Skeleton.js";

const STATUS_TABS: Array<{ label: string; value?: OrderStatus }> = [
  { label: "All Orders" },
  { label: "Draft", value: "DRAFT" },
  { label: "Pending Approval", value: "PENDING_APPROVAL" },
  { label: "Approved", value: "APPROVED" },
  { label: "Payment Pending", value: "PAYMENT_PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Cancelled", value: "CANCELLED" },
];

export const Orders: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useOrders({
    status: selectedStatus,
    search: search ? search : undefined,
    page,
    limit: 15,
  });

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted">
            <ShoppingBag className="h-3.5 w-3.5 text-muted" />
            <span>Procurement Ledger</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Purchase Orders
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Track orders across draft status, mandatory owner approval, and PayPal settlement.
          </p>
        </div>

        <Link to="/procure">
          <Button variant="primary" size="sm" className="gap-2 font-bold text-xs h-9 px-4 shadow-sm">
            <Plus className="h-3.5 w-3.5" />
            New Purchase Request
          </Button>
        </Link>
      </div>

      {/* Controls: Search and Status Tabs */}
      <div className="flex flex-col gap-4">
        {/* Search Input */}
        <div className="max-w-md">
          <Input
            placeholder="Search by PO-2026-XXXXXX..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            startIcon={<Search className="h-4 w-4 text-muted" />}
          />
        </div>

        {/* Status Filter Tabs - Sleek Unboxed Discipline */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
          {STATUS_TABS.map((tab) => {
            const isSelected = selectedStatus === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => {
                  setSelectedStatus(tab.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-mono transition-all rounded-[4px] cursor-pointer ${
                  isSelected
                    ? "bg-ink text-background font-bold shadow-xs"
                    : "text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/[0.04]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-[12px] border border-border bg-surface shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted font-mono">
              <ShoppingBag className="mx-auto h-8 w-8 text-muted mb-2" />
              <p className="text-sm font-semibold text-ink">No purchase orders found</p>
              <p className="mt-1">Try adjusting your filters or start a new autonomous procurement.</p>
              <div className="mt-4">
                <Link to="/procure">
                  <Button variant="primary" size="sm" className="gap-2 font-bold text-xs">
                    <Plus className="h-3.5 w-3.5" /> Create Request
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="border-b border-border bg-surface-elevated text-muted uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Suppliers</th>
                  <th className="py-3 px-4">Authoritative Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-elevated transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-ink">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-muted font-mono">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-ink">
                      {order.lines.length} {order.lines.length === 1 ? "item" : "items"}
                    </td>
                    <td className="py-3.5 px-4 text-muted truncate max-w-xs" title={order.supplierGroups.map((g) => g.supplierName).join(", ")}>
                      {order.supplierGroups.map((g) => g.supplierName).join(", ")}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-ink tabular-nums">
                      {formatPaise(order.totalPaise)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1 font-mono text-xs text-muted hover:text-ink h-7 px-2">
                          View <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs font-mono text-muted">
            <span>
              Page <strong className="text-ink">{pagination.page}</strong> of <strong className="text-ink">{pagination.totalPages}</strong> ({pagination.total} orders)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-mono"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-mono"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
