import {
  loadConversations,
  loadUsageCount,
  saveConversations,
  saveUsageCount,
} from "@/lib/chat/storage";
import type { Conversation } from "@/lib/chat/types";

const conversationListeners = new Set<() => void>();
const usageListeners = new Set<() => void>();

let conversationsCache: Conversation[] | null = null;
let usageCache: number | null = null;

function emit(listeners: Set<() => void>) {
  listeners.forEach((listener) => listener());
}

export function subscribeConversations(listener: () => void) {
  conversationListeners.add(listener);
  return () => conversationListeners.delete(listener);
}

export function getConversationsSnapshot() {
  if (conversationsCache === null) {
    conversationsCache = loadConversations();
  }
  return conversationsCache;
}

const SERVER_CONVERSATIONS: Conversation[] = [];

export function getConversationsServerSnapshot(): Conversation[] {
  return SERVER_CONVERSATIONS;
}

export function setConversationsStore(next: Conversation[]) {
  conversationsCache = next;
  saveConversations(next);
  emit(conversationListeners);
}

export function subscribeUsage(listener: () => void) {
  usageListeners.add(listener);
  return () => usageListeners.delete(listener);
}

export function getUsageSnapshot() {
  if (usageCache === null) {
    usageCache = loadUsageCount();
  }
  return usageCache;
}

export function getUsageServerSnapshot() {
  return 0;
}

export function setUsageStore(count: number) {
  usageCache = Math.max(0, count);
  saveUsageCount(usageCache);
  emit(usageListeners);
}

export function resetChatStores() {
  conversationsCache = [];
  usageCache = 0;
  emit(conversationListeners);
  emit(usageListeners);
}
