import mongoose, { Schema, Document, Types } from "mongoose";
import { sanitizeToJSON } from "./transform.js";

export interface IBulkTier {
  minQty: number;
  pricePaise: number;
}

export interface ISupplierOffer extends Document {
  productId: Types.ObjectId;
  supplierId: Types.ObjectId;
  pricePaise: number;
  stockQty: number;
  moq: number;
  deliveryDays: number;
  leadTimeNote?: string;
  bulkTiers: IBulkTier[];
  validUntil?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BulkTierSchema = new Schema<IBulkTier>(
  {
    minQty: { type: Number, required: true, min: 1 },
    pricePaise: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const SupplierOfferSchema = new Schema<ISupplierOffer>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true, index: true },
    pricePaise: { type: Number, required: true, min: 1 },
    stockQty: { type: Number, required: true, min: 0 },
    moq: { type: Number, required: true, default: 1, min: 1 },
    deliveryDays: { type: Number, required: true, min: 1 },
    leadTimeNote: { type: String, default: "" },
    bulkTiers: { type: [BulkTierSchema], default: [] },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: sanitizeToJSON,
    },
  }
);

SupplierOfferSchema.index({ productId: 1, supplierId: 1 }, { unique: true });

export const SupplierOffer = mongoose.model<ISupplierOffer>("SupplierOffer", SupplierOfferSchema);
