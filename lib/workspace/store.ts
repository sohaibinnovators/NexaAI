import { DEFAULT_FAVORITES, DEFAULT_PREFERENCES, DEFAULT_USAGE } from "@/lib/workspace/defaults";
import {
  readStorage,
  STORAGE_KEYS,
  writeStorage,
} from "@/lib/workspace/storage";
import type {
  FavoritesState,
  HistoryEntry,
  UsageState,
  WorkspacePreferences,
  WorkspaceToolId,
} from "@/lib/workspace/types";
import { WORKSPACE_TOOLS } from "@/lib/workspace/tools-meta";

const historyListeners = new Set<() => void>();
const usageListeners = new Set<() => void>();
const favoritesListeners = new Set<() => void>();
const preferencesListeners = new Set<() => void>();

const SERVER_HISTORY: HistoryEntry[] = [];
const SERVER_USAGE: UsageState = {
  totalRequests: 0,
  byTool: {},
  daily: {},
  recentToolIds: [],
  updatedAt: null,
};
const SERVER_FAVORITES: FavoritesState = [];
const SERVER_PREFERENCES: WorkspacePreferences = {
  theme: DEFAULT_PREFERENCES.theme,
  defaultWritingTone: DEFAULT_PREFERENCES.defaultWritingTone,
  preferredOutputLength: DEFAULT_PREFERENCES.preferredOutputLength,
  preferredTranslationTarget: DEFAULT_PREFERENCES.preferredTranslationTarget,
  defaultEmailTone: DEFAULT_PREFERENCES.defaultEmailTone,
  landingPage: DEFAULT_PREFERENCES.landingPage,
  profile: {
    name: DEFAULT_PREFERENCES.profile.name,
    email: DEFAULT_PREFERENCES.profile.email,
    role: DEFAULT_PREFERENCES.profile.role,
  },
};

let historyCache: HistoryEntry[] | null = null;
let usageCache: UsageState | null = null;
let favoritesCache: FavoritesState | null = null;
let preferencesCache: WorkspacePreferences | null = null;

function emit(listeners: Set<() => void>) {
  listeners.forEach((listener) => listener());
}

function normalizeHistory(value: unknown): HistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => {
    return (
      item &&
      typeof item === "object" &&
      typeof (item as HistoryEntry).id === "string" &&
      typeof (item as HistoryEntry).toolId === "string" &&
      typeof (item as HistoryEntry).createdAt === "string"
    );
  }) as HistoryEntry[];
}

function normalizeUsage(value: unknown): UsageState {
  if (!value || typeof value !== "object") return { ...DEFAULT_USAGE };
  const raw = value as Partial<UsageState>;
  return {
    totalRequests:
      typeof raw.totalRequests === "number" && raw.totalRequests >= 0
        ? raw.totalRequests
        : 0,
    byTool: raw.byTool && typeof raw.byTool === "object" ? raw.byTool : {},
    daily: raw.daily && typeof raw.daily === "object" ? raw.daily : {},
    recentToolIds: Array.isArray(raw.recentToolIds)
      ? (raw.recentToolIds.filter((id) =>
          WORKSPACE_TOOLS.some((tool) => tool.id === id),
        ) as WorkspaceToolId[])
      : [],
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
  };
}

function normalizeFavorites(value: unknown): FavoritesState {
  if (!Array.isArray(value)) return [...DEFAULT_FAVORITES];
  return value.filter((id) =>
    WORKSPACE_TOOLS.some((tool) => tool.id === id),
  ) as WorkspaceToolId[];
}

