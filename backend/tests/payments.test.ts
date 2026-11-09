import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { setupTestDb, teardownTestDb } from "./setup.js";
import { runSeed } from "../src/seed/seed.js";
import { ORDER_STATUS, PAYMENT_STATUS } from "../src/config/constants.js";
import { Express } from "express";

describe("Payments Module (PayPal Sandbox Integration)", () => {
  let app: Express;
  let token: string;
  let orderId: string;

  beforeAll(async () => {
    await setupTestDb();
    app = createApp();
    await runSeed(true);

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "demo@procurepilot.ai",
      password: "Demo@12345",
    });
    token = loginRes.body.data.accessToken;

    const analyzeRes = await request(app)
      .post("/api/procurement/analyze")
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "20 units of cooking oil under ₹5,000" });
    const reqId = analyzeRes.body.data.requestId;

    await request(app)
      .post("/api/procurement/search")
      .set("Authorization", `Bearer ${token}`)
      .send({ requestId: reqId });

    await request(app)
      .post("/api/procurement/optimize")
      .set("Authorization", `Bearer ${token}`)
      .send({ requestId: reqId, strategy: "balanced" });

    const orderRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ requestId: reqId, strategy: "balanced" });
    orderId = orderRes.body.data.order.id;
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it("REJECTS payment creation before order is approved", async () => {
    // Order is in PENDING_APPROVAL
    const res = await request(app)
      .post("/api/payments/create")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_STATE");
  });

  it("creates a PayPal order for an APPROVED purchase order", async () => {
    // Approve order first
    await request(app)
      .post(`/api/orders/${orderId}/approve`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .post("/api/payments/create")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.paypalOrderId).toBeDefined();
    expect(res.body.data.amountUsd).toBeGreaterThan(0);
    expect(res.body.data.fxRate).toBe(88);
    expect(res.body.data.fxNote).toContain("sandbox only");

    // Verify order moved to PAYMENT_PENDING
    const checkOrder = await request(app)
      .get(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(checkOrder.body.data.order.status).toBe(ORDER_STATUS.PAYMENT_PENDING);
  });

  it("is IDEMPOTENT: duplicate payment creation returns existing paypalOrderId", async () => {
    const res1 = await request(app)
      .post("/api/payments/create")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId });

    const res2 = await request(app)
      .post("/api/payments/create")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId });

    expect(res1.body.data.paypalOrderId).toBe(res2.body.data.paypalOrderId);
  });

  let activePaypalOrderId: string;

  it("captures PayPal payment, marks Payment COMPLETED and Order PAID", async () => {
    const payRes = await request(app)
      .post("/api/payments/create")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId });
    activePaypalOrderId = payRes.body.data.paypalOrderId;

    const captureRes = await request(app)
      .post("/api/payments/capture")
      .set("Authorization", `Bearer ${token}`)
      .send({ paypalOrderId: activePaypalOrderId });

    expect(captureRes.status).toBe(200);
    expect(captureRes.body.data.status).toBe(PAYMENT_STATUS.COMPLETED);
    expect(captureRes.body.data.orderStatus).toBe(ORDER_STATUS.PAID);

    // Verify order in database is now PAID
    const checkOrder = await request(app)
      .get(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(checkOrder.body.data.order.status).toBe(ORDER_STATUS.PAID);
  });

  it("is IDEMPOTENT: repeated capture on completed payment returns cleanly", async () => {
    const repeatCaptureRes = await request(app)
      .post("/api/payments/capture")
      .set("Authorization", `Bearer ${token}`)
      .send({ paypalOrderId: activePaypalOrderId });

    expect(repeatCaptureRes.status).toBe(200);
    expect(repeatCaptureRes.body.data.status).toBe(PAYMENT_STATUS.COMPLETED);
    expect(repeatCaptureRes.body.data.alreadyProcessed).toBe(true);
  });
});
