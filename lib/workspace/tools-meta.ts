import type { WorkspaceToolId } from "@/lib/workspace/types";

export const WORKSPACE_TOOLS: Array<{
  id: WorkspaceToolId;
  label: string;
  href: string;
  description: string;
}> = [
  {
    id: "chat",
    label: "AI Chat",
    href: "/chat",
    description: "Ask questions, brainstorm ideas, and iterate in conversation.",
  },
  {
    id: "writer",
    label: "AI Writer",
    href: "/writer",
    description: "Create blogs, posts, and long-form drafts with tone control.",
  },
  {
    id: "summarizer",
    label: "Document Summarizer",
    href: "/summarizer",
    description: "Turn lengthy documents into clear, actionable summaries.",
  },
  {
    id: "translator",
    label: "Translator",
    href: "/translator",
    description: "Translate content while preserving meaning and tone.",
  },
  {
    id: "grammar",
    label: "Grammar Checker",
    href: "/grammar",
    description: "Catch grammar issues and improve writing clarity.",
  },
  {
    id: "email",
    label: "Email Assistant",
    href: "/email",
    description: "Compose professional emails for any context or purpose.",
  },
  {
    id: "code",
    label: "Code Assistant",
    href: "/code",
    description: "Explain, generate, debug, and improve code snippets.",
  },
  {
    id: "resume",
    label: "Resume Builder",
    href: "/resume",
    description: "Build resumes and cover letters from your details.",
  },
];

export function getToolMeta(id: WorkspaceToolId) {
  return WORKSPACE_TOOLS.find((tool) => tool.id === id)!;
}

export function toolIdFromApiTool(
  tool: string,
): Exclude<WorkspaceToolId, "chat"> | null {
  switch (tool) {
    case "writer":
    case "summarizer":
    case "translator":
    case "grammar":
    case "email":
    case "code":
    case "resume":
      return tool;
    default:
      return null;
  }
}
