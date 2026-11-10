import { OrderStatus, ORDER_STATUS } from "../../config/constants.js";
import { ApiError } from "../../utils/ApiError.js";
import { ERROR_CODES } from "../../config/constants.js";

/**
 * Valid transitions map for PurchaseOrder lifecycle:
 * - DRAFT -> PENDING_APPROVAL
 * - PENDING_APPROVAL -> APPROVED, REJECTED
 * - APPROVED -> PAYMENT_PENDING, CANCELLED
 * - PAYMENT_PENDING -> PAID, PAYMENT_FAILED, APPROVED (if owner cancels checkout)
 * - PAYMENT_FAILED -> PAYMENT_PENDING (retry), CANCELLED
 * - PAID, REJECTED, CANCELLED are terminal states.
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [ORDER_STATUS.DRAFT]: [ORDER_STATUS.PENDING_APPROVAL],
  [ORDER_STATUS.PENDING_APPROVAL]: [ORDER_STATUS.APPROVED, ORDER_STATUS.REJECTED],
  [ORDER_STATUS.APPROVED]: [ORDER_STATUS.PAYMENT_PENDING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAYMENT_PENDING]: [
    ORDER_STATUS.PAID,
    ORDER_STATUS.PAYMENT_FAILED,
    ORDER_STATUS.APPROVED, // Customer cancelled PayPal checkout dialog
  ],
  [ORDER_STATUS.PAYMENT_FAILED]: [
    ORDER_STATUS.PAYMENT_PENDING, // Payment retry
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.PAID]: [], // Terminal
  [ORDER_STATUS.REJECTED]: [], // Terminal
  [ORDER_STATUS.CANCELLED]: [], // Terminal
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  return Boolean(allowed && allowed.includes(to));
}

export function assertOrderTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransitionOrder(from, to)) {
    throw new ApiError(
      400,
      ERROR_CODES.INVALID_STATE,
      `Illegal order status transition from ${from} to ${to}`
    );
  }
}
