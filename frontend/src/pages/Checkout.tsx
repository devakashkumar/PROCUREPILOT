import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, AlertCircle, ShoppingBag } from "lucide-react";
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
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h3 className="mt-4 font-heading text-lg font-bold text-ink">Order Not Found</h3>
        <Link to="/orders" className="mt-4 inline-block">
          <Button variant="outline" size="sm">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  // Mandatory Safety Check: Order must be APPROVED or PAYMENT_PENDING
  if (order.status !== "APPROVED" && order.status !== "PAYMENT_PENDING") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-amber-500" />
        <h3 className="mt-4 font-heading text-lg font-bold text-ink">
          Approval Required Before Payment
        </h3>
        <p className="mt-2 text-xs text-muted leading-relaxed">
          The safety state machine requires explicit owner sign-off before a PayPal order can be created.
          This order currently has status <strong className="text-ink">{order.status}</strong>.
        </p>
        <Link to={`/orders/${order.id}`} className="mt-6 inline-block">
          <Button variant="accent" size="md" className="font-bold">
            Review & Approve Order
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-5">
        <Link to={`/orders/${order.id}`}>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-accent uppercase">PayPal Sandbox Checkout</span>
            <StatusBadge status={order.status} />
          </div>
          <h1 className="font-mono text-2xl font-black text-ink tracking-tight">
            Checkout {order.orderNumber}
          </h1>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Purchase Order Summary</span>
          <span className="text-xs text-muted">{order.lines.length} items • {order.supplierGroups.length} suppliers</span>
        </div>

        <div className="space-y-2 text-xs">
          {order.lines.map((line, idx) => (
            <div key={idx} className="flex justify-between text-muted">
              <span>{line.quantity} × {line.productName} ({line.supplierName})</span>
              <span className="font-mono text-ink">{formatPaise(line.lineTotalPaise)}</span>
            </div>
          ))}
          <div className="border-t border-border/60 pt-3 flex justify-between font-bold text-sm text-ink">
            <span>Authoritative Payable Total</span>
            <span className="font-mono text-base text-accent">{formatPaise(order.totalPaise)}</span>
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
