import mongoose, { Schema, Document, Types } from "mongoose";
import { PaymentStatus, PAYMENT_STATUS } from "../config/constants.js";
import { sanitizeToJSON } from "./transform.js";

export interface IPaymentHistory {
  status: PaymentStatus;
  at: Date;
  source: "api" | "webhook";
  note?: string;
}

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  businessId: Types.ObjectId;
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
  rawProviderStatus?: string;
  capturedAt?: Date;
  verifiedByWebhookAt?: Date;
  history: IPaymentHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const PaymentHistorySchema = new Schema<IPaymentHistory>(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    source: { type: String, enum: ["api", "webhook"], required: true },
    note: { type: String },
  },
  { _id: false }
);

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "PurchaseOrder", required: true, index: true },
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    provider: { type: String, default: "paypal", enum: ["paypal"] },
    paypalOrderId: { type: String, sparse: true, unique: true, index: true },
    paypalCaptureId: { type: String, sparse: true, index: true },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.CREATED,
      index: true,
    },
    amountInrPaise: { type: Number, required: true, min: 0 },
    amountUsdCents: { type: Number, required: true, min: 0 },
    fxRateInrPerUsd: { type: Number, required: true },
    fxNote: { type: String, required: true },
    currency: { type: String, default: "USD" },
    payerEmail: { type: String },
    payerId: { type: String },
    idempotencyKey: { type: String, index: true },
    failureReason: { type: String },
    rawProviderStatus: { type: String },
    capturedAt: { type: Date },
    verifiedByWebhookAt: { type: Date },
    history: { type: [PaymentHistorySchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform: sanitizeToJSON,
    },
  }
);

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
