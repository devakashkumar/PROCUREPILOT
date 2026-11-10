import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  Building2,
  Clock,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useOrder, ordersApi } from "../api/orders.js";
import { formatPaise, formatDate } from "../lib/format.js";
import { StatusBadge } from "../components/orders/StatusBadge.js";
import { StatusTimeline } from "../components/orders/StatusTimeline.js";
import { SupplierGroupCard } from "../components/orders/SupplierGroupCard.js";
import { ApprovalPanel } from "../components/orders/ApprovalPanel.js";
import { PaymentStatusCard } from "../components/payments/PaymentStatusCard.js";
import { Button } from "../components/ui/Button.js";
import { Skeleton } from "../components/ui/Skeleton.js";

export const OrderDetail: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useOrder(id);

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const order = data?.order;
  const payment = data?.payment;

  const handleApprove = async () => {
    if (!order) return;
    setIsApproving(true);
    try {
      toast.loading("Recording owner approval in ledger...", { id: "approve" });
      await ordersApi.approve(order.id);
      toast.success("Purchase order approved! Ready for PayPal checkout.", { id: "approve" });
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Approval failed";
      toast.error(message, { id: "approve" });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!order) return;
    setIsRejecting(true);
    try {
      toast.loading("Rejecting purchase order...", { id: "reject" });
      await ordersApi.reject(order.id, reason);
      toast.info("Purchase order rejected.", { id: "reject" });
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Rejection failed";
      toast.error(message, { id: "reject" });
    } finally {
      setIsRejecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Skeleton className="h-96 lg:col-span-8" />
          <Skeleton className="h-96 lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h3 className="mt-4 font-heading text-lg font-bold text-ink">Purchase Order Not Found</h3>
        <p className="mt-1 text-xs text-muted">The requested order does not exist or belongs to another business.</p>
        <Link to="/orders" className="mt-6 inline-block">
          <Button variant="outline" size="sm">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Navigation & Status Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <Link to="/orders">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-2xl sm:text-3xl font-black text-ink tracking-tight">
                {order.orderNumber}
              </h1>
              <StatusBadge status={order.status} size="lg" />
            </div>
            <p className="text-xs text-muted mt-0.5">
              Created on {formatDate(order.createdAt)} • Authoritative currency: INR (paise)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {order.status === "APPROVED" && (
            <Link to={`/orders/${order.id}/checkout`}>
              <Button variant="accent" size="sm" className="gap-2 font-bold shadow-md shadow-accent/20">
                <CreditCard className="h-4 w-4" />
                Proceed to PayPal Checkout
              </Button>
            </Link>
          )}
          {order.status === "PAID" && (
            <Link to={`/orders/${order.id}/payment-result`}>
              <Button variant="outline" size="sm" className="gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                View Payment Receipt
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5"
            title="Print purchase order"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Main Grid: Details & Approval */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Supplier Sub-Orders, Lines, Audit History */}
        <div className="space-y-6 lg:col-span-8">
          {/* Honest Fulfillment Note */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-primary dark:text-accent">
            <div className="flex items-center gap-2 font-bold mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Honest Supplier Fulfillment Model</span>
            </div>
            <p className="text-muted leading-relaxed">
              ProcurePilot aggregates this multi-vendor order into a single unified payment. You pay ProcurePilot's merchant account via PayPal Sandbox, and fulfillment is dispatched across the {order.supplierGroups.length} regional wholesale suppliers below.
            </p>
          </div>

          {/* Supplier Group Sub-Orders */}
          <div className="space-y-4">
            <h3 className="font-heading text-base font-bold text-ink">
              Supplier Fulfillment Sub-Orders ({order.supplierGroups.length})
            </h3>
            {order.supplierGroups.map((group, idx) => (
              <SupplierGroupCard
                key={group.supplierId || idx}
                group={group}
                lines={order.lines}
              />
            ))}
          </div>

          {/* All Line Items Detailed Table */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-heading text-base font-bold text-ink border-b border-border/60 pb-3">
              Itemized Line Items ({order.lines.length})
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border text-muted uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Supplier</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-medium">
                  {order.lines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-card-subtle/40 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-ink">{line.productName}</span>
                        <span className="text-[11px] text-muted block">Unit: {line.unit}</span>
                      </td>
                      <td className="py-3 px-3 text-muted">
                        {line.supplierName}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-ink">
                        {line.quantity}
                      </td>
                      <td className="py-3 px-3 font-mono text-muted">
                        {formatPaise(line.unitPricePaise)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-ink">
                        {formatPaise(line.lineTotalPaise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Audit Timeline */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-heading text-base font-bold text-ink border-b border-border/60 pb-3 mb-4">
              Order State Audit Log
            </h3>
            <StatusTimeline history={order.statusHistory} />
          </div>
        </div>

        {/* Right Column: Financial Summary, Approval Panel, Payment Record */}
        <div className="space-y-6 lg:col-span-4 sticky top-6">
          {/* Financial Breakdown Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-ink border-b border-border/60 pb-3">
              Authoritative Financials
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal ({order.lines.length} lines)</span>
                <span className="font-mono font-medium text-ink">{formatPaise(order.subtotalPaise)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Consolidated Freight</span>
                <span className="font-mono font-medium text-ink">
                  {order.shippingPaise === 0 ? "FREE" : formatPaise(order.shippingPaise)}
                </span>
              </div>
              <div className="border-t border-border/60 pt-3 flex justify-between text-sm font-bold text-ink">
                <span>Total Payable</span>
                <span className="font-mono text-lg text-accent">{formatPaise(order.totalPaise)}</span>
              </div>
              {order.estimatedSavingsPaise > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                  <span>Optimizer Savings</span>
                  <span className="font-mono">+{formatPaise(order.estimatedSavingsPaise)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Approval Panel */}
          <ApprovalPanel
            order={order}
            onApprove={handleApprove}
            onReject={handleReject}
            isApproving={isApproving}
            isRejecting={isRejecting}
          />

          {/* Payment Status Card (if exists) */}
          {payment && (
            <PaymentStatusCard payment={payment} />
          )}
        </div>
      </div>
    </div>
  );
};
