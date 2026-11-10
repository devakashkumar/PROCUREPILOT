import { CandidateOffer } from "../matching/product.matcher.js";
import { ProcurementStrategy } from "../../config/constants.js";

export interface OptimizerItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  candidateOffers: CandidateOffer[];
}

export interface OptimizerConstraints {
  minReliability?: number | null;
  maxDeliveryDays?: number | null;
  preferredSuppliers?: string[];
  excludedSuppliers?: string[];
}

export interface OptimizerInput {
  items: OptimizerItemInput[];
  budgetPaise: number;
  strategy: ProcurementStrategy;
  constraints?: OptimizerConstraints;
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

export interface OptimizerOutput {
  strategy: ProcurementStrategy;
  plan: OptimizedPlan;
  alternatives: AlternativePlan[];
  warnings: string[];
}
