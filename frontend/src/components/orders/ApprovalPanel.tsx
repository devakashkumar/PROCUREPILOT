import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button.js";
import { Dialog } from "../ui/Dialog.js";
import { Textarea } from "../ui/Textarea.js";
import { formatInr } from "../../lib/format.js";
import { Check, ShieldAlert, CreditCard, Info } from "lucide-react";
import { PurchaseOrder } from "../../types/api.js";

interface ApprovalPanelProps {
  order: PurchaseOrder;
  onApprove: () => void;
  onReject: (reason: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export function ApprovalPanel({
  order,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: ApprovalPanelProps) {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleRejectSubmit = () => {
    if (rejectReason.trim().length >= 2) {
      onReject(rejectReason.trim());
      setRejectDialogOpen(false);
    }
  };

  return (
    <div className="p-6 sm:p-7 bg-surface border border-border rounded-[14px] flex flex-col gap-6 shadow-xl">
      {/* Honest fulfillment notice */}
      <div className="p-4 rounded-[8px] bg-surface-elevated border border-border flex items-start gap-3 text-xs text-muted">
        <Info className="h-4 w-4 text-ink shrink-0 mt-0.5" />
        <p className="leading-relaxed font-sans">
          <strong className="text-ink">Fulfillment Notice:</strong> Payment is settled once via PayPal Sandbox to the verified merchant account. The order is fulfilled by the {order.supplierGroups.length} supplier group(s) detailed below. No automated unverified supplier transfers occur.
        </p>
      </div>

      {/* STATE 1: PENDING APPROVAL */}
      {order.status === "PENDING_APPROVAL" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Step 1 of 2</span>
            <h3 className="text-lg font-bold text-ink tracking-tight">
              Owner Verification & Approval Required
            </h3>
            <p className="text-xs text-muted">
              The autonomous agent has structured this plan. Verify supplier terms before unlocking checkout.
            </p>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-3 p-4 rounded-[8px] border border-border bg-surface-elevated cursor-pointer select-none hover:border-border-strong transition-colors">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded-[3px] border-border bg-surface text-ink focus:ring-ink/20 accent-current"
            />
            <div className="text-xs text-ink/80 leading-relaxed font-sans">
              I have reviewed the {order.lines.length} items, distributor reliability scores, delivery turnaround, and the authoritative total of{" "}
              <strong className="font-mono text-ink underline decoration-current tabular-nums">
                {formatInr(order.totalPaise)}
              </strong>
              .
            </div>
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              onClick={onApprove}
              disabled={!confirmed}
              isLoading={isApproving}
              variant="primary"
              size="lg"
              className="w-full sm:flex-1 font-bold text-xs shadow-sm py-3 px-4 min-h-[44px]"
            >
              <Check className="h-4 w-4 mr-1 shrink-0" />
              <span className="truncate sm:whitespace-normal">Approve Purchase Order</span>
            </Button>

            <Button
              onClick={() => setRejectDialogOpen(true)}
              variant="danger"
              size="lg"
              className="w-full sm:w-auto px-5 font-medium text-xs min-h-[44px]"
            >
              <ShieldAlert className="h-4 w-4 mr-1 shrink-0" />
              <span>Reject</span>
            </Button>
          </div>
        </div>
      )}

      {/* STATE 2: APPROVED (Ready for PayPal) */}
      {order.status === "APPROVED" && (
        <div className="flex flex-col gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Step 2 of 2 · Ready</span>
            <h3 className="text-lg font-bold text-ink tracking-tight mt-0.5">
              Order Approved by Proprietor
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Unlocked for PayPal Sandbox checkout at the fixed demo conversion rate (₹88/USD).
            </p>
          </div>

          <Button
            onClick={() => navigate(`/orders/${order.id}/checkout`)}
            variant="primary"
            size="lg"
            className="w-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md py-3.5 px-4 min-h-[48px]"
          >
            <CreditCard className="h-4 w-4 shrink-0" />
            <span className="leading-tight text-center">Proceed to PayPal Checkout · {formatInr(order.totalPaise)}</span>
          </Button>
        </div>
      )}

      {/* STATE 3: PAYMENT PENDING */}
      {order.status === "PAYMENT_PENDING" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-[8px] bg-sky-500/10 border border-sky-500/30">
          <div>
            <div className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Payment In Progress</div>
            <div className="text-xs text-muted mt-0.5">Complete PayPal checkout to finalize procurement settlement.</div>
          </div>
          <Button
            onClick={() => navigate(`/orders/${order.id}/checkout`)}
            variant="primary"
            size="md"
            className="w-full sm:w-auto font-bold text-xs h-9"
          >
            Resume Checkout
          </Button>
        </div>
      )}

      {/* STATE 4: PAID */}
      {order.status === "PAID" && (
        <div className="flex items-center justify-between p-4 rounded-[8px] bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-[4px] bg-emerald-500 text-black flex items-center justify-center">
              <Check className="h-4 w-4 stroke-[3]" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Order Paid & Verified</div>
              <div className="text-xs text-muted">Fulfillment sub-orders dispatched to regional distributors.</div>
            </div>
          </div>
          <Button
            onClick={() => navigate(`/orders/${order.id}/payment-result`)}
            variant="secondary"
            size="sm"
            className="font-mono text-xs h-8"
          >
            View Receipt
          </Button>
        </div>
      )}

      {/* Reject Reason Dialog */}
      <Dialog
        isOpen={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        title="Reject Purchase Order"
        description="Please provide a mandatory reason for declining this procurement plan."
      >
        <div className="flex flex-col gap-4 pt-2">
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Total exceeds weekly cash flow, or alternative suppliers preferred."
            rows={3}
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRejectSubmit}
              disabled={rejectReason.trim().length < 2}
              isLoading={isRejecting}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
