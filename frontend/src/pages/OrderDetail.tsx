import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Printer,
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
      toast.loading("Recording proprietor approval...", { id: "approve" });
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
      toast.loading("Recording rejection in ledger...", { id: "reject" });
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
      <div className="rounded-[12px] border border-dashed border-border bg-surface p-12 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500 dark:text-rose-400" />
        <h3 className="mt-4 text-base font-bold text-ink">Purchase Order Not Found</h3>
        <p className="mt-1 text-xs text-muted">The requested order does not exist or belongs to another tenant.</p>
        <Link to="/orders" className="mt-6 inline-block">
          <Button variant="outline" size="sm">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Navigation & Status Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <Link to="/orders">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-[6px] text-muted hover:text-ink">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                {order.orderNumber}
              </h1>
              <StatusBadge status={order.status} size="default" />
            </div>
            <p className="text-xs text-muted font-mono mt-0.5">
              Created {formatDate(order.createdAt)} · Integer INR (paise precision)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {order.status === "APPROVED" && (
            <Link to={`/orders/${order.id}/checkout`}>
              <Button variant="primary" size="sm" className="gap-2 font-bold text-xs py-2 px-3 shadow-sm min-h-[36px]">
                <CreditCard className="h-3.5 w-3.5 shrink-0" />
                <span>Proceed to PayPal Checkout</span>
              </Button>
            </Link>
          )}
          {order.status === "PAID" && (
            <Link to={`/orders/${order.id}/payment-result`}>
              <Button variant="outline" size="sm" className="gap-2 font-mono text-xs h-9 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                <CheckCircle2 className="h-3.5 w-3.5" />
                View Receipt
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 font-mono text-xs h-9 text-muted hover:text-ink"
            title="Print purchase order"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
        </div>
      </div>

      {/* Main Grid: Details & Approval */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Supplier Sub-Orders, Lines, Audit History */}
        <div className="space-y-6 lg:col-span-8">
          {/* Honest Fulfillment Note */}
          <div className="rounded-[10px] border border-border bg-surface-elevated p-4 text-xs text-ink/80">
            <div className="flex items-center gap-2 font-mono font-bold text-ink mb-1">
              <ShieldCheck className="h-4 w-4 text-ink" />
              <span>SINGLE-SETTLEMENT MULTI-VENDOR DISPATCH</span>
            </div>
            <p className="text-muted leading-relaxed font-sans">
              ProcurePilot aggregates this multi-vendor restock into a single unified payment. You settle once via PayPal Sandbox, and fulfillment sub-lines are partitioned across the {order.supplierGroups.length} regional wholesale distributors below.
            </p>
          </div>

          {/* Supplier Group Sub-Orders */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-ink tracking-tight">
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
          <div className="rounded-[12px] border border-border bg-surface p-6 shadow-sm">
            <h3 className="text-sm font-bold text-ink tracking-tight border-b border-border pb-3">
              Itemized Line Items ({order.lines.length})
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border text-muted uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Supplier</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3">Rate</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.lines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-surface-elevated transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-ink">{line.productName}</span>
                        <span className="text-[11px] font-mono text-muted block">Unit: {line.unit}</span>
                      </td>
                      <td className="py-3 px-3 text-muted">
                        {line.supplierName}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-ink tabular-nums">
                        {line.quantity}
                      </td>
                      <td className="py-3 px-3 font-mono text-muted tabular-nums">
                        {formatPaise(line.unitPricePaise)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-ink tabular-nums">
                        {formatPaise(line.lineTotalPaise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Audit Timeline */}
          <div className="rounded-[12px] border border-border bg-surface p-6 shadow-sm">
            <h3 className="text-sm font-bold text-ink tracking-tight border-b border-border pb-3 mb-4">
              Order State Audit Log
            </h3>
            <StatusTimeline history={order.statusHistory} />
          </div>
        </div>

        {/* Right Column: Financial Summary, Approval Panel, Payment Record */}
        <div className="space-y-6 lg:col-span-4 sticky top-6">
          {/* Financial Breakdown Card */}
          <div className="rounded-[12px] border border-border bg-surface p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-ink tracking-tight border-b border-border pb-3">
              Authoritative Financials
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-muted">
                <span>Subtotal ({order.lines.length} lines)</span>
                <span className="font-medium text-ink tabular-nums">{formatPaise(order.subtotalPaise)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Consolidated Freight</span>
                <span className="font-medium text-ink tabular-nums">
                  {order.shippingPaise === 0 ? "FREE" : formatPaise(order.shippingPaise)}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between text-sm font-bold text-ink">
                <span>Total Payable</span>
                <span className="text-base text-ink tabular-nums">{formatPaise(order.totalPaise)}</span>
              </div>
              {order.estimatedSavingsPaise > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                  <span>Optimizer Savings</span>
                  <span className="tabular-nums">+{formatPaise(order.estimatedSavingsPaise)}</span>
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
