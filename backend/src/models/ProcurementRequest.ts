import mongoose, { Schema, Document, Types } from "mongoose";
import { sanitizeToJSON } from "./transform.js";

export interface IProcurementItemRequirement {
  name: string;
  normalizedName: string;
  quantity: number;
  unit: string | null;
  category: string | null;
  notes: string | null;
}

export interface IProcurementRequirements {
  items: IProcurementItemRequirement[];
  budget: {
    amountPaise: number | null;
    currency: "INR";
  };
  priority: "cheapest" | "reliable" | "balanced" | "fastest";
  constraints: {
    maxDeliveryDays: number | null;
    minReliability: number | null;
    preferredSuppliers: string[];
    excludedSuppliers: string[];
  };
  clarifications: string[];
}

export interface IProcurementRequest extends Document {
  businessId: Types.ObjectId;
  userId: Types.ObjectId;
  rawText: string;
  status: "ANALYZED" | "SEARCHED" | "OPTIMIZED" | "ORDERED" | "FAILED";
  aiRequirements?: IProcurementRequirements;
  aiModel?: string;
  aiUsedFallback: boolean;
  searchResults?: unknown;
  optimizationResult?: unknown;
  explanation?: string;
  budgetPaise?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProcurementRequestSchema = new Schema<IProcurementRequest>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rawText: { type: String, required: true },
    status: {
      type: String,
      enum: ["ANALYZED", "SEARCHED", "OPTIMIZED", "ORDERED", "FAILED"],
      default: "ANALYZED",
      index: true,
    },
    aiRequirements: { type: Schema.Types.Mixed },
    aiModel: { type: String },
    aiUsedFallback: { type: Boolean, default: false },
    searchResults: { type: Schema.Types.Mixed },
    optimizationResult: { type: Schema.Types.Mixed },
    explanation: { type: String },
    budgetPaise: { type: Number },
  },
  {
    timestamps: true,
    toJSON: {
      transform: sanitizeToJSON,
    },
  }
);

export const ProcurementRequest = mongoose.model<IProcurementRequest>(
  "ProcurementRequest",
  ProcurementRequestSchema
);
