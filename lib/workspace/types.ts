export type WorkspaceToolId =
  | "chat"
  | "writer"
  | "summarizer"
  | "translator"
  | "grammar"
  | "email"
  | "code"
  | "resume";

export type HistoryEntry = {
  id: string;
  toolId: WorkspaceToolId;
  toolLabel: string;
  title: string;
  inputPreview: string;
  outputPreview: string;
  output: string;
  createdAt: string;
  /** For chat entries — references existing chat conversation storage */
  conversationId?: string;
  href: string;
};

export type UsageState = {
  totalRequests: number;
  byTool: Partial<Record<WorkspaceToolId, number>>;
  daily: Record<string, number>;
  recentToolIds: WorkspaceToolId[];
  updatedAt: string | null;
};

export type ThemePreference = "light" | "dark" | "system";

export type WorkspacePreferences = {
  theme: ThemePreference;
  defaultWritingTone: string;
  preferredOutputLength: string;
  preferredTranslationTarget: string;
  defaultEmailTone: string;
  landingPage: string;
  profile: {
    name: string;
    email: string;
    role: string;
  };
};

export type FavoritesState = WorkspaceToolId[];
