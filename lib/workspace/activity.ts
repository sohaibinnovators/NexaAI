import { createLocalId, dayKey, truncateText } from "@/lib/workspace/storage";
import { getToolMeta } from "@/lib/workspace/tools-meta";
import type { HistoryEntry, WorkspaceToolId } from "@/lib/workspace/types";
import {
  getFavoritesSnapshot,
  getHistorySnapshot,
  getUsageSnapshot,
  setFavoritesStore,
  setHistoryStore,
  setUsageStore,
} from "@/lib/workspace/store";
import { DEFAULT_USAGE } from "@/lib/workspace/defaults";

const MAX_HISTORY = 200;
const MAX_OUTPUT_STORED = 8000;
const DUPLICATE_WINDOW_MS = 4000;

function isDuplicate(next: HistoryEntry, existing: HistoryEntry[]) {
  const latest = existing[0];
  if (!latest) return false;
  if (latest.toolId !== next.toolId) return false;
  if (latest.title !== next.title) return false;
  if (latest.outputPreview !== next.outputPreview) return false;
  const delta =
    new Date(next.createdAt).getTime() - new Date(latest.createdAt).getTime();
  return delta >= 0 && delta < DUPLICATE_WINDOW_MS;
}

export function recordActivity(input: {
  toolId: WorkspaceToolId;
  title: string;
  inputPreview: string;
  output: string;
  conversationId?: string;
}) {
  const meta = getToolMeta(input.toolId);
  const createdAt = new Date().toISOString();
  const entry: HistoryEntry = {
    id: createLocalId("hist"),
    toolId: input.toolId,
    toolLabel: meta.label,
    title: truncateText(input.title, 80) || meta.label,
    inputPreview: truncateText(input.inputPreview, 180),
    outputPreview: truncateText(input.output, 180),
    output: input.output.slice(0, MAX_OUTPUT_STORED),
    createdAt,
    conversationId: input.conversationId,
    href: input.conversationId
      ? `${meta.href}?c=${encodeURIComponent(input.conversationId)}`
      : meta.href,
  };

  const history = getHistorySnapshot();
  if (!isDuplicate(entry, history)) {
    setHistoryStore([entry, ...history].slice(0, MAX_HISTORY));
  }

  const usage = getUsageSnapshot();
  const today = dayKey();
  const nextUsage = {
    totalRequests: usage.totalRequests + 1,
    byTool: {
      ...usage.byTool,
      [input.toolId]: (usage.byTool[input.toolId] ?? 0) + 1,
    },
    daily: {
      ...usage.daily,
      [today]: (usage.daily[today] ?? 0) + 1,
    },
    recentToolIds: [
      input.toolId,
      ...usage.recentToolIds.filter((id) => id !== input.toolId),
    ].slice(0, 8),
    updatedAt: createdAt,
  };
  setUsageStore(nextUsage);

  return entry;
}

export function deleteHistoryEntry(id: string) {
  setHistoryStore(getHistorySnapshot().filter((item) => item.id !== id));
}

export function clearHistory() {
  setHistoryStore([]);
}

export function resetUsage() {
  setUsageStore({ ...DEFAULT_USAGE });
}

export function toggleFavorite(toolId: WorkspaceToolId) {
  const current = getFavoritesSnapshot();
  if (current.includes(toolId)) {
    setFavoritesStore(current.filter((id) => id !== toolId));
    return false;
  }
  setFavoritesStore([toolId, ...current]);
  return true;
}