function normalizePreferences(value: unknown): WorkspacePreferences {
  if (!value || typeof value !== "object") return { ...DEFAULT_PREFERENCES };
  const raw = value as Partial<WorkspacePreferences>;
  return {
    theme:
      raw.theme === "light" || raw.theme === "dark" || raw.theme === "system"
        ? raw.theme
        : DEFAULT_PREFERENCES.theme,
    defaultWritingTone:
      typeof raw.defaultWritingTone === "string"
        ? raw.defaultWritingTone
        : DEFAULT_PREFERENCES.defaultWritingTone,
    preferredOutputLength:
      typeof raw.preferredOutputLength === "string"
        ? raw.preferredOutputLength
        : DEFAULT_PREFERENCES.preferredOutputLength,
    preferredTranslationTarget:
      typeof raw.preferredTranslationTarget === "string"
        ? raw.preferredTranslationTarget
        : DEFAULT_PREFERENCES.preferredTranslationTarget,
    defaultEmailTone:
      typeof raw.defaultEmailTone === "string"
        ? raw.defaultEmailTone
        : DEFAULT_PREFERENCES.defaultEmailTone,
    landingPage:
      typeof raw.landingPage === "string"
        ? raw.landingPage
        : DEFAULT_PREFERENCES.landingPage,
    profile: {
      name:
        typeof raw.profile?.name === "string"
          ? raw.profile.name
          : DEFAULT_PREFERENCES.profile.name,
      email:
        typeof raw.profile?.email === "string"
          ? raw.profile.email
          : DEFAULT_PREFERENCES.profile.email,
      role:
        typeof raw.profile?.role === "string"
          ? raw.profile.role
          : DEFAULT_PREFERENCES.profile.role,
    },
  };
}

export function subscribeHistory(listener: () => void) {
  historyListeners.add(listener);
  return () => historyListeners.delete(listener);
}

export function getHistorySnapshot() {
  if (historyCache === null) {
    historyCache = normalizeHistory(readStorage(STORAGE_KEYS.history, []));
  }
  return historyCache;
}

export function getHistoryServerSnapshot(): HistoryEntry[] {
  return SERVER_HISTORY;
}

export function setHistoryStore(next: HistoryEntry[]) {
  historyCache = next;
  writeStorage(STORAGE_KEYS.history, next);
  emit(historyListeners);
}

export function subscribeUsage(listener: () => void) {
  usageListeners.add(listener);
  return () => usageListeners.delete(listener);
}

export function getUsageSnapshot() {
  if (usageCache === null) {
    usageCache = normalizeUsage(readStorage(STORAGE_KEYS.usage, DEFAULT_USAGE));
  }
  return usageCache;
}

export function getUsageServerSnapshot(): UsageState {
  return SERVER_USAGE;
}

export function setUsageStore(next: UsageState) {
  usageCache = next;
  writeStorage(STORAGE_KEYS.usage, next);
  emit(usageListeners);
}

export function subscribeFavorites(listener: () => void) {
  favoritesListeners.add(listener);
  return () => favoritesListeners.delete(listener);
}

export function getFavoritesSnapshot() {
  if (favoritesCache === null) {
    favoritesCache = normalizeFavorites(
      readStorage(STORAGE_KEYS.favorites, DEFAULT_FAVORITES),
    );
  }
  return favoritesCache;
}

export function getFavoritesServerSnapshot(): FavoritesState {
  return SERVER_FAVORITES;
}

export function setFavoritesStore(next: FavoritesState) {
  favoritesCache = next;
  writeStorage(STORAGE_KEYS.favorites, next);
  emit(favoritesListeners);
}

export function subscribePreferences(listener: () => void) {
  preferencesListeners.add(listener);
  return () => preferencesListeners.delete(listener);
}

export function getPreferencesSnapshot() {
  if (preferencesCache === null) {
    preferencesCache = normalizePreferences(
      readStorage(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES),
    );
  }
  return preferencesCache;
}

export function getPreferencesServerSnapshot(): WorkspacePreferences {
  return SERVER_PREFERENCES;
}

export function setPreferencesStore(next: WorkspacePreferences) {
  preferencesCache = next;
  writeStorage(STORAGE_KEYS.preferences, next);
  emit(preferencesListeners);
}

export function resetPreferencesStore() {
  setPreferencesStore({ ...DEFAULT_PREFERENCES });
}

export function clearAllLocalData() {
  setHistoryStore([]);
  setUsageStore({ ...DEFAULT_USAGE });
  setFavoritesStore([]);
  resetPreferencesStore();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEYS.chatConversations);
      window.localStorage.removeItem(STORAGE_KEYS.chatUsageLegacy);
      window.localStorage.removeItem(STORAGE_KEYS.themeMode);
      window.localStorage.removeItem(STORAGE_KEYS.themeResolved);
      // Reset in-memory chat caches without importing at module top (avoid cycles).
      void import("@/lib/chat/store").then((mod) => {
        mod.resetChatStores();
      });
    } catch {
      // ignore
    }
  }
}
