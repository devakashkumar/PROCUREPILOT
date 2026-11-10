# ProcurePilot AI — PayPal Orders API v2 Payment Flow

This document details the end-to-end payment and settlement flow for ProcurePilot AI, utilizing PayPal Orders API v2 with strict deterministic verification, multi-vendor fulfillment modeling, and cryptographic webhook verification.

---

## 1. End-to-End Payment Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Store Owner
    participant UI as ProcurePilot Frontend
    participant API as ProcurePilot Backend
    participant DB as MongoDB
    participant PayPal as PayPal Sandbox API
    participant Webhook as PayPal Webhooks Service

    Note over Owner,API: Phase 1: Review & Explicit Approval
    Owner->>UI: Reviews draft purchase order
    Owner->>UI: Clicks "Approve Purchase Order"
    UI->>API: POST /api/orders/:id/approve
    API->>DB: Transitions status to APPROVED with timestamp
    API-->>UI: { success: true, order: { status: "APPROVED" } }

    Note over Owner,PayPal: Phase 2: PayPal Order Creation
    Owner->>UI: Clicks "Proceed to PayPal Checkout"
    UI->>API: POST /api/payments/create { orderId }
    API->>DB: Validates order is APPROVED (State Machine check)
    API->>DB: Recomputes authoritative INR total from database
    API->>API: Converts INR paise to USD cents (Fixed ₹88/USD rate)
    API->>PayPal: POST /v1/oauth2/token (Checks in-memory cache)
    PayPal-->>API: { access_token, expires_in }
    API->>PayPal: POST /v2/checkout/orders (Itemized supplier breakdown)
    PayPal-->>API: { id: "PAYPAL_ORDER_ID", status: "CREATED" }
    API->>DB: Creates Payment record (status: CREATED)
    API->>DB: Transitions order to PAYMENT_PENDING
    API-->>UI: { paypalOrderId, amountUsd, fxRate }

    Note over Owner,PayPal: Phase 3: PayPal Sandbox Authorization
    UI->>PayPal: Renders <PayPalButtons />
    Owner->>PayPal: Logs in to Sandbox buyer account & approves
    PayPal-->>UI: Returns onApprove with orderID

    Note over UI,PayPal: Phase 4: Authoritative Backend Capture
    UI->>API: POST /api/payments/capture { paypalOrderId }
    API->>PayPal: POST /v2/checkout/orders/:id/capture
    PayPal-->>API: { status: "COMPLETED", purchase_units: [...] }
    API->>API: STRICT VERIFICATION: Captured USD == Stored USD cents
    API->>DB: Updates Payment to COMPLETED (sets capturedAt)
    API->>DB: Transitions order to PAID
    API-->>UI: { success: true, status: "COMPLETED", paymentId }
    UI->>Owner: Displays verified payment receipt with dual indicators

    Note over Webhook,API: Phase 5: Cryptographic Webhook Confirmation
    Webhook->>API: POST /api/webhooks/paypal (Event: PAYMENT.CAPTURE.COMPLETED)
    API->>PayPal: POST /v1/notifications/verify-webhook-signature
    PayPal-->>API: { verification_status: "SUCCESS" }
    API->>DB: Checks idempotency (WebhookEvent unique index)
    API->>DB: Records event & sets payment.verifiedByWebhookAt
    API-->>Webhook: 200 OK
```

---

## 2. Currency Conversion & Exact Cent Matching

### Known Limitations Addressed
- **PayPal does not support INR** as a payment currency.
- All internal transactions, catalogue prices, and financial accounting are stored in **integer paise (INR)**.
- For PayPal Sandbox checkout, amounts are converted to USD using a configurable demo conversion rate:
  ```env
  DEMO_INR_PER_USD=88
  ```

### Breakdown Cent Matching Invariant
In PayPal Orders API v2, `amount.breakdown.item_total` **must exactly equal** `amount.value`. If rounding errors produce an off-by-one discrepancy (e.g., sum of supplier items is `$142.04` but order total is `$142.05`), PayPal rejects the request with `422 UNPROCESSABLE_ENTITY`.

ProcurePilot resolves this deterministically:
1. Each supplier fulfillment group is converted to USD cents:
   $$\text{groupCents} = \text{round}\left(\frac{\text{groupSubtotalPaise} + \text{groupShippingPaise}}{88}\right)$$
2. The total USD cents sent to PayPal is set to the exact sum of these group cents:
   $$\text{amountUsdCents} = \sum \text{groupCents}$$
3. Stored payment records capture the exact rate, converted USD cents, and original INR paise.

---

## 3. Mandatory Security & Fraud Controls

| Control | Mechanism | Failure Action |
| :--- | :--- | :--- |
| **Tamper Protection** | Backend never accepts totals from frontend; recalculates from DB | `400 VALIDATION_ERROR` |
| **State Machine Guard** | Order must be `APPROVED` before `/payments/create` can execute | `400 INVALID_STATE` |
| **Capture Verification** | Backend validates captured USD matches stored order value within \$0.01 | `400 PAYMENT_ERROR` |
| **Idempotent Payment** | Active `CREATED` payment for an order returns existing PayPal order ID | Returns cached record |
| **Webhook Signature** | Checked via `verify-webhook-signature` against PayPal API | `400 WEBHOOK_VERIFICATION_FAILED` |
| **Webhook Dedup** | Stored in `WebhookEvent` collection with unique index on `eventId` | Ignores duplicates (200 OK) |

---

## 4. Local Webhook Testing Guide

### Option A: Using ngrok
To receive real PayPal Sandbox webhooks on your local development machine:

1. Start your local ProcurePilot backend:
   ```bash
   cd backend
   npm run dev
   ```
2. Start an ngrok tunnel to port 5000:
   ```bash
   ngrok http 5000
   ```
3. Copy the HTTPS forwarding URL (e.g., `https://abc1234.ngrok-free.app`).
4. In your [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox):
   - Under your Sandbox App, click **Add Webhook**.
   - Set the URL to: `https://abc1234.ngrok-free.app/api/webhooks/paypal`.
   - Subscribe to events: `PAYMENT.CAPTURE.COMPLETED`, `CHECKOUT.ORDER.APPROVED`.
   - Copy the generated **Webhook ID** and place it in `backend/.env`:
     ```env
     PAYPAL_WEBHOOK_ID=your_webhook_id_here
     ```

### Option B: Automated Integration Test
ProcurePilot includes automated mock tests that verify cryptographic webhook signature validation and deduplication without requiring an external ngrok tunnel:
```bash
cd backend
npm run test tests/webhooks.test.ts
```
All signature checks and duplicate event rejection pass with 100% deterministic assertion.
