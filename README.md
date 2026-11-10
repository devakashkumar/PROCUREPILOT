# ProcurePilot AI — Mobile Application

**ProcurePilot AI** is a premium, AI-powered wholesale procurement mobile application built for global retail store owners and small-to-medium businesses worldwide. It connects store owners to global wholesale suppliers, optimizes purchasing strategies, streamlines purchase order approvals, and processes payments via PayPal Sandbox.

---

## 🌟 Key Features

1. **AI Procurement Assistant**: Natural language & voice-driven purchasing requests (*English, Spanish, French, German*) with itemized procurement breakdowns.
2. **Product Discovery & Wholesale Catalog**: Search, filter by category (*Grocery, Essentials, Oils, Personal Care*), and inspect unit packaging details.
3. **Supplier Comparison**: Side-by-side distributor quotes comparing prices, shipping times, minimum order quantities, and distributor reliability ratings.
4. **AI Purchasing Optimization**: Strategy recommendation engine (*Lowest Price, Fastest Delivery, Verified Suppliers*) with budget progress bars.
5. **Smart Procurement Cart**: Supplier grouping, quantity adjustments, budget utilization alerts, and re-optimization triggers.
6. **Purchase Order Generation**: Generates official `PO-xxxxx` purchase orders, delivery notes, and required owner review acknowledgments.
7. **Human-in-the-Loop Order Approval**: Mandatory 4-item owner checklist and backend approval/rejection workflow (`POST /api/orders/:id/approve`).
8. **PayPal Sandbox Checkout**: Multi-currency Sandbox checkout conversion display, external URL checkout launch, and real-time backend payment status verification (`POST /api/payments/capture`).
9. **Order History & Tracking**: Order status filtering (*Pending, Approved, Paid, Rejected*), search bar, and visual lifecycle timeline (*Created -> Review -> Approved -> Payment*).
10. **Business Insights Analytics**: Procurement spending trends (`fl_chart`), order status distribution pie chart (`fl_chart`), and distributor volume rankings.
11. **Notification Center**: Unread count badges, category filters, and deep navigation to orders & payment records.
12. **Store Profile & Settings**: Business info card with Tax ID verification, edit profile form, instant Theme Mode switcher (*Light, Dark, System*), and secure session logout.

---

## 🛠️ Technology Stack & Architecture

* **Framework**: Flutter 3.38.9 / Dart 3.10.8 (Null-Safety enabled)
* **State Management**: Riverpod (`flutter_riverpod` 2.6.1)
* **HTTP & Networking**: Dio (`dio` 5.7.0) with thread-safe refresh lock (`TokenManager`) and `AuthInterceptor`
* **Routing**: GoRouter (`go_router` 14.8.1) with `StatefulShellRoute` tab navigation
* **Data Visualization**: FL Chart (`fl_chart` 0.70.2)
* **Secure Storage**: Flutter Secure Storage (`flutter_secure_storage` 9.2.4) using Android Keystore & iOS Keychain
* **Speech Recognition**: Speech To Text (`speech_to_text` 7.4.0) for voice input
* **Icons & Fonts**: Lucide Icons (`lucide_icons` 0.257.0) & Google Fonts (`google_fonts` - Plus Jakarta Sans)
* **Browser Launching**: URL Launcher (`url_launcher` 6.3.2) for PayPal Sandbox checkout

---

## 🚀 Environment & Backend Configuration

The application uses a configurable API base URL via compile-time `--dart-define`.

### 1. Default API Base URL
Default: `https://api.procurepilot.ai/v1`

### 2. Connecting to a Local Backend Server
To connect the app to a backend running on your host computer:

* **Android Emulator** (maps `localhost` to `10.0.2.2`):
  ```bash
  flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/v1
  ```
* **iOS Simulator / Web** (maps to `127.0.0.1`):
  ```bash
  flutter run --dart-define=API_BASE_URL=http://127.0.0.1:3000/v1
  ```
