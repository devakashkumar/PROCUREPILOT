import React, { useState } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Loader2, ShieldCheck, AlertCircle, Zap, CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"instant" | "paypal">("instant");
  const [sdkError, setSdkError] = useState<string | null>(null);

  // 1-Click Instant Sandbox Capture (Primary method for hackathon demo & evaluation)
  const handleQuickSandboxCapture = async () => {
    try {
      setIsProcessing(true);
      setSdkError(null);
      toast.loading("Initiating PayPal Sandbox order...", { id: "quick-pay" });
      const created = await paymentsApi.create(order.id);
      
      toast.loading("Executing server capture & cryptographic verification...", { id: "quick-pay" });
      const captureResult = await paymentsApi.capture(created.paypalOrderId);
      
      toast.success("Sandbox payment verified & captured!", { id: "quick-pay" });
      onSuccess(captureResult.paymentId || created.paymentId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment capture failed";
      toast.error(message, { id: "quick-pay" });
      setSdkError(message);
      onError?.(err instanceof Error ? err : new Error(message));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateOrder = async (): Promise<string> => {
    try {
      setIsProcessing(true);
      setSdkError(null);
      const res = await paymentsApi.create(order.id);
      setCreatedPaymentId(res.paymentId);
      return res.paypalOrderId;
    } catch (err: unknown) {
      setIsProcessing(false);
      const message = err instanceof Error ? err.message : "Failed to initiate PayPal payment";
      toast.error(message);
      setSdkError(message);
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
      setSdkError(message);
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

  return (
    <div className="space-y-6">
      {/* Currency Notice */}
      <FxNotice totalPaise={order.totalPaise} />

      {/* Safety Notice */}
      <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary dark:text-accent">
        <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          Payment is escrowed to ProcurePilot Sandbox. Authoritative totals are re-verified by the backend server before capture.
        </span>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card/90 p-8 shadow-sm backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="font-heading font-bold text-base text-ink">Communicating with PayPal Sandbox...</p>
          <p className="text-xs text-muted text-center max-w-sm">
            Re-verifying purchase order lines, currency conversion, and capturing funds.
          </p>
        </div>
      )}

      {!isProcessing && (
        <div className="space-y-5">
          {/* Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-card-subtle p-1 border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("instant")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "instant"
                  ? "bg-accent text-accent-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>1-Click Sandbox</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("paypal")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "paypal"
                  ? "bg-card text-ink shadow-sm border border-border/80"
                  : "text-muted hover:text-ink"
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>PayPal SDK Buttons</span>
            </button>
          </div>

          {/* TAB 1: 1-Click Instant Sandbox Capture */}
          {activeTab === "instant" && (
            <div className="rounded-2xl border-2 border-accent/40 bg-card p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-accent">
                  <CheckCircle2 className="h-4 w-4" /> Recommended Demo Checkout
                </span>
                <span className="text-[11px] font-mono text-muted">Zero Credentials Required</span>
              </div>

              <div>
                <h3 className="font-heading text-lg font-extrabold text-ink">
                  Instant Sandbox Checkout
                </h3>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Executes the full server-side Orders API v2 create, capture, and verification cycle in one tap without needing to log into personal PayPal credentials.
                </p>
              </div>

              <Button
                type="button"
                variant="accent"
                size="lg"
                className="w-full gap-2 text-base font-bold shadow-lg shadow-accent/20 cursor-pointer"
                onClick={handleQuickSandboxCapture}
              >
                <Zap className="h-5 w-5 fill-current" />
                Complete Sandbox Payment Now
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>

              <div className="flex items-center justify-between text-[11px] text-muted border-t border-border/50 pt-3">
                <span>✓ Simulates Orders API v2</span>
                <span>✓ Server Verification</span>
                <span>✓ Auto-Transitions to PAID</span>
              </div>
            </div>
          )}

          {/* TAB 2: Standard PayPal SDK Buttons */}
          {activeTab === "paypal" && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div>
                <h4 className="font-heading text-sm font-bold text-ink">PayPal Sandbox Account</h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Requires personal PayPal Sandbox buyer credentials configured in your environment.
                </p>
              </div>

              {isPending && (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card-subtle p-6">
                  <Loader2 className="h-5 w-5 animate-spin text-accent" />
                  <span className="text-xs font-medium text-muted">Loading PayPal Sandbox SDK...</span>
                </div>
              )}

              {isRejected && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-700 dark:text-amber-400 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>PayPal SDK client could not load directly</span>
                  </div>
                  <p>
                    Please use the 1-Click Instant Sandbox Checkout option above to complete the demo.
                  </p>
                  <Button
                    type="button"
                    variant="accent"
                    size="sm"
                    className="w-full gap-1.5 font-bold"
                    onClick={handleQuickSandboxCapture}
                  >
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    Use 1-Click Sandbox Capture
                  </Button>
                </div>
              )}

              {isResolved && (
                <div className="pt-2">
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
                      const msg = "PayPal Sandbox window was closed or encountered an error.";
                      toast.error(msg);
                      setSdkError(msg);
                      console.error("PayPalButtons error:", err);
                    }}
                  />
                </div>
              )}

              {/* In-case of popup freeze or error, provide instant escape button */}
              {sdkError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-300 space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>PayPal popup stopped or encountered an issue</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {sdkError}
                  </p>
                  <Button
                    type="button"
                    variant="accent"
                    size="sm"
                    className="w-full gap-1.5 font-bold"
                    onClick={handleQuickSandboxCapture}
                  >
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    Complete With 1-Click Instant Capture Instead
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
