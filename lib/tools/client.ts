import type { ToolApiResponse, ToolRequestPayload } from "@/lib/tools/types";

export async function requestToolGeneration(
  payload: ToolRequestPayload,
  signal?: AbortSignal,
): Promise<ToolApiResponse> {
  const response = await fetch("/api/tools", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  let data: ToolApiResponse;
  try {
    data = (await response.json()) as ToolApiResponse;
  } catch {
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: "The AI service returned an invalid response. Please try again.",
      },
    };
  }

  return data;
}
