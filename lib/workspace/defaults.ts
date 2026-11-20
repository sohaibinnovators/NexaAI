import type {
  FavoritesState,
  UsageState,
  WorkspacePreferences,
} from "@/lib/workspace/types";

export const DEFAULT_USAGE: UsageState = {
  totalRequests: 0,
  byTool: {},
  daily: {},
  recentToolIds: [],
  updatedAt: null,
};

export const DEFAULT_FAVORITES: FavoritesState = [];

export const DEFAULT_PREFERENCES: WorkspacePreferences = {
  theme: "system",
  defaultWritingTone: "professional",
  preferredOutputLength: "medium",
  preferredTranslationTarget: "es",
  defaultEmailTone: "professional",
  landingPage: "/",
  profile: {
    name: "Alex Rivera",
    email: "alex.rivera@nexaai.app",
    role: "Product Designer",
  },
};
