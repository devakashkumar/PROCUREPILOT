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

## Table of Contents
1. [Product Overview & Architecture](#1-product-overview--architecture)
2. [Non-Negotiable Safety & Financial Guardrails](#2-non-negotiable-safety--financial-guardrails)
3. [Repository Structure](#3-repository-structure)
4. [How to Run (Local, LAN, & Internet)](#4-how-to-run-local-lan--internet)
   - [Prerequisites](#prerequisites)
   - [Option A: 1-Click Quickstart (Embedded DB, Zero Config)](#option-a-1-click-quickstart-embedded-db-zero-config)
   - [Option B: Production Configuration](#option-b-production-configuration)
   - [Running on Mobile / Local Network (LAN Access)](#running-on-mobile--local-network-lan-access)
   - [Running over the Public Internet (Worldwide Access)](#running-over-the-public-internet-worldwide-access)
   - [Default Demo Credentials](#default-demo-credentials)
5. [Live Demo Walkthrough Script](#5-live-demo-walkthrough-script)
6. [Testing & Quality Verification](#6-testing--quality-verification)
7. [Environment Variables Reference](#7-environment-variables-reference)
8. [Teammates Roadmap: What's Done & What to Do](#8-teammates-roadmap-whats-done--what-to-do)
   - [📱 Flutter Mobile Developer Guide](#-flutter-mobile-developer-guide)
   - [🤖 AI / ML & Vernacular Prompt Engineer](#-ai--ml--vernacular-prompt-engineer)
   - [💳 Payments & Domestic Settlement Engineer](#-payments--domestic-settlement-engineer)
   - [🚚 Supplier Dispatch & Logistics Lead](#-supplier-dispatch--logistics-lead)
   - [☁️ DevOps & Cloud Deployment Lead](#-devops--cloud-deployment-lead)
9. [Documentation & API Reference](#9-documentation--api-reference)
10. [License](#10-license)

---

## 1. Product Overview & Architecture

Small retail store owners (such as kirana store proprietors in India) spend hours juggling handwritten notes, WhatsApp distributor chats, minimum order quantities (MOQs), and fluctuating wholesale price tiers.

ProcurePilot AI automates the entire sourcing lifecycle while maintaining strict financial guardrails:

```
[Owner Natural Language Request]
         │  (Text / Audio: "Restock 20 cooking oil, 30 rice, 15 detergent under ₹15,000")
         ▼
[Gemini 2.5 Flash / Fallback NLP] ──► Validated Structured JSON (quantities, units, budget)
         │
         ▼
[MongoDB Wholesale Catalogue] ────► 38 fast-moving FMCG items & 7 regional distributors
         │
         ▼
[Knapsack DP Optimizer Engine] ───► Mathematically optimal basket (Balanced / Cheapest / Reliable / Fastest)
         │
         ▼
[Gemini Explanation Generator] ───► Plain-language business justification of trade-offs
         │
         ▼
[Mandatory Owner Review & Approval] ──► State Machine enforces approval before checkout
         │
         ▼
[PayPal Orders API v2 Sandbox] ──► Demo FX conversion (₹88/USD), server capture, webhook signature verification
         │
         ▼
[Fulfilment Sub-Orders & Spend Analytics]
```

---

## 2. Non-Negotiable Safety & Financial Guardrails

1. **Zero AI Financial Authority**: AI models *never* compute authoritative pricing, choose winning suppliers directly, or mark orders paid. AI only (a) extracts structured JSON requirements from prose and (b) generates human-readable explanations. All monetary arithmetic, supplier matching, and state transitions are executed by deterministic TypeScript backend code.
2. **Integer Paise & Cent Precision**: All money in the database and API payloads is stored as integer `paise` (INR) and integer `cents` (USD). Floating-point math is strictly prohibited for money calculations (`utils/money.ts`).
3. **Never Trust Frontend Totals**: The backend recalculates item line prices, distributor volume tiers, delivery charges, and final totals from database records at order creation, payment creation, and payment capture.
4. **Enforced State Machine**: PayPal sandbox payment orders cannot be created until the store owner explicitly checks the confirmation and signs off on the purchase order (`DRAFT` $\to$ `PENDING_APPROVAL` $\to$ `APPROVED` $\to$ `PAYMENT_PENDING` $\to$ `PAID`).
5. **Honest Multi-Vendor Fulfillment**: A single checkout cannot split payments across independent supplier bank accounts. The merchant account receives payment once, and the system partitions the order into supplier fulfillment sub-lines.
6. **Currency Disclosure**: PayPal Sandbox does not support native INR. A fixed demo rate (`DEMO_INR_PER_USD=88`) transparently converts INR paise to USD cents, explicitly disclosed in the checkout UI.

---

## 3. Repository Structure

```
procurepilot-ai/
├── backend/                   # Node.js + Express + TypeScript REST API
│   ├── src/
│   │   ├── config/            # Zod-validated env, MongoDB/In-Memory connection, logger
│   │   ├── models/            # Mongoose models (User, Business, Product, Supplier, Offer, Order, Payment)
│   │   ├── modules/
│   │   │   ├── auth/          # Authentication & JWT rotation (register, login, refresh, me)
│   │   │   ├── products/      # Catalog browsing, filtering, search
│   │   │   ├── suppliers/     # Supplier directories, reliability scores, and offers
│   │   │   ├── procurement/   # Analyze (Gemini), Search, Optimize (Knapsack DP)
│   │   │   ├── orders/        # Purchase Order state machine, lifecycle, approval
│   │   │   ├── payments/      # PayPal Orders v2 create, capture, webhook listener
│   │   │   └── analytics/     # Spend analytics, category distribution, budget utilization
│   │   ├── services/
│   │   │   ├── ai/            # Gemini SDK client, prompt templates, regex fallback parser
│   │   │   ├── matching/      # Product alias & token similarity search
│   │   │   ├── optimizer/     # Multiple-choice 0/1 knapsack dynamic programming
│   │   │   ├── paypal/        # PayPal Orders v2 REST client & cryptographic webhook verifier
│   │   │   └── currency/      # Fixed demo INR-to-USD conversion service
│   │   ├── middleware/        # JWT auth, Zod validation, error handling, rate limiting
│   │   ├── utils/             # Integer money helpers, ApiError, async handler
│   │   ├── seed/              # Seed data: 38 products, 7 distributors, 210 offers, demo account
│   │   ├── app.ts             # Express application factory
│   │   └── server.ts          # Server entrypoint with auto-seeding on fresh database
│   ├── tests/                 # 10 test suites covering all units and integration paths
│   └── package.json
│
├── frontend/                  # React 18 + Vite + Tailwind CSS v4 Single Page Application
│   ├── src/
│   │   ├── api/               # Axios API clients with TanStack Query integration
│   │   ├── components/
│   │   │   ├── procurement/   # CommandBar, AgentTimeline, BudgetMeter, SupplierMatrix
│   │   │   ├── orders/        # StatusBadge, StatusTimeline, ApprovalPanel, SupplierGroupCard
│   │   │   ├── payments/      # FxNotice, PayPalCheckout (with 1-Click capture), PaymentStatusCard
│   │   │   ├── charts/        # Recharts SpendChart & SupplierShareChart
│   │   │   ├── layout/        # AppShell, Sidebar, TopBar, MobileNav, ThemeToggle
│   │   │   └── ui/            # Button, Input, Badge, Dialog, Skeleton, Textarea
│   │   ├── pages/             # Landing, Login, Register, Dashboard, Procure, Orders, Checkout, etc.
│   │   ├── store/             # Zustand auth store with localStorage persistence
│   │   ├── router.tsx         # BrowserRouter with ProtectedRoute guards
│   │   └── main.tsx           # Entrypoint with smooth Lenis scrolling
│   ├── vite.config.ts         # Vite config with 0.0.0.0 binding and /api proxy
│   └── package.json
│
├── mobile/                    # Reserved for Flutter mobile companion app (see mobile/README.md)
│   └── README.md
│
├── docs/                      # Architectural & API Specifications
│   ├── architecture.md        # Mermaid diagrams, ER schema, knapsack algorithm details
│   ├── api-documentation.md   # Complete REST endpoint specifications with curl commands
│   ├── payment-flow.md        # Sequence diagrams for PayPal sandbox & webhook verification
│   ├── openapi.yaml           # OpenAPI 3.0 specification for Flutter mobile client
│   └── postman/               # Ready-to-import Postman collection with token capture
│
├── render.yaml                # Render blueprint for cloud backend deployment
├── vercel.json                # Vercel SPA rewrites configuration
└── README.md                  # This file
```

---

## 4. How to Run (Local, LAN, & Internet)

### Prerequisites
- **Node.js**: v20.x or higher (`node -v`)
- **npm**: v10.x or higher (`npm -v`)
- **Git**: Installed and configured

---

### Option A: 1-Click Quickstart (Embedded DB, Zero Config)

ProcurePilot is designed to run immediately with **zero external dependencies**. If no MongoDB URI is supplied, the backend boots an in-memory `MongoMemoryServer` and automatically seeds 38 FMCG products, 7 distributors, 210 offers, and the demo account.

#### Step 1: Start Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
*Output: Backend starts on `http://localhost:5000` and displays:*
```
[INFO] Upserting catalog products... Saved 38 products.
[INFO] Generated and indexed 210 supplier offers.
[INFO] Demo account created: demo@procurepilot.ai / Demo@12345
[INFO] 🚀 ProcurePilot API server listening on port 5000
```

#### Step 2: Start Frontend
In a second terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
*Output: Frontend starts on `http://localhost:5173` with proxy to backend.*

---

### Option B: Production Configuration

To use real cloud services:
1. **MongoDB**: Set `MONGODB_URI=mongodb+srv://...` in `backend/.env`.
2. **Gemini AI**: Set `GEMINI_API_KEY=AIzaSy...` in `backend/.env` for real Gemini 2.5 Flash analysis. (If left blank, the built-in regex fallback parser handles queries seamlessly).
3. **PayPal Sandbox**: Set `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and `PAYPAL_WEBHOOK_ID` in `backend/.env`, and `VITE_PAYPAL_CLIENT_ID` in `frontend/.env`.

---

### Running on Mobile / Local Network (LAN Access)

The frontend Vite server is configured to bind to `host: "0.0.0.0"`. This allows any smartphone, tablet, or secondary laptop on the **same Wi-Fi network** to access the full application without setting up tunnels or modifying firewalls.

1. Find your machine's local IP address:
   - **Linux / macOS**: `ip -4 addr show` or `ifconfig` (look for `192.168.x.x` or `10.x.x.x`)
   - **Windows**: `ipconfig` (IPv4 Address under Wireless LAN adapter)
2. On your phone (connected to same Wi-Fi), open the browser and navigate to:
   ```
   http://<YOUR_LOCAL_IP>:5173
   ```
   *(e.g., `http://192.168.52.159:5173`)*
3. All requests to `/api/*` are automatically proxied through Vite to the backend on port 5000, eliminating CORS issues.

---

### Running over the Public Internet (Worldwide Access)

To let teammates or judges test the app from anywhere without being on your local Wi-Fi, expose the frontend port via a secure tunnel:

#### Method 1: Using ngrok
```bash
# Expose frontend port (which proxies backend API)
ngrok http 5173
```
Copy the generated `https://xxxx.ngrok-free.dev` URL and share it. Anyone can open it on their mobile phone or PC.

#### Method 2: Using Cloudflare Tunnels (No account needed)
```bash
npx --yes cloudflared tunnel --url http://localhost:5173
```
Cloudflare will provide an instant HTTPS URL (e.g., `https://random-words.trycloudflare.com`).

---

### Default Demo Credentials

The database is pre-seeded with a complete retail business profile:

| Field | Value |
|---|---|
| **Email** | `demo@procurepilot.ai` |
| **Password** | `Demo@12345` |
| **Store Name** | Patel Supermarket |
| **Owner** | Ramesh Patel |
| **City** | Mumbai, Maharashtra |
| **Monthly Budget** | ₹1,50,000 |
| **Default Optimization** | Balanced (40% Price, 35% Reliability, 25% Speed) |

*(A 1-Click "Use Demo Account" button is also present directly on the Login page).*

---

## 5. Live Demo Walkthrough Script

Follow these steps for a complete hackathon evaluation:

1. **Sign In**: Open `http://localhost:5173` $\to$ click **Log in** $\to$ click **Use 1-Click Demo Account**.
2. **Autonomous Sourcing**:
   - Go to **Procure** (`/procure`).
   - Use the sample prompt:  
     *"I need 20 units of cooking oil, 30 packets of rice, and 15 units of detergent. Keep the total under ₹15,000. Prioritize reliable suppliers."*
   - Click **Run Autonomous Sourcing**.
3. **Inspect the Agent Lifecycle**:
   - **Step 1 (Parse)**: See extracted quantities, units, and ₹15,000 ceiling.
   - **Step 2 (Catalogue Search)**: Matched against Fortune Sunlite Oil, India Gate Basmati, and Surf Excel Detergent across multiple distributors.
   - **Step 3 (Knapsack Optimization)**: Pure mathematical solver distributes line items to minimize cost while respecting MOQs.
   - **Step 4 (Plain Language Plan)**: Gemini explains vendor selections and delivery timelines.
4. **Interactive Trade-off Switcher**:
   - Click the strategy buttons: **Balanced**, **Cheapest**, **Reliable**, **Fastest**.
   - Notice the basket re-optimizes dynamically, showing updated totals and delivery estimates.
5. **Add to Cart & Order Creation**:
   - Click **Add to Cart & Review** $\to$ review line items and distributor fulfillment groups.
   - Click **Create Purchase Order** $\to$ redirected to `/orders/PO-2026-XXXXXX` (Status: `PENDING_APPROVAL`).
6. **Mandatory Owner Approval**:
   - Notice the PayPal checkout is locked until approved.
   - Check *"I verify the items, quantities, and supplier terms"* $\to$ click **Approve Purchase Order** (Status: `APPROVED`).
7. **PayPal Sandbox Checkout**:
   - Click **Proceed to PayPal Checkout** (`/orders/:id/checkout`).
   - Note the transparent currency conversion: *"Demo conversion: ₹X ≈ $Y at ₹88/USD (sandbox only)"*.
   - Click **Instant Sandbox Checkout (1-Click Capture)** (or sign in with PayPal Sandbox buyer account).
8. **Dual-Verification Payment Screen**:
   - Order transitions to `PAID`.
   - Dual security indicators confirm:
     - ✓ **Verified by Backend Server (PayPal Orders v2 API)**
     - ✓ **Confirmed by PayPal Webhook**
9. **Spend Analytics**:
   - Navigate to **Analytics** (`/analytics`) to view updated monthly spend graphs, category allocation, and distributor volume shares.

---

## 6. Testing & Quality Verification

### Run Backend Unit & Integration Tests (43 tests)
```bash
cd backend
npm run test
```
The test suite validates:
- Integer money arithmetic (paise $\leftrightarrow$ rupees, cents $\leftrightarrow$ dollars, safe rounding)
- Token-based JWT authentication and refresh token rotation
- Multi-tenant business isolation
- Regex fallback parser for Hinglish natural-language prompts
- Product catalog token & synonym matching
- Multiple-choice knapsack DP optimization algorithm under diverse budget constraints
- Purchase order finite state machine transitions
- PayPal Orders v2 capture verification and webhook cryptographic signature validation

### Run Typecheck & Build
```bash
# Verify backend TypeScript strict mode
cd backend
npm run typecheck

# Verify frontend TypeScript strict mode & production bundle
cd frontend
npm run typecheck
npm run build
```

---

## 7. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | HTTP port for the Express backend |
| `NODE_ENV` | No | `development` | `development`, `test`, or `production` |
| `MONGODB_URI` | No | *(In-Memory)* | MongoDB connection URI. If omitted, uses embedded `MongoMemoryServer` |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated list of allowed origins |
| `JWT_ACCESS_SECRET` | Yes | — | Secret string for signing access tokens ($\ge 32$ chars) |
| `JWT_REFRESH_SECRET`| Yes | — | Secret string for signing refresh tokens ($\ge 32$ chars) |
| `JWT_ACCESS_EXPIRES_IN` | No | `1h` | Expiration time for access tokens |
| `JWT_REFRESH_EXPIRES_IN`| No | `7d` | Expiration time for refresh tokens |
| `GEMINI_API_KEY` | No | `""` | Google Gemini API key. If empty, fallback parser operates |
| `GEMINI_MODEL` | No | `gemini-2.5-flash`| Gemini model name |
| `DEMO_INR_PER_USD` | No | `88` | Integer INR-to-USD conversion rate for PayPal Sandbox |
| `PAYPAL_BASE_URL` | No | Sandbox URL | `https://api-m.sandbox.paypal.com` |
| `PAYPAL_CLIENT_ID` | No | `""` | PayPal Sandbox Client ID |
| `PAYPAL_CLIENT_SECRET`| No | `""` | PayPal Sandbox Secret Key |
| `PAYPAL_WEBHOOK_ID`| No | `""` | PayPal Sandbox Webhook ID for signature verification |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | `""` | Base API URL. Leave empty to use Vite's `/api` proxy |
| `VITE_PAYPAL_CLIENT_ID`| No | `test` | Public PayPal Client ID for JS SDK buttons |

---

## 8. Teammates Roadmap: What's Done & What to Do

This section provides clear, actionable instructions for each team member to complete their respective components.

---

### 📱 Flutter Mobile Developer Guide
> **Directory**: `mobile/`  
> **Target**: Flutter iOS/Android Companion App for Kirana Owners on the Go

#### What is Already Completed for You
1. **Unified REST API**: All backend endpoints are live, strictly typed, and CORS-enabled with Bearer token authentication.
2. **OpenAPI 3.0 Specification**: Located at [`docs/openapi.yaml`](file:///home/sky/.gemini/antigravity/scratch/procurepilot-ai/docs/openapi.yaml). You can generate Dart client models using `openapi-generator-cli` or `build_runner`.
3. **Postman Collection**: Located at [`docs/postman/procurepilot.postman_collection.json`](file:///home/sky/.gemini/antigravity/scratch/procurepilot-ai/docs/postman/procurepilot.postman_collection.json) with pre-configured request samples and environment variables (`{{baseUrl}}`, `{{token}}`).
4. **Standard API Envelope**: Every endpoint returns:
   ```json
   {
     "success": true,
     "data": { ... },
     "meta": { "requestId": "uuid" }
   }
   ```
   Errors return:
   ```json
   {
     "success": false,
     "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] },
     "meta": { "requestId": "uuid" }
   }
   ```

#### What You Need to Build in `mobile/`
1. **Initialize Flutter Project**:
   ```bash
   cd mobile
   flutter create . --org ai.procurepilot --project-name procurepilot_mobile
   ```
2. **State Management & Network Layer**:
   - Use `dio` with an interceptor to attach `Authorization: Bearer <accessToken>` and handle 401 automatic token refresh via `/api/auth/refresh`.
   - Store access & refresh tokens securely using `flutter_secure_storage`.
3. **Core Mobile Screens**:
   - **Login / Register Screen**: Support email/password and a 1-tap "Demo Account" button hitting `POST /api/auth/login`.
   - **Voice & Text Procurement Input**: Add a microphone button using `speech_to_text` so kirana owners can speak in Hindi or English (e.g. *"20 tel, 30 chawal"*), sending text to `POST /api/procurement/analyze`.
   - **Sourcing Results & Strategy Chips**: Render the optimized supplier matrix with horizontal filter chips (`Balanced`, `Cheapest`, `Reliable`, `Fastest`) hitting `POST /api/procurement/optimize`.
   - **Order Approval Screen**: Display purchase order fulfillment groups with a mandatory approval checkbox before unlocking payment (`POST /api/orders/:id/approve`).
   - **PayPal Sandbox Checkout**: Use `webview_flutter` or launch the PayPal checkout URL returned by `POST /api/payments/create-paypal-order`.
   - **Order History & Push Alerts**: List past orders (`GET /api/orders`) with color-coded status badges (`DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `PAID`).

---

### 🤖 AI / ML & Vernacular Prompt Engineer

#### What is Already Completed
1. Gemini 2.5 Flash SDK integration in `backend/src/services/ai/gemini.client.ts`.
2. Zod-enforced JSON schema parsing for procurement line items, quantities, and budgets in `requirement.extractor.ts`.
3. Plain-language business justification generator in `explanation.generator.ts`.
4. Robust regex fallback parser in `fallback.parser.ts` supporting Hinglish phrasing, shorthand numbers (`15k`, `1.5L`, `₹15,000`), and Indian retail units (`packet`, `kg`, `litre`, `box`).

#### What You Need to Improve
1. **Add Production Gemini API Key**:
   - Add your key in `backend/.env` under `GEMINI_API_KEY`.
2. **Fine-Tune Vernacular Prompts** (`backend/src/services/ai/prompts.ts`):
   - Enhance the prompt to handle colloquial Indian grocery terminology:
     - `Atta`, `Chawal`, `Dal`, `Tel`, `Sarson`, `Besan`, `Ghee`, `Sabun`.
   - Support mixed Hinglish requests like: *"Bhaiya 20 packet chawal aur 10 ltr sunflower oil chahiye, budget 10 hazar hai"*.
3. **Multimodal Invoice / Handwritten Note Scanner**:
   - Use Gemini Multimodal (`gemini-2.5-flash`) to allow users to snap photos of handwritten Kirana 'parchi' (chits) or paper invoices and extract structured line items.

---

### 💳 Payments & Domestic Settlement Engineer

#### What is Already Completed
1. Complete PayPal Orders v2 Sandbox integration (`paypal.client.ts`, `paypal.orders.ts`).
2. Server-side capture with cryptographic amount verification (cent-matching algorithm to avoid rounding mismatches).
3. PayPal Webhook signature verification (`paypal.webhooks.ts`).
4. Strict state machine preventing payment before explicit owner sign-off.
5. Simulated 1-click sandbox capture for instant developer demonstrations.

#### What You Need to Improve
1. **Add PayPal Sandbox Credentials**:
   - Generate sandbox developer credentials at [developer.paypal.com](https://developer.paypal.com).
   - Populate `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and `PAYPAL_WEBHOOK_ID` in `backend/.env`.
2. **Test Live Webhooks with ngrok**:
   ```bash
   ngrok http 5000
   ```
   Add the ngrok URL to your PayPal Sandbox Webhooks portal: `https://<ngrok-id>.ngrok-free.dev/api/payments/webhook`.
3. **Domestic Payment Rails (UPI / NetBanking)**:
   - For Indian kirana stores, integrate Razorpay or Cashfree Sandbox for direct UPI QR code checkout in native INR (`paise`).
   - Create a unified payment gateway adapter interface in `backend/src/services/payments/`.

---

### 🚚 Supplier Dispatch & Logistics Lead

#### What is Already Completed
1. 7 realistic wholesale distributor profiles across Mumbai, Delhi, Ahmedabad, and Pune.
2. Reliability scores (0–100), on-time delivery rates, MOQ thresholds, and tiered freight charges.
3. Multiple-choice knapsack optimization taking supplier reliability and speed into account.

#### What You Need to Improve
1. **Supplier WhatsApp / SMS Dispatch**:
   - When an order transitions to `PAID`, trigger an automated WhatsApp notification to the assigned suppliers with the purchase order line items and delivery address using Twilio or Gupshup API.
2. **Supplier Dispatch Portal**:
   - Add lightweight endpoints (`POST /api/orders/:id/fulfill`) allowing suppliers to confirm dispatch, upload tracking waybills, and update delivery ETAs.

---

### ☁️ DevOps & Cloud Deployment Lead

#### What is Already Completed
1. Production TypeScript builds for both backend and frontend.
2. Backend `render.yaml` blueprint ready for deployment on [Render](https://render.com).
3. Frontend `vercel.json` configured for Single Page Application client-side routing on [Vercel](https://vercel.com).
4. Auto-seeding database logic in `server.ts` that triggers when an empty database is connected.

#### What You Need to Do
1. **Deploy Backend on Render**:
   - Push the repository to GitHub.
   - Connect the repo to Render as a Web Service (Environment: Node).
   - Set build command: `cd backend && npm install && npm run build`.
   - Set start command: `cd backend && npm run start`.
   - Configure environment variables (`MONGODB_URI`, `JWT_ACCESS_SECRET`, etc.).
2. **Deploy Frontend on Vercel**:
   - Import the repo in Vercel, set root directory to `frontend`.
   - Framework preset: Vite.
   - Set `VITE_API_BASE_URL` to your live Render backend URL.
3. **Set Up MongoDB Atlas**:
   - Create a free M0 cluster on MongoDB Atlas and set `MONGODB_URI` in production.

---

## 9. Documentation & API Reference

Comprehensive architectural and API documentation is maintained in the [`docs/`](file:///home/sky/.gemini/antigravity/scratch/procurepilot-ai/docs) directory:

- 📐 [Architecture & System Design](file:///home/sky/.gemini/antigravity/scratch/procurepilot-ai/docs/architecture.md) — Mermaid architecture diagrams, ER schemas, and knapsack optimization formulation.
- 📡 [API Documentation](file:///home/sky/.gemini/antigravity/scratch/procurepilot-ai/docs/api-documentation.md) — Detailed request and response examples for all 18 REST endpoints.
- 💳 [Payment Flow & PayPal Guide](file:///home/sky/.gemini/antigravity/scratch/procurepilot-ai/docs/payment-flow.md) — End-to-end PayPal Orders v2 sequence diagram, cent-matching rules, and webhook guide.
- 📋 [OpenAPI 3.0 Specification](file:///home/sky/.gemini/antigravity/scratch/procurepilot-ai/docs/openapi.yaml) — Machine-readable spec for Flutter mobile client generation.
- 📬 [Postman Collection](file:///home/sky/.gemini/antigravity/scratch/procurepilot-ai/docs/postman/procurepilot.postman_collection.json) — Ready-to-use Postman test collection with automated token extraction.

---

## 10. License

MIT © 2026 ProcurePilot AI. Built for the Hackathon.
