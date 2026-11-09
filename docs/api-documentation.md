# ProcurePilot AI — REST API Documentation

This document describes the complete REST API contract for ProcurePilot AI. Both the React web application and the Flutter mobile app communicate with these endpoints.

Base URL: `http://localhost:5000/api`

---

## 1. Response Envelope

Every endpoint in the system strictly adheres to the standard JSON envelope.

### Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "9c1b3f68-7c8a-4d2b-91ae-6627b425b018",
    "timestamp": "2026-11-09T09:30:00.000Z"
  }
}
```

### Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      { "path": ["email"], "message": "Invalid email address" }
    ]
  },
  "meta": {
    "requestId": "9c1b3f68-7c8a-4d2b-91ae-6627b425b018",
    "timestamp": "2026-11-09T09:30:00.000Z"
  }
}
```

### Standard Error Codes
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `INVALID_STATE` (400)
- `BUDGET_EXCEEDED` (422)
- `AI_UNAVAILABLE` (503)
- `PAYMENT_ERROR` (400/500)
- `WEBHOOK_VERIFICATION_FAILED` (400)
- `RATE_LIMITED` (429)
- `INTERNAL_ERROR` (500)

---

## 2. Authentication Module

### 2.1 Register Store & Owner
`POST /api/auth/register`

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ramesh Patel",
    "email": "ramesh@patelstore.com",
    "password": "Password@123",
    "businessName": "Patel Supermarket",
    "businessType": "supermarket",
    "city": "Mumbai",
    "monthlyBudgetPaise": 15000000
  }'
```

### 2.2 Login
`POST /api/auth/login`

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@procurepilot.ai",
    "password": "Demo@12345"
  }'
```

### 2.3 Get Current User & Business Profile
`GET /api/auth/me`

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 3. Catalogue Module

### 3.1 List Products
`GET /api/products?q=oil&category=Cooking%20Oil&page=1&limit=20`

```bash
curl -X GET "http://localhost:5000/api/products?q=oil" \
  -H "Authorization: Bearer <TOKEN>"
```

### 3.2 List Verified Suppliers
`GET /api/suppliers?city=Mumbai&minReliability=70`

```bash
curl -X GET "http://localhost:5000/api/suppliers" \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 4. Procurement AI Pipeline

### 4.1 Step 1: Analyze Natural Language Restock Request
`POST /api/procurement/analyze`

Extracts structured items, quantities, and budget constraints with Gemini 2.5 Flash (or deterministic fallback).

```bash
curl -X POST http://localhost:5000/api/procurement/analyze \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need to restock 20 units of cooking oil, 30 packets of rice and 15 units of detergent. Keep total under ₹15,000. Prioritize reliable suppliers."
  }'
```

### 4.2 Step 2: Search Product Catalogue & Live Offers
`POST /api/procurement/search`

Matches extracted items against catalogue using MongoDB text search, synonym aliases, and token overlap.

```bash
curl -X POST http://localhost:5000/api/procurement/search \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "<REQUEST_ID>"
  }'
```

### 4.3 Step 3: Run Knapsack DP Optimizer
`POST /api/procurement/optimize`

Solves multiple-choice 0/1 knapsack across strategies (`balanced`, `cheapest`, `reliable`, `fastest`), applies bulk discounts and consolidation bonuses, and generates a plain English explanation.

```bash
curl -X POST http://localhost:5000/api/procurement/optimize \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "<REQUEST_ID>",
    "strategy": "balanced"
  }'
```

---

## 5. Orders & Approvals

### 5.1 Create Purchase Order Draft
`POST /api/orders`

Creates a Purchase Order in `DRAFT` status with atomic counter number (`PO-2026-XXXXXX`).

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "<REQUEST_ID>",
    "strategy": "balanced"
  }'
```

### 5.2 Explicit Owner Approval
`POST /api/orders/:id/approve`

```bash
curl -X POST http://localhost:5000/api/orders/<ORDER_ID>/approve \
  -H "Authorization: Bearer <TOKEN>"
```

### 5.3 Owner Rejection
`POST /api/orders/:id/reject`

```bash
curl -X POST http://localhost:5000/api/orders/<ORDER_ID>/reject \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Exceeded monthly allocated category budget"
  }'
```

---

## 6. Payments & PayPal Orders v2

### 6.1 Create PayPal Order
`POST /api/payments/create`

Strictly requires order to be `APPROVED`. Recomputes authoritative INR totals, converts to USD cents at ₹88/USD, and calls PayPal Orders API v2.

```bash
curl -X POST http://localhost:5000/api/payments/create \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "<ORDER_ID>"
  }'
```

### 6.2 Capture PayPal Order
`POST /api/payments/capture`

Executes server-side capture and verifies captured USD amount against stored order amount before marking order `PAID`.

```bash
curl -X POST http://localhost:5000/api/payments/capture \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "paypalOrderId": "<PAYPAL_ORDER_ID>"
  }'
```

### 6.3 Get Payment Status
`GET /api/payments/:id`

Returns dual verification indicators (`capturedAt` and `verifiedByWebhookAt`).

```bash
curl -X GET http://localhost:5000/api/payments/<PAYMENT_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 7. Webhooks & Analytics

### 7.1 PayPal Webhook Receiver
`POST /api/webhooks/paypal`

No Authorization header required. Authenticates via PayPal webhook signature headers.

### 7.2 Analytics Summary
`GET /api/analytics/summary`

```bash
curl -X GET http://localhost:5000/api/analytics/summary \
  -H "Authorization: Bearer <TOKEN>"
```

### 7.3 Health Check
`GET /api/health`

```bash
curl -X GET http://localhost:5000/api/health
```
