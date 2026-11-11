import { WebhookEvent } from "../src/models/WebhookEvent.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { setupTestDb, teardownTestDb } from "./setup.js";
import { runSeed } from "../src/seed/seed.js";
import { PurchaseOrder } from "../src/models/PurchaseOrder.js";
import { Payment } from "../src/models/Payment.js";
import { ORDER_STATUS, PAYMENT_STATUS } from "../src/config/constants.js";
import mongoose from "mongoose";
import { Express } from "express";

describe("Webhooks Module (POST /api/payments/webhook)", () => {
  let app: Express;
  let orderId: string;
  let businessId: string;

  beforeAll(async () => {
    await setupTestDb();
    app = createApp();
    await runSeed(true);

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "demo@procurepilot.ai",
      password: "Demo@12345",
    });
    businessId = loginRes.body.data.business.id;

    // Create an order in PAYMENT_PENDING state
    const order = await PurchaseOrder.create({
      orderNumber: "PO-2026-WEBHOOK-TEST",
      businessId: new mongoose.Types.ObjectId(businessId),
      userId: new mongoose.Types.ObjectId(loginRes.body.data.user.id),
      status: ORDER_STATUS.PAYMENT_PENDING,
      lines: [],
      supplierGroups: [],
      subtotalPaise: 500000,
      shippingPaise: 0,
      totalPaise: 500000,
      budgetPaise: 600000,
      currency: "INR",
      approval: {},
      statusHistory: [],
    });
    orderId = order.id;

    // Create a payment record
    await Payment.create({
      orderId: order._id,
      businessId: order.businessId,
      provider: "paypal",
      paypalOrderId: "WH_TEST_ORDER_123",
      status: PAYMENT_STATUS.PENDING,
      amountInrPaise: 500000,
      amountUsdCents: 5681,
      fxRateInrPerUsd: 88,
      fxNote: "Demo rate",
      history: [],
    });
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it("REJECTS webhook when signature verification fails or webhook ID is missing", async () => {
    // When PAYPAL_WEBHOOK_ID is not configured or signature is invalid
    const fakeEvent = {
      id: "WH-EVT-UNVERIFIED-1",
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: { id: "CAP-123" },
    };

    const res = await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .set("paypal-transmission-id", "trans-1")
      .set("paypal-transmission-sig", "invalid-sig")
      .send(JSON.stringify(fakeEvent));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("WEBHOOK_VERIFICATION_FAILED");
  });

  it("safely handles DUPLICATE webhooks with 200 IGNORED_DUPLICATE", async () => {
    // Pre-insert an event with ID "WH-EVT-DUPLICATE-1" into WebhookEvent
    const { WebhookEvent } = await import("../src/models/WebhookEvent.js");
    await WebhookEvent.create({
      providerEventId: "WH-EVT-DUPLICATE-1",
      eventType: "PAYMENT.CAPTURE.COMPLETED",
      verified: true,
      processed: true,
      outcome: "APPLIED",
      receivedAt: new Date(),
    });

    const duplicatePayload = {
      id: "WH-EVT-DUPLICATE-1",
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: { id: "CAP-123" },
    };

    const res = await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .send(JSON.stringify(duplicatePayload));

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("IGNORED_DUPLICATE");
  });
  it("does not complete payment when webhook amount does not match", async () => {
  const { PayPalWebhookService } = await import(
    "../src/services/paypal/paypal.webhooks.js"
  );

  const originalVerify = PayPalWebhookService.verifySignature;
  PayPalWebhookService.verifySignature = async () => true;

  const eventId = `WH-EVT-WRONG-AMOUNT-${Date.now()}`;

  try {
    const res = await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({
        id: eventId,
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          id: `CAP-WRONG-${Date.now()}`,
          custom_id: orderId,
          status: "COMPLETED",
          amount: { currency_code: "USD", value: "10.00" },
        },
      }));

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("SUCCESS");

    const payment = await Payment.findOne({ orderId });
    const order = await PurchaseOrder.findById(orderId);
    const webhook = await WebhookEvent.findOne({ providerEventId: eventId });

    expect(payment?.status).toBe(PAYMENT_STATUS.PENDING);
    expect(order?.status).toBe(ORDER_STATUS.PAYMENT_PENDING);
    expect(webhook?.outcome).toBe("FAILED");
  } finally {
    PayPalWebhookService.verifySignature = originalVerify;
  }
});

it("does not complete payment when webhook currency is incorrect", async () => {
  const { PayPalWebhookService } = await import(
    "../src/services/paypal/paypal.webhooks.js"
  );

  const originalVerify = PayPalWebhookService.verifySignature;
  PayPalWebhookService.verifySignature = async () => true;

  const eventId = `WH-EVT-WRONG-CURRENCY-${Date.now()}`;

  try {
    await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({
        id: eventId,
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          id: `CAP-CURRENCY-${Date.now()}`,
          custom_id: orderId,
          status: "COMPLETED",
          amount: { currency_code: "INR", value: "5000.00" },
        },
      }));

    const payment = await Payment.findOne({ orderId });
    const order = await PurchaseOrder.findById(orderId);
    const webhook = await WebhookEvent.findOne({ providerEventId: eventId });

    expect(payment?.status).toBe(PAYMENT_STATUS.PENDING);
    expect(order?.status).toBe(ORDER_STATUS.PAYMENT_PENDING);
    expect(webhook?.outcome).toBe("FAILED");
  } finally {
    PayPalWebhookService.verifySignature = originalVerify;
  }
});
  it("updates payment to COMPLETED and order to PAID upon receiving verified PAYMENT.CAPTURE.COMPLETED", async () => {
    // Mock verifySignature temporarily for this test
    const { PayPalWebhookService } = await import("../src/services/paypal/paypal.webhooks.js");
    const originalVerify = PayPalWebhookService.verifySignature;
    PayPalWebhookService.verifySignature = async () => true;

    try {
      const completedEvent = {
        id: `WH-EVT-SUCCESS-${Date.now()}`,
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          id: "CAP-REAL-777",
          custom_id: orderId,
          status: "COMPLETED",
          amount: { currency_code: "USD", value: "56.81" },
        },
      };

      const res = await request(app)
        .post("/api/payments/webhook")
        .set("Content-Type", "application/json")
        .set("paypal-transmission-id", "trans-ok")
        .send(JSON.stringify(completedEvent));

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("SUCCESS");

      // Verify payment in database is COMPLETED
      const updatedPayment = await Payment.findOne({ orderId });
      expect(updatedPayment?.status).toBe(PAYMENT_STATUS.COMPLETED);
      expect(updatedPayment?.verifiedByWebhookAt).toBeDefined();

      // Verify purchase order in database is PAID
      const updatedOrder = await PurchaseOrder.findById(orderId);
      expect(updatedOrder?.status).toBe(ORDER_STATUS.PAID);
    } finally {
      PayPalWebhookService.verifySignature = originalVerify;
    }
  });
});
