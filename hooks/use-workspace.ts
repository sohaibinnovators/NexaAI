"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getFavoritesServerSnapshot,
  getFavoritesSnapshot,
  getHistoryServerSnapshot,
  getHistorySnapshot,
  getPreferencesServerSnapshot,
  getPreferencesSnapshot,
  getUsageServerSnapshot,
  getUsageSnapshot,
  subscribeFavorites,
  subscribeHistory,
  subscribePreferences,
  subscribeUsage,
} from "@/lib/workspace/store";
import { getToolMeta, WORKSPACE_TOOLS } from "@/lib/workspace/tools-meta";
import { dayKey } from "@/lib/workspace/storage";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function useHistoryEntries() {
  return useSyncExternalStore(
    subscribeHistory,
    getHistorySnapshot,
    getHistoryServerSnapshot,
  );
}

export function useUsageStats() {
  return useSyncExternalStore(
    subscribeUsage,
    getUsageSnapshot,
    getUsageServerSnapshot,
  );
}

export function useFavorites() {
  return useSyncExternalStore(
    subscribeFavorites,
    getFavoritesSnapshot,
    getFavoritesServerSnapshot,
  );
}

export function usePreferences() {
  return useSyncExternalStore(
    subscribePreferences,
    getPreferencesSnapshot,
    getPreferencesServerSnapshot,
  );
}

export function useWorkspaceInsights() {
  const history = useHistoryEntries();
  const usage = useUsageStats();
  const favorites = useFavorites();
  const isClient = useIsClient();

  return useMemo(() => {
    const toolsUsed = Object.keys(usage.byTool).length;
    const today = isClient ? dayKey() : "";
    const todayCount = today ? (usage.daily[today] ?? 0) : 0;

    const favoriteTools = favorites
      .map((id) => getToolMeta(id))
      .filter(Boolean);

    const recentTools = usage.recentToolIds
      .map((id) => getToolMeta(id))
      .filter(Boolean);

    const usageByTool = WORKSPACE_TOOLS.map((tool) => ({
      ...tool,
      count: usage.byTool[tool.id] ?? 0,
    })).sort((a, b) => b.count - a.count);

    const mostUsed = usageByTool.filter((tool) => tool.count > 0).slice(0, 4);

    const recentDays = isClient
      ? Array.from({ length: 7 }, (_, index) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - index));
          const key = dayKey(date);
          return {
            key,
            label: date.toLocaleDateString(undefined, { weekday: "short" }),
            count: usage.daily[key] ?? 0,
          };
        })
      : [];

    return {
      totalRequests: usage.totalRequests,
      toolsUsed,
      todayCount,
      favoriteTools,
      favoritesCount: favorites.length,
      recentTools,
      usageByTool,
      mostUsed,
      recentDays,
      recentActivity: history.slice(0, 6),
    };
  }, [favorites, history, isClient, usage]);
}
