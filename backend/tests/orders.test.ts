import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { setupTestDb, teardownTestDb } from "./setup.js";
import { runSeed } from "../src/seed/seed.js";
import { ORDER_STATUS } from "../src/config/constants.js";
import { Express } from "express";

describe("Purchase Orders Module", () => {
  let app: Express;
  let token: string;
  let requestId: string;

  beforeAll(async () => {
    await setupTestDb();
    app = createApp();
    await runSeed(true);

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "demo@procurepilot.ai",
      password: "Demo@12345",
    });
    token = loginRes.body.data.accessToken;

    // Run procurement pipeline to have an optimized request
    const analyzeRes = await request(app)
      .post("/api/procurement/analyze")
      .set("Authorization", `Bearer ${token}`)
      .send({
        message: "20 units of cooking oil and 30 packets of rice under ₹15,000",
      });
    requestId = analyzeRes.body.data.requestId;

    await request(app)
      .post("/api/procurement/search")
      .set("Authorization", `Bearer ${token}`)
      .send({ requestId });

    await request(app)
      .post("/api/procurement/optimize")
      .set("Authorization", `Bearer ${token}`)
      .send({ requestId, strategy: "balanced" });
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it("creates an order from optimization plan with atomic order number", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        requestId,
        strategy: "balanced",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const order = res.body.data.order;

    expect(order.orderNumber).toMatch(/^PO-202[0-9]-[0-9]{6}$/);
    expect(order.status).toBe(ORDER_STATUS.PENDING_APPROVAL);
    expect(order.lines.length).toBe(2);
    expect(order.totalPaise).toBeGreaterThan(0);
    expect(order.totalPaise).toBe(order.subtotalPaise + order.shippingPaise);
  });

  it("PROVES client-supplied totals/lines tampering is impossible", async () => {
    // Attempt to pass malicious totals or fake line prices in the body
    const tamperedRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        requestId,
        strategy: "balanced",
        // Malicious client payloads attempting to overwrite price:
        totalPaise: 100, // ₹1
        subtotalPaise: 100,
        lines: [{ unitPricePaise: 1, quantity: 100 }],
      });

    expect(tamperedRes.status).toBe(201);
    const order = tamperedRes.body.data.order;

    // The backend ignored the client total of 100 and recomputed the real total!
    expect(order.totalPaise).not.toBe(100);
    expect(order.totalPaise).toBeGreaterThan(1000000); // More than ₹10,000
  });

  it("approves order and transitions status to APPROVED", async () => {
    const createRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ requestId, strategy: "balanced" });
    const orderId = createRes.body.data.order.id;

    const approveRes = await request(app)
      .post(`/api/orders/${orderId}/approve`)
      .set("Authorization", `Bearer ${token}`);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.order.status).toBe(ORDER_STATUS.APPROVED);
    expect(approveRes.body.data.order.approval.approvedAt).toBeDefined();
  });

  it("rejects order with mandatory reason and transitions status to REJECTED", async () => {
    const createRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ requestId, strategy: "balanced" });
    const orderId = createRes.body.data.order.id;

    const rejectRes = await request(app)
      .post(`/api/orders/${orderId}/reject`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Monthly budget exceeded for groceries" });

    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.data.order.status).toBe(ORDER_STATUS.REJECTED);
    expect(rejectRes.body.data.order.approval.reason).toBe("Monthly budget exceeded for groceries");
  });

  it("cancels an approved order and transitions status to CANCELLED", async () => {
    const createRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ requestId, strategy: "balanced" });
    const orderId = createRes.body.data.order.id;

    await request(app)
      .post(`/api/orders/${orderId}/approve`)
      .set("Authorization", `Bearer ${token}`);

    const cancelRes = await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.order.status).toBe(ORDER_STATUS.CANCELLED);
  });
});
