import React, { useState } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Loader2, ShieldCheck, AlertCircle, Zap } from "lucide-react";
import { toast } from "sonner";
import { PurchaseOrder } from "../../types/api.js";
import { paymentsApi } from "../../api/payments.js";
import { Button } from "../ui/Button.js";
import { FxNotice } from "./FxNotice.js";

interface PayPalCheckoutProps {
  order: PurchaseOrder;
  onSuccess: (paymentId: string) => void;
  onError?: (err: Error) => void;
}

export const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  order,
  onSuccess,
  onError,
}) => {
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null);

  const handleCreateOrder = async (): Promise<string> => {
    try {
      setIsProcessing(true);
      const res = await paymentsApi.create(order.id);
      setCreatedPaymentId(res.paymentId);
      return res.paypalOrderId;
    } catch (err: unknown) {
      setIsProcessing(false);
      const message = err instanceof Error ? err.message : "Failed to initiate PayPal payment";
      toast.error(message);
      onError?.(err instanceof Error ? err : new Error(message));
      throw err;
    }
  };

  const handleApprove = async (data: { orderID: string }) => {
    try {
      setIsProcessing(true);
      toast.loading("Verifying PayPal capture on server...", { id: "pp-capture" });
      const captureResult = await paymentsApi.capture(data.orderID);
      toast.success("Payment verified and captured successfully!", { id: "pp-capture" });
      onSuccess(captureResult.paymentId || createdPaymentId || "");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment capture failed";
      toast.error(message, { id: "pp-capture" });
      onError?.(err instanceof Error ? err : new Error(message));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async (data: Record<string, unknown>) => {
    setIsProcessing(false);
    toast.info("PayPal checkout was cancelled.");
    const orderID = (data.orderID as string) || "";
    if (orderID) {
      try {
        await paymentsApi.cancel(orderID);
      } catch {
        // Silently swallow cancel notification error
      }
    }
  };

  // Direct sandbox capture (ideal for local testing / demo without logging into PayPal account)
  const handleQuickSandboxCapture = async () => {
    try {
      setIsProcessing(true);
      toast.loading("Initiating PayPal Sandbox order...", { id: "quick-pay" });
      const created = await paymentsApi.create(order.id);
      toast.loading("Executing server capture...", { id: "quick-pay" });
      const captureResult = await paymentsApi.capture(created.paypalOrderId);
      toast.success("Sandbox payment completed & verified!", { id: "quick-pay" });
      onSuccess(captureResult.paymentId || created.paymentId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Quick capture failed";
      toast.error(message, { id: "quick-pay" });
      onError?.(err instanceof Error ? err : new Error(message));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Currency Notice */}
      <FxNotice totalPaise={order.totalPaise} />

      {/* Safety Notice */}
      <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary dark:text-accent">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>
          Payment is escrowed to ProcurePilot Sandbox. Authoritative totals are re-verified by the backend before capture.
        </span>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card/80 p-8 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="font-semibold text-sm text-ink">Communicating with PayPal Sandbox...</p>
          <p className="text-xs text-muted">Recomputing totals and verifying signatures</p>
        </div>
      )}

      {/* PayPal Button Container */}
      {!isProcessing && (
        <div className="space-y-4">
          {isPending && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card-subtle p-6">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
              <span className="text-xs font-medium text-muted">Loading PayPal Sandbox SDK...</span>
            </div>
          )}

          {isRejected && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-700 dark:text-amber-400">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4" />
                <span>PayPal SDK could not connect directly</span>
              </div>
              <p className="mt-1">
                You can complete the checkout using the direct backend Sandbox test flow below.
              </p>
            </div>
          )}

          {isResolved && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <PayPalButtons
                style={{
                  layout: "vertical",
                  color: "gold",
                  shape: "rect",
                  label: "pay",
                  height: 48,
                }}
                disabled={isProcessing}
                createOrder={handleCreateOrder}
                onApprove={handleApprove}
                onCancel={handleCancel}
                onError={(err) => {
                  toast.error("PayPal encountered an error. You may use Quick-Pay.");
                  console.error("PayPalButtons error:", err);
                }}
              />
            </div>
          )}

          {/* Quick-Pay Sandbox Demo Button */}
          <div className="pt-2">
            <div className="relative flex items-center justify-center py-2">
              <div className="w-full border-t border-border" />
              <span className="absolute bg-background px-3 text-[11px] font-medium tracking-wider text-muted uppercase">
                Or Hackathon Demo Mode
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="mt-2 w-full gap-2 border-accent/40 bg-accent/5 hover:bg-accent/10 text-ink dark:text-accent font-semibold"
              onClick={handleQuickSandboxCapture}
              disabled={isProcessing}
            >
              <Zap className="h-4 w-4 text-accent fill-current" />
              Instant Sandbox Checkout (1-Click Capture)
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted">
              Creates PayPal order and captures via backend Orders API v2 without logging into personal PayPal account.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
