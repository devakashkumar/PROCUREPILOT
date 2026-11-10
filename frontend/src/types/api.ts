export type Role = "owner" | "admin";
export type OrderStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "PAYMENT_FAILED"
  | "CANCELLED";

export type PaymentStatus =
  | "CREATED"
  | "APPROVED"
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type ProcurementStrategy = "cheapest" | "reliable" | "balanced" | "fastest";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  businessId: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  type: string;
  city: string;
  gstin?: string;
  monthlyBudgetPaise: number;
  currency: "INR";
  preferences: {
    priority: ProcurementStrategy;
    minReliability: number;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  unit: "unit" | "kg" | "packet" | "litre" | "box" | "piece";
  packSize: string;
  description: string;
  aliases: string[];
  imageUrl: string;
  tags: string[];
  isActive: boolean;
  minPricePaise?: number;
  maxPricePaise?: number;
  supplierCount?: number;
  hasStock?: boolean;
}

export interface SupplierOffer {
  id: string;
  productId: string;
  supplierId: Supplier | string;
  pricePaise: number;
  stockQty: number;
  moq: number;
  deliveryDays: number;
  leadTimeNote?: string;
  bulkTiers: Array<{ minQty: number; pricePaise: number }>;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  reliabilityScore: number;
  onTimeDeliveryRate: number;
  avgDeliveryDays: number;
  shippingFeePaise: number;
  freeShippingAbovePaise: number;
  minOrderValuePaise: number;
  rating: number;
  verified: boolean;
  tags: string[];
  contact: {
    email: string;
    phone: string;
  };
  activeCatalogCount?: number;
}

export interface CandidateOffer {
  offerId: string;
  supplierId: string;
  supplierName: string;
  supplierCity: string;
  reliabilityScore: number;
  rating: number;
  onTimeDeliveryRate: number;
  deliveryDays: number;
  basePricePaise: number;
  effectiveUnitPricePaise: number;
  lineTotalPaise: number;
  stockQty: number;
  moq: number;
  stockSufficient: boolean;
  moqSatisfied: boolean;
  appliedBulkTier: boolean;
  shippingFeePaise: number;
  freeShippingAbovePaise: number;
  minOrderValuePaise: number;
}

export interface MatchedCandidate {
  product: Product;
  matchScore: number;
  offers: CandidateOffer[];
}

export interface ItemMatchResult {
  requirement: {
    name: string;
    normalizedName: string;
    quantity: number;
    unit: string | null;
    category: string | null;
    notes: string | null;
  };
  candidates: MatchedCandidate[];
  selectedProduct: Product | null;
  ambiguous: boolean;
  unmatched: boolean;
}

export interface OptimizedLineItem {
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  offerId: string;
  quantity: number;
  unit: string;
  unitPricePaise: number;
  lineTotalPaise: number;
  deliveryDays: number;
  reliabilityScore: number;
  score: number;
}

export interface OptimizedSupplierGroup {
  supplierId: string;
  supplierName: string;
  subtotalPaise: number;
  shippingPaise: number;
  deliveryDays: number;
  lineCount: number;
}

export interface OptimizedPlan {
  lines: OptimizedLineItem[];
  supplierGroups: OptimizedSupplierGroup[];
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  budgetPaise: number;
  remainingBudgetPaise: number;
  withinBudget: boolean;
  shortfallPaise: number;
  averageReliability: number;
  maxDeliveryDays: number;
  estimatedSavingsPaise: number;
}

export interface AlternativePlan extends OptimizedPlan {
  strategy: ProcurementStrategy;
}

export interface ProcurementRequirements {
  items: Array<{
    name: string;
    normalizedName: string;
    quantity: number;
    unit: string | null;
    category: string | null;
    notes: string | null;
  }>;
  budget: {
    amountPaise: number | null;
    currency: "INR";
  };
  priority: ProcurementStrategy;
  constraints: {
    maxDeliveryDays: number | null;
    minReliability: number | null;
    preferredSuppliers: string[];
    excludedSuppliers: string[];
  };
  clarifications: string[];
}

export interface ProcurementRequest {
  id: string;
  rawText: string;
  status: "ANALYZED" | "SEARCHED" | "OPTIMIZED" | "ORDERED" | "FAILED";
  aiRequirements?: ProcurementRequirements;
  aiModel?: string;
  aiUsedFallback: boolean;
  searchResults?: ItemMatchResult[];
  optimizationResult?: {
    strategy: ProcurementStrategy;
    plan: OptimizedPlan;
    alternatives: AlternativePlan[];
    warnings: string[];
  };
  explanation?: string;
  budgetPaise?: number;
  createdAt: string;
}

export interface OrderLine {
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  offerId: string;
  quantity: number;
  unit: string;
  unitPricePaise: number;
  lineTotalPaise: number;
  deliveryDays?: number;
  reliabilityScore?: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  businessId: string;
  userId: string;
  procurementRequestId?: string;
  status: OrderStatus;
  lines: OrderLine[];
  supplierGroups: OptimizedSupplierGroup[];
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  budgetPaise: number;
  estimatedSavingsPaise: number;
  currency: "INR";
  approval: {
    approvedAt?: string;
    approvedBy?: string;
    rejectedAt?: string;
    rejectedBy?: string;
    reason?: string;
  };
  paymentId?: string;
  statusHistory: Array<{
    from: OrderStatus;
    to: OrderStatus;
    at: string;
    by?: string;
    note?: string;
  }>;
  notes?: string;
  aiExplanation?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  businessId: string;
  provider: "paypal";
  paypalOrderId?: string;
  paypalCaptureId?: string;
  status: PaymentStatus;
  amountInrPaise: number;
  amountUsdCents: number;
  fxRateInrPerUsd: number;
  fxNote: string;
  currency: "USD";
  payerEmail?: string;
  payerId?: string;
  idempotencyKey?: string;
  failureReason?: string;
  capturedAt?: string;
  verifiedByWebhookAt?: string;
  history: Array<{
    status: PaymentStatus;
    at: string;
    source: "api" | "webhook";
    note?: string;
  }>;
}

export interface AnalyticsSummary {
  totalSpendPaise: number;
  spendThisMonthPaise: number;
  monthlyBudgetPaise: number;
  budgetUtilisationPercent: number;
  ordersCount: Record<OrderStatus, number>;
  averageSavingsPaise: number;
  topSuppliers: Array<{ supplierName: string; totalSpendPaise: number; orderCount: number }>;
  monthlySpend: Array<{ month: string; spendPaise: number; orderCount: number }>;
  recentOrders: PurchaseOrder[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    requestId: string;
    [key: string]: unknown;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    requestId: string;
  };
}
