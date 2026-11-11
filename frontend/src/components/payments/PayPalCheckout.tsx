import React, { useState } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Loader2, ShieldCheck, AlertCircle, Zap, CreditCard, ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
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
  const [isCapturing, setIsCapturing] = useState(false);
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [approveUrl, setApproveUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"paypal" | "instant">("paypal");
  const [sdkError, setSdkError] = useState<string | null>(null);

  // 1-Click Instant Sandbox Capture (Primary method for evaluation & testing)
  const handleQuickSandboxCapture = async () => {
    try {
      setIsCapturing(true);
      setSdkError(null);
      toast.loading("Initiating PayPal Sandbox order...", { id: "quick-pay" });
      const created = await paymentsApi.create(order.id);
      setCreatedPaymentId(created.paymentId);
      setCreatedOrderId(created.paypalOrderId);
      if (created.approveUrl) setApproveUrl(created.approveUrl);

      toast.loading("Executing server capture & cryptographic verification...", { id: "quick-pay" });
      const captureResult = await paymentsApi.capture(created.paypalOrderId, true);

      toast.success("Sandbox payment verified & captured!", { id: "quick-pay" });
      onSuccess(captureResult.paymentId || created.paymentId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment capture failed";
      toast.error(message, { id: "quick-pay" });
      setSdkError(message);
      onError?.(err instanceof Error ? err : new Error(message));
    } finally {
      setIsCapturing(false);
    }
  };

  // Called directly by the PayPal SDK button when user clicks it
  // IMPORTANT: Do NOT unmount or hide the PayPal button while this runs!
  const handleCreateOrder = async (): Promise<string> => {
    try {
      setSdkError(null);
      const res = await paymentsApi.create(order.id);
      setCreatedPaymentId(res.paymentId);
      setCreatedOrderId(res.paypalOrderId);
      if (res.approveUrl) {
        setApproveUrl(res.approveUrl);
      } else {
        setApproveUrl(`https://www.sandbox.paypal.com/checkoutnow?token=${res.paypalOrderId}`);
      }
      return res.paypalOrderId;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to initiate PayPal payment";
      toast.error(message);
      setSdkError(message);
      onError?.(err instanceof Error ? err : new Error(message));
      throw err;
    }
  };

  const handleApprove = async (data: { orderID: string }) => {
    try {
      setIsCapturing(true);
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
      setIsCapturing(false);
    }
  };

  const handleCancel = async (data: Record<string, unknown>) => {
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

  // Manual verification in case user approved via direct tab
  const handleManualVerify = async () => {
    if (!createdOrderId) return;
    try {
      setIsCapturing(true);
      toast.loading("Querying PayPal for approved capture...", { id: "manual-verify" });
      const captureResult = await paymentsApi.capture(createdOrderId);
      toast.success("Payment verified & captured!", { id: "manual-verify" });
      onSuccess(captureResult.paymentId || createdPaymentId || "");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Capture verification failed";
      toast.error(message, { id: "manual-verify" });
      setSdkError(message);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Currency Notice */}
      <FxNotice totalPaise={order.totalPaise} />

      {/* Safety Notice */}
      <div className="flex items-start gap-2.5 rounded-[8px] border border-border bg-surface-elevated px-4 py-3 text-xs text-muted">
        <ShieldCheck className="h-4 w-4 shrink-0 text-ink mt-0.5" />
        <span className="leading-relaxed font-sans">
          Payment is escrowed to ProcurePilot Sandbox. Authoritative totals are re-verified by the backend server before capture.
        </span>
      </div>

      {/* Capturing Processing Banner (Overlaid without unmounting PayPal buttons) */}
      {isCapturing && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[12px] border border-border-strong bg-surface p-6 shadow-xl text-center">
          <Loader2 className="h-6 w-6 animate-spin text-ink" />
          <div>
            <p className="font-bold text-sm text-ink tracking-tight">Communicating with PayPal Sandbox...</p>
            <p className="text-xs text-muted mt-1 font-sans">
              Re-verifying purchase order lines, currency conversion, and capturing funds.
            </p>
          </div>
        </div>
      )}

      {/* Main Interactive Checkout Card */}
      <div className="space-y-5">
        {/* Method Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 rounded-[8px] bg-background/40 p-1 border border-border">
          <button
            type="button"
            onClick={() => setActiveTab("paypal")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-[6px] text-xs font-mono transition-all cursor-pointer ${
              activeTab === "paypal"
                ? "bg-ink text-background font-bold shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>PayPal SDK Checkout</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("instant")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-[6px] text-xs font-mono transition-all cursor-pointer ${
              activeTab === "instant"
                ? "bg-ink text-background font-bold shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>1-Click Sandbox Test</span>
          </button>
        </div>

        {/* TAB 1: Standard PayPal SDK Buttons (Keep mounted at all times!) */}
        <div className={activeTab === "paypal" ? "block space-y-4" : "hidden"}>
          <div className="rounded-[12px] border border-border bg-surface p-5 sm:p-6 shadow-sm space-y-4">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-ink tracking-tight">Official PayPal Sandbox Gateway</h4>
                <p className="mt-0.5 text-xs text-muted font-sans">
                  Click the PayPal button below to open the checkout flow.
                </p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted px-2 py-0.5 border border-border rounded-[4px]">
                Sandbox
              </span>
            </div>

            {isPending && (
              <div className="flex items-center justify-center gap-2 rounded-[8px] border border-border bg-surface-elevated p-6 font-mono text-xs text-muted">
                <Loader2 className="h-4 w-4 animate-spin text-ink" />
                <span>Loading PayPal Sandbox SDK...</span>
              </div>
            )}

            {isRejected && (
              <div className="rounded-[8px] border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200 space-y-2 font-mono">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>PayPal SDK could not connect</span>
                </div>
                <p className="font-sans text-muted">
                  Use the 1-Click Instant Sandbox Capture option to complete the settlement without third-party scripts.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="w-full gap-1.5 font-bold text-xs h-9"
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
                  disabled={isCapturing}
                  createOrder={handleCreateOrder}
                  onApprove={handleApprove}
                  onCancel={handleCancel}
                  onError={(err) => {
                    const msg = "PayPal Sandbox window was closed or encountered a network error.";
                    toast.error(msg);
                    setSdkError(msg);
                    console.error("PayPalButtons error:", err);
                  }}
                />
              </div>
            )}

            {/* Direct Window Fallback in case browser blocks or loops popups */}
            {approveUrl && (
              <div className="rounded-[8px] border border-border bg-surface-elevated p-4 text-xs space-y-3 font-mono">
                <div className="flex items-center gap-2 text-ink font-semibold">
                  <ExternalLink className="h-4 w-4 text-muted" />
                  <span>Popup blocked or stuck on loading?</span>
                </div>
                <p className="text-muted font-sans text-xs leading-relaxed">
                  You can open the PayPal Sandbox checkout in a direct browser tab:
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <a
                    href={approveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full gap-1.5 text-xs font-bold min-h-[38px]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open PayPal Checkout in New Tab ↗
                    </Button>
                  </a>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto gap-1.5 text-xs font-bold min-h-[38px]"
                    onClick={handleManualVerify}
                    isLoading={isCapturing}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    I Have Approved — Verify Capture
                  </Button>
                </div>
              </div>
            )}

            {/* In-case of popup freeze or error, provide escape button */}
            {sdkError && (
              <div className="rounded-[8px] border border-rose-500/30 bg-rose-950/20 p-3.5 text-xs text-rose-300 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>PayPal window issue detected</span>
                </div>
                <p className="text-[11px] leading-relaxed font-sans text-muted">
                  {sdkError}
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="w-full gap-1.5 font-bold text-xs h-9"
                  onClick={handleQuickSandboxCapture}
                  isLoading={isCapturing}
                >
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  Complete With 1-Click Instant Capture Instead
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* TAB 2: 1-Click Instant Sandbox Capture */}
        <div className={activeTab === "instant" ? "block space-y-4" : "hidden"}>
          <div className="rounded-[12px] border border-border bg-surface p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-ink">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> INSTANT SETTLEMENT TEST
              </span>
              <span className="text-[10px] font-mono text-muted">Zero Personal Credentials Required</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-ink tracking-tight">
                1-Click Sandbox Capture
              </h3>
              <p className="mt-1 text-xs text-muted leading-relaxed font-sans">
                Initiates a real Orders API v2 order on PayPal's sandbox servers and executes verified server-side capture in one tap without requiring personal PayPal buyer account logins.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full gap-2 text-sm font-bold min-h-[48px] shadow-[0_0_25px_rgba(255,255,255,0.2)]"
              onClick={handleQuickSandboxCapture}
              isLoading={isCapturing}
            >
              <Zap className="h-4 w-4 fill-current" />
              Complete Sandbox Payment Now
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>

            <div className="flex items-center justify-between text-[11px] font-mono text-muted border-t border-border pt-3">
              <span>✓ Orders API v2</span>
              <span>✓ Server Verification</span>
              <span>✓ Transition to PAID</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
