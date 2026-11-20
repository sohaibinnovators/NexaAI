import type { ChatApiErrorCode } from "@/lib/chat/types";

export class GeminiServiceError extends Error {
  code: ChatApiErrorCode;
  status: number;

  constructor(code: ChatApiErrorCode, message: string, status = 500) {
    super(message);
    this.name = "GeminiServiceError";
    this.code = code;
    this.status = status;
  }
}

function readErrorText(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

export function mapGeminiError(error: unknown): GeminiServiceError {
  if (error instanceof GeminiServiceError) return error;

  const text = readErrorText(error).toLowerCase();
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : undefined;

  if (
    status === 401 ||
    status === 403 ||
    text.includes("api key") ||
    text.includes("permission") ||
    text.includes("unauthorized") ||
    text.includes("unauthenticated")
  ) {
    return new GeminiServiceError(
      "UNAUTHORIZED",
      "The AI service could not authenticate. Verify the server API key configuration.",
      401,
    );
  }

  if (
    status === 429 ||
    text.includes("resource_exhausted") ||
    text.includes("rate limit") ||
    text.includes("quota") ||
    text.includes("too many requests")
  ) {
    const isQuota =
      text.includes("quota") ||
      text.includes("billing") ||
      text.includes("exceeded your current quota");
    return new GeminiServiceError(
      isQuota ? "QUOTA_EXCEEDED" : "RATE_LIMIT",
      isQuota
        ? "API quota appears to be exhausted. Try again later or review your Google AI Studio usage."
        : "The AI service is rate-limiting requests. Please wait a moment and try again.",
      429,
    );
  }

  if (
    text.includes("abort") ||
    text.includes("timeout") ||
    text.includes("timed out") ||
    status === 408
  ) {
    return new GeminiServiceError(
      "TIMEOUT",
      "The AI request timed out or was cancelled. Please try again.",
      408,
    );
  }

  if (
    text.includes("fetch failed") ||
    text.includes("network") ||
    text.includes("econnrefused") ||
    text.includes("enotfound")
  ) {
    return new GeminiServiceError(
      "NETWORK_ERROR",
      "Could not reach the AI service. Check your network connection and try again.",
      503,
    );
  }

  if (text.includes("model") && (text.includes("not found") || text.includes("invalid"))) {
    return new GeminiServiceError(
      "MODEL_ERROR",
      "The configured Gemini model is unavailable. Update GEMINI_MODEL in .env.local.",
      400,
    );
  }

  return new GeminiServiceError(
    "SERVER_ERROR",
    "The AI service failed to generate a response. Please try again.",
    500,
  );
}
