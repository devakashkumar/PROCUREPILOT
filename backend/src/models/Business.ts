import mongoose, { Schema, Document, Types } from "mongoose";
import { sanitizeToJSON } from "./transform.js";

export interface IBusinessPreferences {
  priority: "cheapest" | "reliable" | "balanced" | "fastest";
  minReliability: number;
}

export interface IBusiness extends Document {
  ownerId: Types.ObjectId;
  name: string;
  type: string;
  city: string;
  gstin?: string;
  monthlyBudgetPaise: number;
  currency: "INR";
  preferences: IBusinessPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    gstin: { type: String, trim: true },
    monthlyBudgetPaise: { type: Number, required: true, default: 20000000 },
    currency: { type: String, default: "INR", enum: ["INR"] },
    preferences: {
      priority: {
        type: String,
        enum: ["cheapest", "reliable", "balanced", "fastest"],
        default: "balanced",
      },
      minReliability: { type: Number, default: 70, min: 0, max: 100 },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: sanitizeToJSON,
    },
  }
);

export const Business = mongoose.model<IBusiness>("Business", BusinessSchema);
