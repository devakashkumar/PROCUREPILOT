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
    <div className="p-4 rounded-[16px] bg-subtle border border-border flex items-start gap-3 text-xs">
      <AlertCircle className="h-5 w-5 text-muted shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1 text-ink">
        <span className="font-extrabold text-ink uppercase tracking-wider text-[11px]">
          Demo Currency Conversion Notice
        </span>
        <p className="text-muted leading-relaxed font-medium">
          PayPal does not support Indian Rupee (INR) payments. Internally all ledger arithmetic is maintained in INR (
          <strong className="text-ink font-mono">{formatInr(effectiveInrPaise)}</strong>). For PayPal Sandbox checkout, the total is converted to USD (
          <strong className="text-ink font-mono">{formatUsd(effectiveUsdCents)}</strong>) at the fixed demo conversion rate of ₹{rate}/USD.
        </p>
      </div>
    </div>
  );
}
