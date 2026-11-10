import { describe, it, expect } from "vitest";
import {
  canTransitionOrder,
  assertOrderTransition,
} from "../src/modules/orders/orders.stateMachine.js";
import { ORDER_STATUS } from "../src/config/constants.js";
import { ApiError } from "../src/utils/ApiError.js";

describe("Purchase Order State Machine (orders.stateMachine.ts)", () => {
  it("allows all valid state transitions", () => {
    // DRAFT -> PENDING_APPROVAL
    expect(canTransitionOrder(ORDER_STATUS.DRAFT, ORDER_STATUS.PENDING_APPROVAL)).toBe(true);

    // PENDING_APPROVAL -> APPROVED or REJECTED
    expect(canTransitionOrder(ORDER_STATUS.PENDING_APPROVAL, ORDER_STATUS.APPROVED)).toBe(true);
    expect(canTransitionOrder(ORDER_STATUS.PENDING_APPROVAL, ORDER_STATUS.REJECTED)).toBe(true);

    // APPROVED -> PAYMENT_PENDING or CANCELLED
    expect(canTransitionOrder(ORDER_STATUS.APPROVED, ORDER_STATUS.PAYMENT_PENDING)).toBe(true);
    expect(canTransitionOrder(ORDER_STATUS.APPROVED, ORDER_STATUS.CANCELLED)).toBe(true);

    // PAYMENT_PENDING -> PAID, PAYMENT_FAILED, APPROVED (user cancelled checkout modal)
    expect(canTransitionOrder(ORDER_STATUS.PAYMENT_PENDING, ORDER_STATUS.PAID)).toBe(true);
    expect(canTransitionOrder(ORDER_STATUS.PAYMENT_PENDING, ORDER_STATUS.PAYMENT_FAILED)).toBe(true);
    expect(canTransitionOrder(ORDER_STATUS.PAYMENT_PENDING, ORDER_STATUS.APPROVED)).toBe(true);

    // PAYMENT_FAILED -> PAYMENT_PENDING (retry) or CANCELLED
    expect(canTransitionOrder(ORDER_STATUS.PAYMENT_FAILED, ORDER_STATUS.PAYMENT_PENDING)).toBe(true);
    expect(canTransitionOrder(ORDER_STATUS.PAYMENT_FAILED, ORDER_STATUS.CANCELLED)).toBe(true);
  });

  it("blocks and disallows all illegal transitions", () => {
    // Cannot jump from DRAFT directly to PAID or APPROVED
    expect(canTransitionOrder(ORDER_STATUS.DRAFT, ORDER_STATUS.PAID)).toBe(false);
    expect(canTransitionOrder(ORDER_STATUS.DRAFT, ORDER_STATUS.APPROVED)).toBe(false);

    // Cannot jump from PENDING_APPROVAL directly to PAID without approval and payment
    expect(canTransitionOrder(ORDER_STATUS.PENDING_APPROVAL, ORDER_STATUS.PAID)).toBe(false);
    expect(canTransitionOrder(ORDER_STATUS.PENDING_APPROVAL, ORDER_STATUS.PAYMENT_PENDING)).toBe(false);

    // Terminal states cannot transition to anything
    expect(canTransitionOrder(ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED)).toBe(false);
    expect(canTransitionOrder(ORDER_STATUS.PAID, ORDER_STATUS.PENDING_APPROVAL)).toBe(false);
    expect(canTransitionOrder(ORDER_STATUS.REJECTED, ORDER_STATUS.APPROVED)).toBe(false);
    expect(canTransitionOrder(ORDER_STATUS.CANCELLED, ORDER_STATUS.PAID)).toBe(false);
  });

  it("assertOrderTransition throws ApiError with INVALID_STATE on illegal transition", () => {
    expect(() =>
      assertOrderTransition(ORDER_STATUS.DRAFT, ORDER_STATUS.PAID)
    ).toThrow(ApiError);
  });
});
