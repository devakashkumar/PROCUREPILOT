import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";
import { useOrder } from "../api/orders.js";
import { formatPaise } from "../lib/format.js";
import { PayPalCheckout } from "../components/payments/PayPalCheckout.js";
import { StatusBadge } from "../components/orders/StatusBadge.js";
import { Button } from "../components/ui/Button.js";
import { Skeleton } from "../components/ui/Skeleton.js";

export const Checkout: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useOrder(id);

  const order = data?.order;

  const handlePaymentSuccess = (paymentId: string) => {
    navigate(`/orders/${id}/payment-result?paymentId=${paymentId}`);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-12">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md rounded-[12px] border border-dashed border-border bg-surface p-12 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500 dark:text-rose-400" />
        <h3 className="mt-4 text-base font-bold text-ink">Order Not Found</h3>
        <Link to="/orders" className="mt-4 inline-block">
          <Button variant="outline" size="sm">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  // If order is already paid, show direct confirmation
  if (order.status === "PAID") {
    return (
      <div className="mx-auto max-w-lg rounded-[12px] border border-emerald-500/30 bg-emerald-500/10 p-6 sm:p-8 text-center my-6 shadow-xl">
        <ShieldCheck className="mx-auto h-12 w-12 text-emerald-600 dark:text-emerald-400" />
        <h3 className="mt-4 text-lg font-bold text-ink tracking-tight">
          Order Already Paid & Verified
        </h3>
        <p className="mt-2 text-xs text-muted leading-relaxed font-sans">
          Purchase Order <strong className="text-ink font-mono">{order.orderNumber}</strong> has already been verified and settled via PayPal Sandbox.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={`/orders/${order.id}`} className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full text-xs font-mono">
              View Purchase Order
            </Button>
          </Link>
          <Link to={`/orders/${order.id}/payment-result?paymentId=${order.paymentId || ""}`} className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full font-bold text-xs">
              View Payment Receipt
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Mandatory Safety Check: Order must be APPROVED or PAYMENT_PENDING
  if (order.status !== "APPROVED" && order.status !== "PAYMENT_PENDING") {
    return (
      <div className="mx-auto max-w-lg rounded-[12px] border border-amber-500/30 bg-amber-500/10 p-6 sm:p-8 text-center my-6 shadow-xl">
        <ShieldCheck className="mx-auto h-10 w-10 text-amber-600 dark:text-amber-400" />
        <h3 className="mt-4 text-base font-bold text-ink tracking-tight">
          Approval Required Before Payment
        </h3>
        <p className="mt-2 text-xs text-muted leading-relaxed font-sans">
          The safety state machine requires explicit owner sign-off before a PayPal order can be created.
          This order currently has status <strong className="text-ink font-mono">{order.status}</strong>.
        </p>
        <Link to={`/orders/${order.id}`} className="mt-6 inline-block w-full sm:w-auto">
          <Button variant="primary" size="md" className="w-full font-bold text-xs py-2.5 px-4 min-h-[40px]">
            Review & Approve Order
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Link to={`/orders/${order.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-[6px] text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted">PayPal Sandbox Checkout</span>
            <StatusBadge status={order.status} />
          </div>
          <h1 className="font-mono text-2xl font-extrabold text-ink tracking-tight">
            Checkout {order.orderNumber}
          </h1>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="rounded-[12px] border border-border bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted">Purchase Order Summary</span>
          <span className="text-xs font-mono text-muted">{order.lines.length} items · {order.supplierGroups.length} distributors</span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          {order.lines.map((line, idx) => (
            <div key={idx} className="flex justify-between text-muted">
              <span>{line.quantity} × {line.productName} ({line.supplierName})</span>
              <span className="text-ink tabular-nums">{formatPaise(line.lineTotalPaise)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-3 flex justify-between font-bold text-sm text-ink">
            <span>Authoritative Payable Total</span>
            <span className="text-base text-ink tabular-nums">{formatPaise(order.totalPaise)}</span>
          </div>
        </div>
      </div>

      {/* PayPal Checkout Form */}
      <PayPalCheckout
        order={order}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
