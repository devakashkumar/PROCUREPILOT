import React from "react";
import { CheckCircle2, Clock, AlertCircle, ShieldCheck, ArrowRightLeft, User, Hash } from "lucide-react";
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
        "rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200",
        isCompleted ? "border-emerald-500/30 dark:border-emerald-500/20" : "border-border",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <span className="text-xs font-semibold tracking-wider text-muted uppercase">Payment Record</span>
          <h3 className="text-lg font-bold text-ink">
            PayPal Sandbox Payment
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              isCompleted ? "success" : isFailed ? "danger" : "warning"
            }
            size="lg"
            className="font-mono tracking-wide"
          >
            {payment.status}
          </Badge>
        </div>
      </div>

      {/* Dual Verification Status Badges */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Verification 1: Server Capture */}
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4 transition-colors",
            isServerVerified
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
              : "border-border bg-card-subtle text-muted"
          )}
        >
          {isServerVerified ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : (
            <Clock className="h-5 w-5 shrink-0 text-muted mt-0.5" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-semibold text-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified by Server</span>
            </div>
            <p className="text-xs text-muted mt-1">
              {payment.capturedAt
                ? `Authoritative capture verified at ${formatDate(payment.capturedAt)}`
                : "Capture verification in progress"}
            </p>
          </div>
        </div>

        {/* Verification 2: PayPal Webhook Signature */}
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4 transition-colors",
            isWebhookConfirmed
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
              : "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400"
          )}
        >
          {isWebhookConfirmed ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : (
            <Clock className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5 animate-pulse" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-semibold text-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>Confirmed by PayPal Webhook</span>
            </div>
            <p className="text-xs text-muted mt-1">
              {payment.verifiedByWebhookAt
                ? `Cryptographically verified webhook at ${formatDate(payment.verifiedByWebhookAt)}`
                : "Awaiting PayPal webhook confirmation"}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Details Grid */}
      <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-card-subtle p-4 sm:grid-cols-4">
        <div>
          <span className="text-xs text-muted">Authoritative INR</span>
          <p className="font-mono text-base font-bold text-ink">
            {formatPaise(payment.amountInrPaise)}
          </p>
        </div>
        <div>
          <span className="text-xs text-muted">Billed Sandbox USD</span>
          <p className="font-mono text-base font-bold text-accent">
            {formatUsdCents(payment.amountUsdCents)}
          </p>
        </div>
        <div>
          <span className="text-xs text-muted">Conversion Rate</span>
          <p className="font-mono text-xs font-medium text-ink mt-1">
            ₹{payment.fxRateInrPerUsd} / $1 USD
          </p>
        </div>
        <div>
          <span className="text-xs text-muted">Payer</span>
          <p className="truncate font-mono text-xs text-ink mt-1" title={payment.payerEmail || "Demo User"}>
            {payment.payerEmail || "Sandbox Payer"}
          </p>
        </div>
      </div>

      {/* Identifiers */}
      <div className="mt-4 space-y-1.5 border-t border-border/60 pt-4 text-xs font-mono text-muted">
        {payment.paypalOrderId && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Hash className="h-3.5 w-3.5" /> PayPal Order ID:
            </span>
            <span className="font-semibold text-ink select-all">{payment.paypalOrderId}</span>
          </div>
        )}
        {payment.paypalCaptureId && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Hash className="h-3.5 w-3.5" /> PayPal Capture ID:
            </span>
            <span className="font-semibold text-ink select-all">{payment.paypalCaptureId}</span>
          </div>
        )}
      </div>

      {/* Audit History */}
      {payment.history && payment.history.length > 0 && (
        <div className="mt-5 border-t border-border/60 pt-4">
          <span className="text-xs font-semibold text-muted">Audit History</span>
          <div className="mt-2 space-y-2">
            {payment.history.map((event, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="font-mono font-medium text-ink">{event.status}</span>
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
