import { CHAT_STORAGE_KEY, CHAT_USAGE_KEY } from "@/lib/chat/constants";
import type { ChatMessage, Conversation } from "@/lib/chat/types";

function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createMessage(
  role: ChatMessage["role"],
  content: string,
): ChatMessage {
  return {
    id: createId(role === "user" ? "u" : "a"),
    role,
    content,
    createdAt: nowIso(),
  };
}

export function createConversation(partial?: {
  title?: string;
  messages?: ChatMessage[];
}): Conversation {
  const createdAt = nowIso();
  return {
    id: createId("chat"),
    title: partial?.title?.trim() || "New conversation",
    messages: partial?.messages ?? [],
    createdAt,
    updatedAt: createdAt,
  };
}

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
}

export function loadUsageCount() {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(CHAT_USAGE_KEY);
  const value = Number(raw ?? "0");
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function saveUsageCount(count: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAT_USAGE_KEY, String(Math.max(0, count)));
}

export function deriveTitleFromMessage(message: string) {
  const cleaned = message.replace(/\s+/g, " ").trim();
  if (!cleaned) return "New conversation";
  return cleaned.length > 42 ? `${cleaned.slice(0, 42)}…` : cleaned;
}
