import type { Content } from "@google/genai";
import {
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_LENGTH,
  MAX_OUTPUT_TOKENS,
  MAX_REPLY_LENGTH,
  SYSTEM_INSTRUCTION,
} from "@/lib/chat/constants";
import type { ChatApiMessage } from "@/lib/chat/types";
import { getGeminiClient, getGeminiModel } from "@/lib/gemini/client";
import { GeminiServiceError, mapGeminiError } from "@/lib/gemini/errors";

export type GenerateChatInput = {
  message: string;
  history?: ChatApiMessage[];
  abortSignal?: AbortSignal;
};

export type GenerateChatResult = {
  reply: string;
  model: string;
};

function normalizeRole(role: ChatApiMessage["role"]): "user" | "model" {
  return role === "assistant" ? "model" : "user";
}

function toContents(history: ChatApiMessage[], message: string): Content[] {
  const trimmedHistory = history
    .filter(
      (item) =>
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim().length > 0,
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => ({
      role: normalizeRole(item.role),
      parts: [{ text: item.content.trim().slice(0, MAX_MESSAGE_LENGTH) }],
    }));

  return [
    ...trimmedHistory,
    {
      role: "user",
      parts: [{ text: message }],
    },
  ];
}

export function validateChatInput(input: {
  message?: unknown;
  history?: unknown;
}): { message: string; history: ChatApiMessage[] } {
  if (typeof input.message !== "string") {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Message must be a string.",
      400,
    );
  }

  const message = input.message.trim();
  if (!message) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Message cannot be empty.",
      400,
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      `Message exceeds the ${MAX_MESSAGE_LENGTH} character limit.`,
      400,
    );
  }

  if (input.history !== undefined && !Array.isArray(input.history)) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "History must be an array of messages.",
      400,
    );
  }

  const history = (input.history ?? [])
    .slice(0, MAX_HISTORY_MESSAGES)
    .map((item) => {
      if (
        !item ||
        typeof item !== "object" ||
        !("role" in item) ||
        !("content" in item)
      ) {
        throw new GeminiServiceError(
          "VALIDATION_ERROR",
          "Each history item must include role and content.",
          400,
        );
      }

      const role = (item as { role: unknown }).role;
      const content = (item as { content: unknown }).content;

      if (role !== "user" && role !== "assistant") {
        throw new GeminiServiceError(
          "VALIDATION_ERROR",
          "History roles must be user or assistant.",
          400,
        );
      }

      if (typeof content !== "string") {
        throw new GeminiServiceError(
          "VALIDATION_ERROR",
          "History content must be a string.",
          400,
        );
      }

      return {
        role,
        content: content.slice(0, MAX_MESSAGE_LENGTH),
      } satisfies ChatApiMessage;
    });

  return { message, history };
}

export async function generateChatResponse(
  input: GenerateChatInput,
): Promise<GenerateChatResult> {
  const { message, history } = validateChatInput(input);
  const model = getGeminiModel();
  const ai = getGeminiClient();

  try {
    const response = await ai.models.generateContent({
      model,
      contents: toContents(history, message),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.7,
        abortSignal: input.abortSignal,
      },
    });

    const reply = response.text?.trim() ?? "";
    if (!reply) {
      throw new GeminiServiceError(
        "MODEL_ERROR",
        "The model returned an empty response. Please try again.",
        502,
      );
    }

    return {
      reply: reply.slice(0, MAX_REPLY_LENGTH),
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
