import { runToolGeneration, validateToolPayload } from "@/lib/gemini/tools";
import { mapGeminiError } from "@/lib/gemini/errors";
import type { ToolApiResponse } from "@/lib/tools/types";

function json(data: ToolApiResponse, status = 200) {
  return Response.json(data, { status });
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Request body must be valid JSON.",
          },
        },
        400,
      );
    }

    const payload = validateToolPayload(body);
    const result = await runToolGeneration(payload, request.signal);
    return json(result);
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
