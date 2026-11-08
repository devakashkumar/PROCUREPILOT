import mongoose, { Schema, Document, Types } from "mongoose";
import { OrderStatus, ORDER_STATUS } from "../config/constants.js";
import { sanitizeToJSON } from "./transform.js";

export interface IOrderLine {
  productId: Types.ObjectId;
  productName: string;
  supplierId: Types.ObjectId;
  supplierName: string;
  offerId: Types.ObjectId;
  quantity: number;
  unit: string;
  unitPricePaise: number;
  lineTotalPaise: number;
  deliveryDays?: number;
  reliabilityScore?: number;
}

export interface ISupplierGroup {
  supplierId: Types.ObjectId;
  supplierName: string;
  subtotalPaise: number;
  shippingPaise: number;
  deliveryDays: number;
  lineCount: number;
}

export interface IOrderStatusHistory {
  from: OrderStatus;
  to: OrderStatus;
  at: Date;
  by?: Types.ObjectId;
  note?: string;
}

export interface IOrderApproval {
  approvedAt?: Date;
  approvedBy?: Types.ObjectId;
  rejectedAt?: Date;
  rejectedBy?: Types.ObjectId;
  reason?: string;
}

export interface IPurchaseOrder extends Document {
  orderNumber: string;
  businessId: Types.ObjectId;
  userId: Types.ObjectId;
  procurementRequestId?: Types.ObjectId;
  status: OrderStatus;
  lines: IOrderLine[];
  supplierGroups: ISupplierGroup[];
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  budgetPaise: number;
  estimatedSavingsPaise: number;
  currency: "INR";
  approval: IOrderApproval;
  paymentId?: Types.ObjectId;
  statusHistory: IOrderStatusHistory[];
  notes?: string;
  aiExplanation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderLineSchema = new Schema<IOrderLine>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    supplierName: { type: String, required: true },
    offerId: { type: Schema.Types.ObjectId, ref: "SupplierOffer", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true },
    unitPricePaise: { type: Number, required: true, min: 0 },
    lineTotalPaise: { type: Number, required: true, min: 0 },
    deliveryDays: { type: Number },
    reliabilityScore: { type: Number },
  },
  { _id: false }
);

const SupplierGroupSchema = new Schema<ISupplierGroup>(
  {
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    supplierName: { type: String, required: true },
    subtotalPaise: { type: Number, required: true, min: 0 },
    shippingPaise: { type: Number, required: true, default: 0 },
    deliveryDays: { type: Number, required: true },
    lineCount: { type: Number, required: true },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    at: { type: Date, default: Date.now },
    by: { type: Schema.Types.ObjectId, ref: "User" },
    note: { type: String },
  },
  { _id: false }
);

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    procurementRequestId: { type: Schema.Types.ObjectId, ref: "ProcurementRequest" },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING_APPROVAL,
      index: true,
    },
    lines: { type: [OrderLineSchema], required: true },
    supplierGroups: { type: [SupplierGroupSchema], required: true },
    subtotalPaise: { type: Number, required: true, min: 0 },
    shippingPaise: { type: Number, required: true, default: 0 },
    totalPaise: { type: Number, required: true, min: 0 },
    budgetPaise: { type: Number, required: true, default: 0 },
    estimatedSavingsPaise: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    approval: {
      approvedAt: { type: Date },
      approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
      rejectedAt: { type: Date },
      rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
      reason: { type: String },
    },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    notes: { type: String },
    aiExplanation: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: sanitizeToJSON,
    },
  }
);

PurchaseOrderSchema.index({ businessId: 1, status: 1 });
PurchaseOrderSchema.index({ createdAt: -1 });

export const PurchaseOrder = mongoose.model<IPurchaseOrder>("PurchaseOrder", PurchaseOrderSchema);
