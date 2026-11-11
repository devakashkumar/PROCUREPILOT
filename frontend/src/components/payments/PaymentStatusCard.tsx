import React from "react";
import { CheckCircle2, Clock, ShieldCheck, Hash } from "lucide-react";
import { Payment } from "../../types/api.js";
import { formatPaise, formatUsdCents, formatRelativeTime, formatDate } from "../../lib/format.js";
import { cn } from "../../lib/cn.js";
import { Badge } from "../ui/Badge.js";

interface PaymentStatusCardProps {
  payment: Payment;
  className?: string;
}

export const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({ payment, className }) => {
  const isCompleted = payment.status === "COMPLETED";
  const isFailed = payment.status === "FAILED";
  const isWebhookConfirmed = Boolean(payment.verifiedByWebhookAt);
  const isServerVerified = Boolean(payment.capturedAt || isCompleted);

  return (
    <div
      className={cn(
        "rounded-[12px] border bg-surface p-6 shadow-xl transition-all duration-200",
        isCompleted ? "border-emerald-500/40" : "border-border-strong",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-muted uppercase">Payment Verification</span>
          <h3 className="text-base font-bold text-ink tracking-tight mt-0.5">
            PayPal Sandbox Settlement
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              isCompleted ? "success" : isFailed ? "danger" : "warning"
            }
            size="default"
            className="font-mono tracking-wide"
          >
            {payment.status}
          </Badge>
        </div>
      </div>

      {/* Dual Verification Status Badges */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Verification 1: Server Capture */}
        <div
          className={cn(
            "flex items-start gap-3 rounded-[8px] border p-3.5 transition-colors font-sans",
            isServerVerified
              ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
              : "border-border bg-surface-elevated text-muted"
          )}
        >
          {isServerVerified ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <Clock className="h-4 w-4 shrink-0 text-muted mt-0.5" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-ink">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Verified by Server Capture</span>
            </div>
            <p className="text-[11px] text-muted mt-0.5 font-mono">
              {payment.capturedAt
                ? `Captured at ${formatDate(payment.capturedAt)}`
                : "Capture verification in progress"}
            </p>
          </div>
        </div>

        {/* Verification 2: PayPal Webhook Signature */}
        <div
          className={cn(
            "flex items-start gap-3 rounded-[8px] border p-3.5 transition-colors font-sans",
            isWebhookConfirmed
              ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
              : "border-amber-500/30 bg-amber-950/20 text-amber-300"
          )}
        >
          {isWebhookConfirmed ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <Clock className="h-4 w-4 shrink-0 text-amber-400 mt-0.5 animate-pulse" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-ink">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Confirmed via Webhook Signature</span>
            </div>
            <p className="text-[11px] text-muted mt-0.5 font-mono">
              {payment.verifiedByWebhookAt
                ? `Cryptographically verified: ${formatDate(payment.verifiedByWebhookAt)}`
                : "Awaiting asynchronous PayPal webhook"}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Details Grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 rounded-[8px] bg-surface-elevated border border-border p-4 sm:grid-cols-4 font-mono">
        <div>
          <span className="text-[10px] text-muted uppercase">Authoritative INR</span>
          <p className="text-sm font-bold text-ink tabular-nums mt-0.5">
            {formatPaise(payment.amountInrPaise)}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-muted uppercase">Billed USD</span>
          <p className="text-sm font-bold text-ink tabular-nums mt-0.5">
            {formatUsdCents(payment.amountUsdCents)}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-muted uppercase">Demo Rate</span>
          <p className="text-xs font-medium text-muted mt-0.5">
            ₹{payment.fxRateInrPerUsd} / $1 USD
          </p>
        </div>
        <div>
          <span className="text-[10px] text-muted uppercase">Payer</span>
          <p className="truncate text-xs text-muted mt-0.5" title={payment.payerEmail || "Demo User"}>
            {payment.payerEmail || "Sandbox Payer"}
          </p>
        </div>
      </div>

      {/* Identifiers */}
      <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-xs font-mono text-muted">
        {payment.paypalOrderId && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Hash className="h-3.5 w-3.5 text-muted" /> PayPal Order ID:
            </span>
            <span className="font-semibold text-ink select-all">{payment.paypalOrderId}</span>
          </div>
        )}
        {payment.paypalCaptureId && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Hash className="h-3.5 w-3.5 text-muted" /> PayPal Capture ID:
            </span>
            <span className="font-semibold text-ink select-all">{payment.paypalCaptureId}</span>
          </div>
        )}
      </div>

      {/* Audit History */}
      {payment.history && payment.history.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted">Audit History</span>
          <div className="mt-2 space-y-2">
            {payment.history.map((event, index) => (
              <div key={index} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
                  <span className="font-bold text-ink">{event.status}</span>
                  <span className="text-muted">via {event.source}</span>
                  {event.note && <span className="text-muted italic">— {event.note}</span>}
                </div>
                <span className="text-muted">{formatRelativeTime(event.at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
