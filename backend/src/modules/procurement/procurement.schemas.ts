import { z } from "zod";
import { procurementRequirementsSchema } from "../../services/ai/requirement.extractor.js";

export const analyzeRequestSchema = z.object({
  message: z.string().min(3, "Message must be at least 3 characters").max(2000),
});

export const searchRequestSchema = z.object({
  requestId: z.string().min(1, "requestId is required"),
  requirements: procurementRequirementsSchema.optional(),
  overrideProductIds: z.record(z.string()).optional(),
});

export const optimizeRequestSchema = z.object({
  requestId: z.string().min(1, "requestId is required"),
  strategy: z.enum(["cheapest", "reliable", "balanced", "fastest"]).optional().default("balanced"),
  overrides: z
    .object({
      budgetPaise: z.number().int().positive().optional(),
      selectedProductIds: z.record(z.string()).optional(),
      excludedSuppliers: z.array(z.string()).optional(),
      preferredSuppliers: z.array(z.string()).optional(),
    })
    .optional(),
});
