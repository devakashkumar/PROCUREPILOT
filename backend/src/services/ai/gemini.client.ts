import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!env.GEMINI_API_KEY) {
    return null;
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return client;
}

export async function callGemini(
  systemInstruction: string,
  userPrompt: string,
  responseSchema?: Record<string, unknown>,
  timeoutMs = 8000
): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) {
    logger.debug("GEMINI_API_KEY is not configured. Falling back to deterministic logic.");
    return null;
  }

  const modelName = env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API call timed out")), timeoutMs)
    );

    // Prepare config
    const config: Record<string, unknown> = {
      systemInstruction,
      temperature: 0.1,
    };

    if (responseSchema) {
      config.responseMimeType = "application/json";
      config.responseSchema = responseSchema;
    }

    const apiPromise = ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      config,
    });

    const response = (await Promise.race([apiPromise, timeoutPromise])) as {
      text?: string;
    };

    return response?.text || null;
  } catch (error) {
    logger.warn({ error, model: modelName }, "Gemini API call failed or timed out. Falling back.");
    return null;
  }
}
