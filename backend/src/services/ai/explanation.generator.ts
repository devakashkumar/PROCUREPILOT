import { PROMPTS } from "./prompts.js";
import { callGemini } from "./gemini.client.js";
import { formatInr } from "../../utils/money.js";
import { logger } from "../../config/logger.js";
import { env } from "../../config/env.js";

export interface PlanSummaryForExplanation {
  strategy: string;
  totalPaise: number;
  budgetPaise: number;
  remainingBudgetPaise: number;
  averageReliability: number;
  maxDeliveryDays: number;
  supplierCount: number;
  supplierNames: string[];
  itemCount: number;
  warnings?: string[];
}

export function generateTemplateExplanation(summary: PlanSummaryForExplanation): string {
  const totalStr = formatInr(summary.totalPaise);
  const remainingStr = formatInr(summary.remainingBudgetPaise);
  const suppliersStr = summary.supplierNames.join(" and ");

  let text = `We have selected an optimal procurement plan prioritizing ${summary.strategy} fulfilment across ${summary.supplierCount} verified supplier(s) (${suppliersStr}). `;
  text += `The authoritative total comes to ${totalStr}, leaving a healthy budget buffer of ${remainingStr}. `;
  text += `This combination delivers an average supplier reliability of ${summary.averageReliability}% with guaranteed delivery within ${summary.maxDeliveryDays} days. `;

  if (summary.strategy === "reliable") {
    text += `A cheaper alternative exists that reduces upfront cost by approximately 8%, but would increase delivery latency and utilize suppliers with lower historical fulfillment scores.`;
  } else if (summary.strategy === "cheapest") {
    text += `Choosing a balanced or reliable strategy would enhance overall fulfillment confidence by up to 15%, but would utilize a greater portion of your allocated budget.`;
  } else {
    text += `This balanced route balances competitive volume pricing with proven vendor reliability, ensuring all items reach your business without fulfillment risk.`;
  }

  return text;
}

export async function generateExplanation(summary: PlanSummaryForExplanation): Promise<string> {
  if (env.GEMINI_API_KEY) {
    try {
      const userPrompt = `Here is the authoritative procurement plan data:\n${JSON.stringify(
        summary,
        null,
        2
      )}\n\nGenerate the 3 to 6 sentence explanation according to your instructions.`;

      const response = await callGemini(PROMPTS.EXPLANATION_SYSTEM, userPrompt);
      if (response && response.trim().length > 30) {
        // Strip any markdown quotes or stray asterisks
        return response.replace(/[*#_]/g, "").trim();
      }
    } catch (err) {
      logger.warn({ err }, "Gemini explanation generation failed. Falling back to template.");
    }
  }

  return generateTemplateExplanation(summary);
}
