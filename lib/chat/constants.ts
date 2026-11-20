export const CHAT_STORAGE_KEY = "nexaai-chat-conversations-v1";
export const CHAT_USAGE_KEY = "nexaai-chat-request-count-v1";

export const MAX_MESSAGE_LENGTH = 8000;
export const MAX_HISTORY_MESSAGES = 40;
export const MAX_OUTPUT_TOKENS = 2048;
export const MAX_REPLY_LENGTH = 16000;

export const suggestedPrompts = [
  "Summarize today's priorities into three focus areas",
  "Draft a concise product update for the team",
  "Explain trade-offs between SSR and CSR simply",
  "Suggest interview questions for a design hire",
  "Help me outline a launch checklist for a SaaS feature",
];

export const SYSTEM_INSTRUCTION =
  "You are NexaAI, a professional AI assistant inside an AI Tools Hub. " +
  "Be clear, helpful, and concise. Prefer practical, specific answers over generic advice. " +
  "Use Markdown when it improves readability (lists, headings, and fenced code blocks). " +
  "If information is missing, ask a short clarifying question instead of inventing details. " +
  "Do not invent private user data, credentials, or unverifiable facts.";
