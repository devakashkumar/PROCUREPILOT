import React from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, ShoppingBag, Hash } from "lucide-react";
import { useOrder } from "../api/orders.js";
import { usePayment } from "../api/payments.js";
import { PaymentStatusCard } from "../components/payments/PaymentStatusCard.js";
import { Button } from "../components/ui/Button.js";
import { Skeleton } from "../components/ui/Skeleton.js";

export const PaymentResult: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const paymentIdFromQuery = searchParams.get("paymentId") || "";

  const { data: orderData, isLoading: isOrderLoading } = useOrder(id);
  const paymentId = paymentIdFromQuery || orderData?.order?.paymentId || "";

  const { data: payment, isLoading: isPaymentLoading } = usePayment(
    paymentId,
    { refetchInterval: 3000 }
  );

  const order = orderData?.order;
  const isLoading = isOrderLoading || (!payment && isPaymentLoading);

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      {/* Animated Success Banner */}
      <div className="rounded-[14px] border border-emerald-500/30 bg-emerald-950/20 p-8 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[8px] bg-emerald-500 text-black shadow-[0_0_25px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
        </div>
        <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
          Payment Captured & Verified
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted max-w-md mx-auto font-sans leading-relaxed">
          Your purchase order has been successfully settled via PayPal Sandbox and transitioned to{" "}
          <span className="font-mono font-bold text-emerald-400">PAID</span>.
        </p>

        {order && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-[6px] border border-border-strong bg-black/60 px-4 py-2 font-mono text-xs text-ink shadow-sm">
            <Hash className="h-3.5 w-3.5 text-muted" />
            <span>Order Number: <strong className="text-ink">{order.orderNumber}</strong></span>
          </div>
        )}
      </div>

      {/* Dual Verification & Payment Record Details */}
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-[12px]" />
      ) : payment ? (
        <PaymentStatusCard payment={payment} />
      ) : (
        <div className="rounded-[12px] border border-border bg-surface p-6 text-center text-xs font-mono text-muted">
          Payment record details are syncing. Polling gateway...
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Link to={`/orders/${id}`} className="w-full sm:w-auto">
          <Button variant="primary" size="lg" className="w-full gap-2 font-bold text-xs h-11 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <ShoppingBag className="h-4 w-4" />
            View Order Fulfillment
          </Button>
        </Link>
        <Link to="/dashboard" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full gap-2 font-medium text-xs h-11">
            Return to Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
