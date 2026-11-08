import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { setupTestDb, teardownTestDb } from "./setup.js";
import { runSeed } from "../src/seed/seed.js";
import { Express } from "express";

describe("Procurement Pipeline Integration (analyze -> search -> optimize)", () => {
  let app: Express;
  let token: string;

  beforeAll(async () => {
    await setupTestDb();
    app = createApp();
    // Seed database with realistic catalog
    await runSeed(true);

    // Login with demo account
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "demo@procurepilot.ai",
      password: "Demo@12345",
    });
    token = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it("processes the sample ₹15,000 prompt end-to-end and produces a feasible plan", async () => {
    const promptText =
      "I need to restock 20 units of cooking oil, 30 packets of rice and 15 units of detergent. Keep the total under ₹15,000. Prioritize reliable suppliers.";

    // 1. Analyze
    const analyzeRes = await request(app)
      .post("/api/procurement/analyze")
      .set("Authorization", `Bearer ${token}`)
      .send({ message: promptText });

    expect(analyzeRes.status).toBe(201);
    expect(analyzeRes.body.success).toBe(true);
    const requestId = analyzeRes.body.data.requestId;
    expect(requestId).toBeDefined();
    expect(analyzeRes.body.data.requirements.items.length).toBe(3);
    expect(analyzeRes.body.data.requirements.budget.amountPaise).toBe(1500000);
    expect(analyzeRes.body.data.requirements.priority).toBe("reliable");

    // 2. Search
    const searchRes = await request(app)
      .post("/api/procurement/search")
      .set("Authorization", `Bearer ${token}`)
      .send({ requestId });

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.success).toBe(true);
    expect(searchRes.body.data.matches.length).toBe(3);
    expect(searchRes.body.data.unmatched.length).toBe(0);

    // Verify candidate offers exist for all items
    for (const match of searchRes.body.data.matches) {
      expect(match.candidates.length).toBeGreaterThan(0);
      expect(match.candidates[0].offers.length).toBeGreaterThan(0);
    }

    // 3. Optimize (under requested reliable strategy)
    const optimizeRes = await request(app)
      .post("/api/procurement/optimize")
      .set("Authorization", `Bearer ${token}`)
      .send({
        requestId,
        strategy: "reliable",
      });

    expect(optimizeRes.status).toBe(200);
    expect(optimizeRes.body.success).toBe(true);

    const plan = optimizeRes.body.data.plan;
    expect(plan.lines.length).toBe(3);
    expect(plan.withinBudget).toBe(true);
    expect(plan.totalPaise).toBeLessThanOrEqual(1500000);
    expect(plan.remainingBudgetPaise).toBeGreaterThanOrEqual(0);
    expect(plan.averageReliability).toBeGreaterThanOrEqual(75);

    // Verify alternatives exist
    expect(optimizeRes.body.data.alternatives.length).toBeGreaterThanOrEqual(1);

    // Verify plain English explanation was generated (3 to 6 sentences, no markdown formatting)
    const explanation = optimizeRes.body.data.explanation;
    expect(typeof explanation).toBe("string");
    expect(explanation.length).toBeGreaterThan(50);
    expect(explanation).not.toContain("**");
  });
});
