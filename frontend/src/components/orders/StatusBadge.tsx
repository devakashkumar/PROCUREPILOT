import { Badge } from "../ui/Badge.js";
import { OrderStatus, PaymentStatus } from "../../types/api.js";

export function StatusBadge({
  status,
  size,
  className,
}: {
  status: OrderStatus | PaymentStatus;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  switch (status) {
    case "PAID":
    case "COMPLETED":
      return (
        <Badge variant="success" size={size} dot className={className}>
          {status === "PAID" ? "Paid & Confirmed" : "Completed"}
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge variant="accent" size={size} dot className={className}>
          Approved
        </Badge>
      );
    case "PENDING_APPROVAL":
      return (
        <Badge variant="warning" size={size} dot className={className}>
          Pending Approval
        </Badge>
      );
    case "PAYMENT_PENDING":
    case "PENDING":
      return (
        <Badge variant="info" size={size} dot className={className}>
          Payment Pending
        </Badge>
      );
    case "PAYMENT_FAILED":
    case "FAILED":
      return (
        <Badge variant="danger" size={size} dot className={className}>
          Payment Failed
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="danger" size={size} dot className={className}>
          Rejected
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="outline" size={size} className={className}>
          Cancelled
        </Badge>
      );
    case "REFUNDED":
      return (
        <Badge variant="warning" size={size} dot className={className}>
          Refunded
        </Badge>
      );
    case "DRAFT":
    case "CREATED":
    default:
      return (
        <Badge variant="default" size={size} className={className}>
          {status || "Draft"}
        </Badge>
      );
  }
}
