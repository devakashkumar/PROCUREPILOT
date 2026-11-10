import { z } from "zod";
import { PROMPTS } from "./prompts.js";
import { callGemini } from "./gemini.client.js";
import { parseRequirementsFallback } from "./fallback.parser.js";
import { IProcurementRequirements } from "../../models/ProcurementRequest.js";
import { logger } from "../../config/logger.js";
import { env } from "../../config/env.js";

export const requirementItemSchema = z.object({
  name: z.string().min(1).max(150),
  normalizedName: z.string().min(1).max(150),
  quantity: z.number().int().positive().max(100000),
  unit: z.string().nullable().default(null),
  category: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
});

export const procurementRequirementsSchema = z.object({
  items: z.array(requirementItemSchema),
  budget: z.object({
    amountPaise: z.number().int().positive().nullable(),
    currency: z.literal("INR"),
  }),
  priority: z.enum(["cheapest", "reliable", "balanced", "fastest"]).default("balanced"),
  constraints: z.object({
    maxDeliveryDays: z.number().int().positive().nullable().default(null),
    minReliability: z.number().min(0).max(100).nullable().default(null),
    preferredSuppliers: z.array(z.string()).default([]),
    excludedSuppliers: z.array(z.string()).default([]),
  }),
  clarifications: z.array(z.string()).default([]),
});

export interface ExtractorResult {
  requirements: IProcurementRequirements;
  usedFallback: boolean;
  aiModel?: string;
}

export async function extractRequirements(userMessage: string): Promise<ExtractorResult> {
  const promptData = `<USER_REQUEST>\n${userMessage}\n</USER_REQUEST>`;

  // 1. Try Gemini Flash if configured
  if (env.GEMINI_API_KEY) {
    try {
      const jsonResponse = await callGemini(
        PROMPTS.REQUIREMENT_EXTRACTION_SYSTEM,
        promptData
      );

      if (jsonResponse) {
        // Strip markdown code fences if present
        const cleaned = jsonResponse.replace(/```json\n?|\n?```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        const validated = procurementRequirementsSchema.safeParse(parsed);

        if (validated.success) {
          return {
            requirements: validated.data as IProcurementRequirements,
            usedFallback: false,
            aiModel: env.GEMINI_MODEL,
          };
        }

        // Retry ONCE with repair prompt
        logger.warn({ error: validated.error }, "Gemini schema validation failed. Retrying with repair prompt...");
        const repairPrompt = `The previous JSON response did not strictly match our required schema:\n${JSON.stringify(
          validated.error.format()
        )}\n\nPlease repair and return strictly the compliant JSON for:\n${promptData}`;

        const repairResponse = await callGemini(
          PROMPTS.REQUIREMENT_EXTRACTION_SYSTEM,
          repairPrompt
        );

        if (repairResponse) {
          const cleanedRepair = repairResponse.replace(/```json\n?|\n?```/g, "").trim();
          const parsedRepair = JSON.parse(cleanedRepair);
          const validatedRepair = procurementRequirementsSchema.safeParse(parsedRepair);

          if (validatedRepair.success) {
            return {
              requirements: validatedRepair.data as IProcurementRequirements,
              usedFallback: false,
              aiModel: env.GEMINI_MODEL,
            };
          }
        }
      }
    } catch (err) {
      logger.warn({ err }, "Error in Gemini requirement extraction. Reverting to deterministic fallback.");
    }
  }

  // 2. Fallback parser
  logger.info("Using deterministic fallback parser for requirements.");
  const fallbackResult = parseRequirementsFallback(userMessage);

  return {
    requirements: fallbackResult,
    usedFallback: true,
    aiModel: "deterministic-regex-fallback",
  };
}
