import mongoose, { Schema, Document } from "mongoose";
import { sanitizeToJSON } from "./transform.js";

export interface IWebhookEvent extends Document {
  providerEventId: string;
  eventType: string;
  resourceId?: string;
  verified: boolean;
  processed: boolean;
  processedAt?: Date;
  outcome: "APPLIED" | "IGNORED_DUPLICATE" | "IGNORED_UNKNOWN" | "FAILED";
  payloadSummary?: Record<string, unknown>;
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookEventSchema = new Schema<IWebhookEvent>(
  {
    providerEventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true, index: true },
    resourceId: { type: String, index: true },
    verified: { type: Boolean, required: true },
    processed: { type: Boolean, default: false },
    processedAt: { type: Date },
    outcome: {
      type: String,
      enum: ["APPLIED", "IGNORED_DUPLICATE", "IGNORED_UNKNOWN", "FAILED"],
      required: true,
    },
    payloadSummary: { type: Schema.Types.Mixed },
    receivedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      transform: sanitizeToJSON,
    },
  }
);

export const WebhookEvent = mongoose.model<IWebhookEvent>("WebhookEvent", WebhookEventSchema);
