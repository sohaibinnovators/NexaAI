import { recordActivity } from "@/lib/workspace/activity";
import { toolIdFromApiTool } from "@/lib/workspace/tools-meta";
import type { ToolRequestPayload } from "@/lib/tools/types";

function describePayload(payload: ToolRequestPayload) {
  switch (payload.tool) {
    case "writer":
      return {
        title: payload.topic,
        input: `Type: ${payload.contentType}; Tone: ${payload.tone}; ${payload.topic}`,
      };
    case "summarizer":
      return {
        title: `${payload.length} summary`,
        input: payload.text,
      };
    case "translator":
      return {
        title: `${payload.sourceLanguage} → ${payload.targetLanguage}`,
        input: payload.text,
      };
    case "grammar":
      return {
        title: "Grammar check",
        input: payload.text,
      };
    case "email":
      return {
        title: payload.subjectHint || payload.purpose,
        input: payload.points,
      };
    case "code":
      return {
        title: `${payload.task} · ${payload.language}`,
        input: payload.instructions,
      };
    case "resume":
      return {
        title:
          payload.mode === "cover-letter"
            ? `Cover letter · ${payload.jobTitle ?? "Role"}`
            : `Resume · ${payload.professionalTitle || payload.fullName || "Draft"}`,
        input:
          payload.mode === "cover-letter"
            ? `${payload.jobTitle} at ${payload.companyName}`
            : [
                payload.fullName,
                payload.professionalTitle,
                payload.skills,
                payload.summary,
              ]
                .filter(Boolean)
                .join(" · "),
      };
  }
}

export function recordToolSuccess(
  payload: ToolRequestPayload,
  output: string,
) {
  const toolId = toolIdFromApiTool(payload.tool);
  if (!toolId) return;
  const details = describePayload(payload);
  recordActivity({
    toolId,
    title: details.title,
    inputPreview: details.input,
    output,
  });
}