* **Physical Android/iOS Device** (use host computer's local Wi-Fi IP address):
  ```bash
  flutter run --dart-define=API_BASE_URL=http://192.168.1.10:3000/v1
  ```

---

## 📦 Installation & Setup Instructions

### Prerequisites
* Flutter SDK (3.38.9 or higher)
* Android SDK (API Level 21+ / Android 5.0+)
* Xcode 15+ (for iOS builds)

### Step 1: Install Dependencies
```bash
flutter pub get
```

### Step 2: Run Code Analysis & Tests
```bash
flutter analyze
flutter test
```

### Step 3: Run on Attached Device or Emulator
```bash
# Instant App Exploration (No live server required)
flutter run

# On the Login Screen, tap "✨ Explore Demo Account" to enter immediately offline.
```

---

## 🏗️ Generating Release APK

To compile a production Android release APK:

```bash
flutter build apk --release --dart-define=API_BASE_URL=https://api.procurepilot.ai/v1
```

The compiled release APK artifact will be located at:
`build/app/outputs/flutter-apk/app-release.apk` (55.2 MB)

---

## 📱 Hardware & Platform Permissions

* **Android** (`android/app/src/main/AndroidManifest.xml`):
  - `INTERNET`: Network requests & backend API synchronization.
  - `RECORD_AUDIO`: Speech-to-text voice procurement input.
  - `BLUETOOTH` & `BLUETOOTH_CONNECT`: Local device connectivity.
* **iOS** (`ios/Runner/Info.plist`):
  - `NSMicrophoneUsageDescription`: Voice input microphone access.
  - `NSSpeechRecognitionUsageDescription`: Speech recognition for voice commands.

---

## ⏱️ 3–5 Minute Hackathon Live Demonstration Sequence

### Step 1: Instant Access & Dashboard Overview (30s)
* **Screen**: Login Screen / Dashboard Screen
* **Action**: Open app. On the Login screen, tap **`✨ Explore Demo Account`**.
* **Result**: Logins instantly as *Sharma Kirana Store* (`Sharma Owner`) and opens the Dashboard.
* **Backend Contract Demonstrated**: Authenticated session state, secure token storage, real-time unread notification badge (`🔔 (2)`), and spend overview cards.

### Step 2: AI Voice Procurement Request (45s)
* **Screen**: AI Procurement Chat (`/procurement`)
* **Action**: Tap **`Start Smart Procurement`** or tap the microphone icon. Tap **`Speak Requirements`** or select the suggestion chip *"Need 10 bags Basmati Rice & 5 tins Sunflower Oil under ₹10,000"*.
* **Result**: Displays speech wave animation during voice input and renders structured AI procurement response breakdown.
* **Backend Contract Demonstrated**: `POST /api/procurement/analyze`.

### Step 3: Supplier Discovery & AI Optimization (45s)
* **Screen**: Supplier Comparison & Optimization Results (`/approval/req_1`)
* **Action**: Tap **`Compare Suppliers`** to view side-by-side distributor quotes. Tap **`Run Optimization`** and select the **Lowest Price Strategy**.
* **Result**: Displays budget utilization progress bar, supplier fulfillment groups, and accepts the strategy to populate the cart.
* **Backend Contract Demonstrated**: `GET /api/suppliers` and `POST /api/procurement/optimize`.

### Step 4: Purchase Order Creation & Owner Approval (60s)
* **Screen**: Cart -> Purchase Order -> Approval Screen (`/approval/po_89420`)
* **Action**: Tap **`Proceed to Checkout`**, enter delivery notes, check the required review acknowledgment box, and tap **`Create Purchase Order`**. On the Approval screen, complete the 4 mandatory owner checkboxes and tap **`Approve Purchase Order`**.
* **Result**: Purchase order status updates from `DRAFT` to `APPROVED` and unlocks the PayPal checkout button.
* **Backend Contract Demonstrated**: `POST /api/orders` and `POST /api/orders/:id/approve`.

### Step 5: PayPal Sandbox Payment & Order Tracking (60s)
* **Screen**: Payment Screen -> Payment Status -> Order History (`/orders`)
* **Action**: Review INR-to-USD Sandbox conversion (`₹6,400.00` = `$77.11 USD`), tap **`Pay with PayPal Sandbox`**, complete sandbox checkout, and return to view the verified **Payment Confirmed** status card. Tap **`Done & Back to Dashboard`** and open **My Orders**.
* **Result**: Displays verified payment status (`COMPLETED`), transaction ID, and updated lifecycle timeline (*Created -> Review -> Approved -> Payment*).
* **Backend Contract Demonstrated**: `POST /api/payments/create`, `POST /api/payments/capture`, and `GET /api/orders`.

---

## 🔒 Security Architecture

1. **Zero Client Secrets**: No API keys or PayPal private credentials exist in the Flutter app.
2. **Hardware Keyring Token Storage**: Access and refresh tokens are stored in Android Keystore / iOS Keychain via `ISecureStorageService`.
3. **Client-Side Financial Authority Prohibition**: Payment completion and order approvals are strictly validated by backend response payload signatures (`POST /api/orders/:id/approve` and `POST /api/payments/capture`).
