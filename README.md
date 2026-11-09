# ProcurePilot AI — Autonomous Purchasing Agent for Small Businesses

> **An autonomous procurement agent for kirana stores, small supermarkets, cafes, and small offices.**  
> Translates natural-language restock requests into mathematically optimized purchase orders fulfilled by regional wholesale distributors and settled securely via PayPal Sandbox.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg)](https://vitejs.dev/)
[![PayPal](https://img.shields.io/badge/PayPal-Orders_v2_Sandbox-003087.svg)](https://developer.paypal.com/)
[![Tests](https://img.shields.io/badge/Tests-43%2F43_Passing-brightgreen.svg)]()

---

## 1. Product Overview & Core Flow

Small retail store owners spend hours juggling scattered paper notes, WhatsApp distributor chats, minimum order quantities (MOQs), and fluctuating wholesale price tiers.

ProcurePilot automates the entire sourcing lifecycle while maintaining strict non-negotiable financial guardrails:
1. **Natural Language Understanding**: An owner types or speaks a prompt (e.g. *"I need 20 units of cooking oil, 30 packets of rice, and 15 units of detergent under ₹15,000. Prioritize reliable suppliers."*).
2. **AI Extraction**: Gemini 2.5 Flash parses the prompt into validated structured JSON (quantities, units, categories, budget ceilings).
3. **Catalogue & Offer Matching**: Searches our regional wholesale catalogue across 38 fast-moving consumer goods and 7 verified Indian distributors.
4. **Deterministic Knapsack Optimization**: Pure TypeScript knapsack dynamic programming solves the mathematically optimal supplier basket balancing price, lead time, and vendor reliability.
5. **AI Plan Explanation**: Gemini writes a plain-language summary explaining the selected combination and trade-offs (AI explains; code computes).
6. **Mandatory Owner Approval**: Strict order state machine requires explicit owner sign-off before payment creation is unlocked.
7. **PayPal Sandbox Settlement**: The backend creates a PayPal Sandbox order (Orders API v2) with fixed demo conversion (₹88/USD), executes server capture, verifies amounts, and confirms cryptographic webhook signatures.

---

## 2. Non-Negotiable Safety Principles

- **Zero AI Financial Authority**: AI never computes money, chooses winners arbitrarily, or marks orders paid. All math is pure deterministic code.
- **Integer Paise Precision**: All database figures are stored in integer `paise` (INR) and integer `cents` (USD). Floating point math is banned from financial calculation.
- **Never Trust Frontend Totals**: The backend recomputes all item lines, wholesale tiers, freight, and totals from the database at order creation, payment creation, and capture.
- **Honest Multi-Vendor Fulfillment**: A single PayPal transaction cannot split money across independent third-party bank accounts. The owner pays ProcurePilot's merchant sandbox account; the purchase order creates distinct fulfillment sub-orders for each wholesale supplier.

---

## 3. Repository Layout

```
procurepilot-ai/
  backend/             Node.js + Express + TypeScript API
    src/
      config/          Zod-validated env, db, logger, constants
      models/          Mongoose schemas (User, Business, Product, Supplier, Order, Payment, WebhookEvent)
      modules/         auth, products, suppliers, procurement, orders, payments, analytics
      services/        Gemini client, fallback parser, optimizer DP, PayPal Orders v2, currency
      tests/           10 Vitest suites (43 passing tests)
  frontend/            React 18 + Vite + Tailwind CSS v4 web app
    src/
      api/             Typed API clients with TanStack Query
      components/      procurement, orders, payments, charts, motion, layout, ui
      pages/           Landing, Login, Register, Dashboard, Procure, Cart, Orders, Checkout, PaymentResult, Products, Suppliers, Analytics
  mobile/              README.md placeholder (Flutter teammate target)
  docs/
    architecture.md    Mermaid diagrams, system design, data models
    api-documentation.md REST endpoints with curl examples
    payment-flow.md    PayPal Orders v2 sequence diagram & webhook guide
    openapi.yaml       OpenAPI 3.0 specification for Flutter mobile client
    postman/           procurepilot.postman_collection.json
  README.md
```

---

## 4. 5-Minute Quickstart

### Prerequisites
- Node.js 20+
- npm 10+
- (Optional) MongoDB running locally. If not present, the backend automatically boots an in-memory `MongoMemoryServer` with zero setup required.

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run seed:reset
npm run dev
```
Backend starts on **`http://localhost:5000`** with pre-seeded demo Kirana business (`demo@procurepilot.ai` / `Demo@12345`).

### 2. Frontend Setup
In a new terminal window:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend starts on **`http://localhost:5173`** (proxies `/api` to the backend).

---

## 5. Live Demo Walkthrough Script

Follow these steps for a complete end-to-end evaluation:

1. **Open Web App**: Visit `http://localhost:5173`.
2. **One-Click Demo Login**: Click **Log in** $\to$ Click **"Use 1-Click Demo Account"** (signs in as Ramesh Patel, *Patel Supermarket*, Mumbai).
3. **Launch Procurement Agent**:
   - Go to **Procure** tab (`/procure`).
   - Use the prefilled prompt:  
     *"I need to restock 20 units of cooking oil, 30 packets of rice and 15 units of detergent. Keep the total under ₹15,000. Prioritize reliable suppliers."*
   - Click **Run Autonomous Sourcing**.
4. **Watch Agent Timeline**:
   - Step 1: Gemini parses items, units, quantities, and budget.
   - Step 2: Catalogue searches matching products and live wholesale supplier offers.
   - Step 3: Knapsack DP optimizes combinations across *Bharat Wholesalers*, *National FMCG*, and *Apex Logistics*.
   - Step 4: Gemini generates plain-English business justification.
5. **Switch Optimization Priorities**:
   - Toggle between **Balanced**, **Cheapest**, **Reliable**, and **Fastest** to observe instant re-optimization.
6. **Create & Approve Purchase Order**:
   - Click **Create Purchase Order** $\to$ redirects to `/orders/PO-2026-XXXXXX`.
   - Check the confirmation box and click **Approve Purchase Order**.
7. **Complete PayPal Checkout**:
   - Click **Proceed to PayPal Checkout** $\to$ redirects to `/orders/:id/checkout`.
   - View currency conversion notice (*"Demo conversion: ₹X ≈ $Y at ₹88/USD"*).
   - Click **Instant Sandbox Checkout (1-Click Capture)** or log in with PayPal Sandbox.
8. **View Verified Payment Record**:
   - Redirects to `/orders/:id/payment-result` showing dual status badges:
     - ✓ **Verified by Server**
     - ✓ **Confirmed by PayPal Webhook**
9. **Inspect Spend Analytics**:
   - Go to **Analytics** (`/analytics`) to see monthly spend charts, budget utilization, and supplier distribution.

---

## 6. Running Tests & Quality Verification

### Run Backend Unit & Integration Tests (43 tests)
```bash
cd backend
npm run test
```
Verifies money math, auth tokens, multi-tenant isolation, fallback parser, catalogue matching, knapsack optimizer, state machine transitions, orders, PayPal capture verification, and webhook signatures.

### Run Frontend Typecheck & Build
```bash
cd frontend
npm run typecheck
npm run build
```

---

## 7. Mobile App Integration (Flutter)

The mobile client is built by a teammate in Flutter targeting the exact same backend API:
- Full OpenAPI 3.0 specification: [`docs/openapi.yaml`](file:///home/sky/.gemini/antigravity/scratch/procurepilot-ai/docs/openapi.yaml)
- Postman Collection: [`docs/postman/procurepilot.postman_collection.json`](file:///home/sky/.gemini/antigravity/scratch/procurepilot-ai/docs/postman/procurepilot.postman_collection.json)
- Placeholder: `mobile/README.md`

---

## 8. License

MIT © 2026 ProcurePilot AI. Built for the Hackathon.
