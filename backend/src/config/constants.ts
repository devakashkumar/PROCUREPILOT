export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INVALID_STATE: "INVALID_STATE",
  BUDGET_EXCEEDED: "BUDGET_EXCEEDED",
  AI_UNAVAILABLE: "AI_UNAVAILABLE",
  PAYMENT_ERROR: "PAYMENT_ERROR",
  WEBHOOK_VERIFICATION_FAILED: "WEBHOOK_VERIFICATION_FAILED",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const ORDER_STATUS = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PAID: "PAID",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
  CREATED: "CREATED",
  APPROVED: "APPROVED",
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PROCUREMENT_STRATEGIES = {
  CHEAPEST: "cheapest",
  RELIABLE: "reliable",
  BALANCED: "balanced",
  FASTEST: "fastest",
} as const;

export type ProcurementStrategy =
  (typeof PROCUREMENT_STRATEGIES)[keyof typeof PROCUREMENT_STRATEGIES];

export const STRATEGY_WEIGHTS: Record<
  ProcurementStrategy,
  {
    price: number;
    reliability: number;
    delivery: number;
    stockConfidence: number;
  }
> = {
  cheapest: { price: 0.9, reliability: 0.04, delivery: 0.04, stockConfidence: 0.02 },
  reliable: { price: 0.15, reliability: 0.65, delivery: 0.1, stockConfidence: 0.1 },
  balanced: { price: 0.4, reliability: 0.35, delivery: 0.15, stockConfidence: 0.1 },
  fastest: { price: 0.15, reliability: 0.2, delivery: 0.6, stockConfidence: 0.05 },
};

export const DEFAULT_INR_PER_USD = 88;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
