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
    <div className="card-sharp p-6 sm:p-8 bg-surface border-2 border-ink/20 rounded-[24px] flex flex-col gap-6">
      {/* Persistent honest fulfillment notice */}
      <div className="p-4 rounded-[16px] bg-subtle border border-border flex items-start gap-3 text-xs font-semibold text-muted">
        <Info className="h-5 w-5 text-ink shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-ink">Honest Fulfillment Model:</strong> You pay ProcurePilot once via PayPal Sandbox. The purchase order is fulfilled by the {order.supplierGroups.length} supplier group(s) detailed below. We do not make automated multi-party supplier transfers.
        </p>
      </div>

      {/* STATE 1: PENDING APPROVAL */}
      {order.status === "PENDING_APPROVAL" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-extrabold text-ink tracking-tight">
              Owner Review & Approval Required
            </h3>
            <p className="text-xs text-muted">
              AI has structured and optimized this purchase plan. Before moving forward, you must verify the details.
            </p>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-3 p-4 rounded-[16px] border border-border bg-background cursor-pointer select-none hover:border-ink transition-colors">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-border text-ink focus:ring-ink"
            />
            <div className="text-xs font-semibold text-ink leading-relaxed">
              I have reviewed the {order.lines.length} items, supplier reliability ratings, delivery schedules, and the authoritative total of{" "}
              <strong className="font-mono text-sm underline decoration-accent decoration-2">
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
              className="w-full sm:flex-1 h-14 font-extrabold"
            >
              <Check className="h-5 w-5 mr-1" />
              <span>Approve Purchase Order</span>
            </Button>

            <Button
              onClick={() => setRejectDialogOpen(true)}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto h-14 px-6 text-danger hover:border-danger"
            >
              <ShieldAlert className="h-4 w-4 mr-1" />
              <span>Reject</span>
            </Button>
          </div>
        </div>
      )}

      {/* STATE 2: APPROVED (Ready for PayPal) */}
      {order.status === "APPROVED" && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-ink tracking-tight">
              Order Approved by Business Owner
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Ready for PayPal Sandbox checkout at the fixed demo conversion rate.
            </p>
          </div>

          <Button
            onClick={() => navigate(`/orders/${order.id}/checkout`)}
            variant="accent"
            size="lg"
            className="w-full h-16 text-lg font-extrabold flex items-center justify-center gap-2"
          >
            <CreditCard className="h-6 w-6" />
            <span>Proceed to PayPal Checkout ({formatInr(order.totalPaise)})</span>
          </Button>
        </div>
      )}

      {/* STATE 3: PAYMENT PENDING */}
      {order.status === "PAYMENT_PENDING" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-[16px] bg-info/10 border border-info/30">
          <div>
            <div className="text-sm font-bold text-info">Payment In Progress</div>
            <div className="text-xs text-muted">Complete PayPal checkout to finalize procurement.</div>
          </div>
          <Button
            onClick={() => navigate(`/orders/${order.id}/checkout`)}
            variant="accent"
            size="md"
            className="w-full sm:w-auto font-bold cursor-pointer"
          >
            Resume Checkout
          </Button>
        </div>
      )}

      {/* STATE 4: PAID */}
      {order.status === "PAID" && (
        <div className="flex items-center justify-between p-4 rounded-[16px] bg-success/10 border border-success/30">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-success text-white flex items-center justify-center">
              <Check className="h-5 w-5 stroke-[3]" />
            </div>
            <div>
              <div className="text-sm font-bold text-success">Order Paid & Verified</div>
              <div className="text-xs text-muted">Dispatches scheduled with supplier groups.</div>
            </div>
          </div>
          <Button
            onClick={() => navigate(`/orders/${order.id}/payment-result`)}
            variant="secondary"
            size="sm"
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
            placeholder="e.g. Total exceeds current weekly cash flow, or alternative suppliers preferred."
            rows={3}
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
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
