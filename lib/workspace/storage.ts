export const STORAGE_KEYS = {
  history: "nexaai-history-v1",
  usage: "nexaai-usage-v1",
  favorites: "nexaai-favorites-v1",
  preferences: "nexaai-preferences-v1",
  themeMode: "nexaai-theme-mode",
  themeResolved: "nexaai-theme",
  chatConversations: "nexaai-chat-conversations-v1",
  chatUsageLegacy: "nexaai-chat-request-count-v1",
} as const;

export function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const parsed = safeJsonParse<T>(window.localStorage.getItem(key));
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore quota / privacy mode errors
  }
}

export function createLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function truncateText(value: string, max = 160) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  return cleaned.length > max ? `${cleaned.slice(0, max)}…` : cleaned;
}

export function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
