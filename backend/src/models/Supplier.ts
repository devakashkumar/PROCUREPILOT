import mongoose, { Schema, Document } from "mongoose";
import { sanitizeToJSON } from "./transform.js";

export interface ISupplierContact {
  email: string;
  phone: string;
}

export interface ISupplier extends Document {
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
  contact: ISupplierContact;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    reliabilityScore: { type: Number, required: true, min: 0, max: 100, index: true },
    onTimeDeliveryRate: { type: Number, required: true, min: 0, max: 1 },
    avgDeliveryDays: { type: Number, required: true, min: 1 },
    shippingFeePaise: { type: Number, required: true, default: 0 },
    freeShippingAbovePaise: { type: Number, required: true, default: 0 },
    minOrderValuePaise: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, min: 0, max: 5, default: 4.5 },
    verified: { type: Boolean, default: true },
    tags: [{ type: String, trim: true }],
    contact: {
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: sanitizeToJSON,
    },
  }
);

export const Supplier = mongoose.model<ISupplier>("Supplier", SupplierSchema);
