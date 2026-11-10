import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { setupTestDb, teardownTestDb, clearTestDb } from "./setup.js";
import { Express } from "express";

describe("Auth Module Integration", () => {
  let app: Express;

  beforeAll(async () => {
    await setupTestDb();
    app = createApp();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  it("registers a new business and user owner", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Rohan Patel",
        email: "rohan@patelkirana.com",
        password: "Password@123",
        businessName: "Patel Kirana Store",
        businessType: "kirana",
        city: "Ahmedabad",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("rohan@patelkirana.com");
    expect(res.body.data.user.role).toBe("owner");
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.business.name).toBe("Patel Kirana Store");
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it("fails to register with duplicate email", async () => {
    const payload = {
      name: "Rohan Patel",
      email: "rohan@patelkirana.com",
      password: "Password@123",
      businessName: "Patel Kirana Store",
      businessType: "kirana",
      city: "Ahmedabad",
    };

    await request(app).post("/api/auth/register").send(payload);
    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("logs in with valid credentials and returns tokens", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Rohan Patel",
      email: "rohan@patelkirana.com",
      password: "Password@123",
      businessName: "Patel Kirana Store",
      businessType: "kirana",
      city: "Ahmedabad",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "rohan@patelkirana.com",
      password: "Password@123",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.name).toBe("Rohan Patel");
  });

  it("rejects login with incorrect password with generic message", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Rohan Patel",
      email: "rohan@patelkirana.com",
      password: "Password@123",
      businessName: "Patel Kirana Store",
      businessType: "kirana",
      city: "Ahmedabad",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "rohan@patelkirana.com",
      password: "WrongPassword999",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe("Invalid credentials");
  });

  it("retrieves current user and business via /api/auth/me", async () => {
    const regRes = await request(app).post("/api/auth/register").send({
      name: "Rohan Patel",
      email: "rohan@patelkirana.com",
      password: "Password@123",
      businessName: "Patel Kirana Store",
      businessType: "kirana",
      city: "Ahmedabad",
    });

    const token = regRes.body.data.accessToken;

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.name).toBe("Rohan Patel");
    expect(meRes.body.data.business.name).toBe("Patel Kirana Store");
  });
});
