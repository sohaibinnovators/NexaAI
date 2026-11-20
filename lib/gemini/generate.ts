import type { Content } from "@google/genai";
import { getGeminiClient, getGeminiModel } from "@/lib/gemini/client";
import { GeminiServiceError, mapGeminiError } from "@/lib/gemini/errors";

export const DEFAULT_MAX_OUTPUT_TOKENS = 2048;
export const DEFAULT_MAX_REPLY_LENGTH = 16000;

export type GenerateTextInput = {
  prompt: string;
  systemInstruction: string;
  temperature?: number;
  maxOutputTokens?: number;
  abortSignal?: AbortSignal;
};

export type GenerateTextResult = {
  text: string;
  model: string;
};

export async function generateText(
  input: GenerateTextInput,
): Promise<GenerateTextResult> {
  const prompt = input.prompt.trim();
  if (!prompt) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Prompt cannot be empty.",
      400,
    );
  }

  const model = getGeminiModel();
  const ai = getGeminiClient();
  const contents: Content[] = [
    {
      role: "user",
      parts: [{ text: prompt }],
    },
  ];

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: input.systemInstruction,
        maxOutputTokens: input.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
        temperature: input.temperature ?? 0.7,
        abortSignal: input.abortSignal,
      },
    });

    const text = response.text?.trim() ?? "";
    if (!text) {
      throw new GeminiServiceError(
        "MODEL_ERROR",
        "The model returned an empty response. Please try again.",
        502,
      );
    }

    return {
      text: text.slice(0, DEFAULT_MAX_REPLY_LENGTH),
      model,
    };
  } catch (error) {
    if (input.abortSignal?.aborted) {
      throw new GeminiServiceError(
        "TIMEOUT",
        "The AI request was cancelled.",
        499,
      );
    }
    throw mapGeminiError(error);
  }
}
