import { formatInr, formatUsd } from "../../lib/format.js";
import { AlertCircle } from "lucide-react";

export interface FxNoticeProps {
  amountInrPaise?: number;
  totalPaise?: number;
  amountUsdCents?: number;
  rate?: number;
}

export function FxNotice({
  amountInrPaise,
  totalPaise,
  amountUsdCents,
  rate = 88,
}: FxNoticeProps) {
  const effectiveInrPaise = amountInrPaise ?? totalPaise ?? 0;
  const effectiveUsdCents =
    amountUsdCents ?? Math.round((effectiveInrPaise / (rate * 100)) * 100);

  return (
    <div className="p-4 rounded-[10px] bg-surface border border-border-strong flex items-start gap-3 text-xs shadow-sm">
      <AlertCircle className="h-4 w-4 text-muted shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1 text-ink">
        <span className="font-mono font-bold uppercase tracking-widest text-[10px] text-muted">
          Demo Currency Conversion Notice
        </span>
        <p className="text-muted leading-relaxed font-sans text-xs">
          PayPal Sandbox does not natively settle in Indian Rupee (INR). Authoritative ledger arithmetic is maintained in INR (
          <strong className="text-ink font-mono">{formatInr(effectiveInrPaise)}</strong>). For Sandbox payment capture, the total is converted to USD (
          <strong className="text-ink font-mono">{formatUsd(effectiveUsdCents)}</strong>) at the fixed demo conversion rate of ₹{rate}/USD.
        </p>
      </div>
    </div>
  );
}
