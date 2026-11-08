import mongoose, { Schema, Document, Types } from "mongoose";
import { sanitizeToJSON } from "./transform.js";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "owner" | "admin";
  businessId: Types.ObjectId;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["owner", "admin"], default: "owner" },
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: sanitizeToJSON,
    },
  }
);

export const User = mongoose.model<IUser>("User", UserSchema);
