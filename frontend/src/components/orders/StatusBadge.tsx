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
          {status === "PAID" ? "PAID & VERIFIED" : "COMPLETED"}
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge variant="accent" size={size} dot className={className}>
          APPROVED
        </Badge>
      );
    case "PENDING_APPROVAL":
      return (
        <Badge variant="warning" size={size} dot className={className}>
          PENDING APPROVAL
        </Badge>
      );
    case "PAYMENT_PENDING":
    case "PENDING":
      return (
        <Badge variant="info" size={size} dot className={className}>
          PAYMENT PENDING
        </Badge>
      );
    case "PAYMENT_FAILED":
    case "FAILED":
      return (
        <Badge variant="danger" size={size} dot className={className}>
          PAYMENT FAILED
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="danger" size={size} dot className={className}>
          REJECTED
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="outline" size={size} className={className}>
          CANCELLED
        </Badge>
      );
    case "REFUNDED":
      return (
        <Badge variant="warning" size={size} dot className={className}>
          REFUNDED
        </Badge>
      );
    case "DRAFT":
    case "CREATED":
    default:
      return (
        <Badge variant="default" size={size} className={className}>
          {status || "DRAFT"}
        </Badge>
      );
  }
}
