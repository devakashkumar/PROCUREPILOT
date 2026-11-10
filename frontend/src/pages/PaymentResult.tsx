import React from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, ShieldCheck, ShoppingBag, Hash, CreditCard, RefreshCw } from "lucide-react";
import { useOrder } from "../api/orders.js";
import { usePayment } from "../api/payments.js";
import { PaymentStatusCard } from "../components/payments/PaymentStatusCard.js";
import { Button } from "../components/ui/Button.js";
import { Skeleton } from "../components/ui/Skeleton.js";

export const PaymentResult: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const paymentIdFromQuery = searchParams.get("paymentId") || "";

  const { data: orderData, isLoading: isOrderLoading, refetch: refetchOrder } = useOrder(id);
  const paymentId = paymentIdFromQuery || orderData?.order?.paymentId || "";

  const { data: payment, isLoading: isPaymentLoading, refetch: refetchPayment } = usePayment(
    paymentId,
    { refetchInterval: 3000 } // Poll every 3 seconds to update webhook delivery status
  );

  const order = orderData?.order;
  const isLoading = isOrderLoading || (!payment && isPaymentLoading);

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      {/* Animated Success Banner */}
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
        </div>
        <h1 className="mt-5 font-heading text-2xl sm:text-3xl font-extrabold text-ink">
          Payment Captured & Verified
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted max-w-md mx-auto">
          Your purchase order has been successfully funded via PayPal Sandbox and transitioned to{" "}
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">PAID</span>.
        </p>

        {order && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 font-mono text-xs text-ink shadow-sm">
            <Hash className="h-3.5 w-3.5 text-muted" />
            <span>Order Number: <strong>{order.orderNumber}</strong></span>
          </div>
        )}
      </div>

      {/* Dual Verification & Payment Record Details */}
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : payment ? (
        <PaymentStatusCard payment={payment} />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-xs text-muted">
          Payment record details are syncing. Refreshing status...
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link to={`/orders/${id}`} className="w-full sm:w-auto">
          <Button variant="accent" size="lg" className="w-full gap-2 font-bold shadow-md shadow-accent/20">
            <ShoppingBag className="h-4 w-4" />
            View Order Fulfillment
          </Button>
        </Link>
        <Link to="/dashboard" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full gap-2 font-semibold">
            Return to Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
