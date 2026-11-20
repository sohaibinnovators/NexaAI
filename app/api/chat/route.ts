import { generateChatResponse, validateChatInput } from "@/lib/gemini/chat";
import { GeminiServiceError, mapGeminiError } from "@/lib/gemini/errors";
import type { ChatApiResponse } from "@/lib/chat/types";

function json(data: ChatApiResponse, status = 200) {
  return Response.json(data, { status });
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new GeminiServiceError(
        "VALIDATION_ERROR",
        "Request body must be valid JSON.",
        400,
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new GeminiServiceError(
        "VALIDATION_ERROR",
        "Unsupported request payload.",
        400,
      );
    }

    const payload = body as Record<string, unknown>;
    if ("stream" in payload || "tools" in payload || "system" in payload) {
      throw new GeminiServiceError(
        "VALIDATION_ERROR",
        "Unsupported fields in request payload.",
        400,
      );
    }

    const { message, history } = validateChatInput({
      message: payload.message,
      history: payload.history,
    });

    const result = await generateChatResponse({
      message,
      history,
      abortSignal: request.signal,
    });

    return json({
      ok: true,
      reply: result.reply,
      model: result.model,
    });
  } catch (error) {
    const mapped = mapGeminiError(error);
    return json(
      {
        ok: false,
        error: {
          code: mapped.code,
          message: mapped.message,
        },
      },
      mapped.status >= 400 && mapped.status < 600 ? mapped.status : 500,
    );
  }
}
