import mongoose, { Schema, Document } from "mongoose";
import { sanitizeToJSON } from "./transform.js";

export interface IProduct extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    brand: { type: String, required: true, trim: true },
    unit: {
      type: String,
      required: true,
      enum: ["unit", "kg", "packet", "litre", "box", "piece"],
      default: "unit",
    },
    packSize: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    aliases: [{ type: String, trim: true }],
    imageUrl: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: sanitizeToJSON,
    },
  }
);

ProductSchema.index(
  {
    name: "text",
    aliases: "text",
    tags: "text",
    category: "text",
  },
  {
    weights: {
      name: 10,
      aliases: 7,
      category: 4,
      tags: 3,
    },
    name: "ProductTextIndex",
  }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
