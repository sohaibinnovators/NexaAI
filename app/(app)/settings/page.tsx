"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { usePreferences, useUsageStats } from "@/hooks/use-workspace";
import { clearHistory, resetUsage } from "@/lib/workspace/activity";
import { DEFAULT_PREFERENCES } from "@/lib/workspace/defaults";
import {
  clearAllLocalData,
  setFavoritesStore,
  setPreferencesStore,
} from "@/lib/workspace/store";
import type { ThemePreference } from "@/lib/workspace/types";
import {
  emailTones,
  summaryLengths,
  translatorLanguages,
  writerTones,
} from "@/lib/tools/options";

const landingOptions = [
  { label: "Dashboard", value: "/" },
  { label: "AI Chat", value: "/chat" },
  { label: "AI Writer", value: "/writer" },
  { label: "History", value: "/history" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const { preference, setThemePreference } = useTheme();
  const preferences = usePreferences();
  const usage = useUsageStats();

  const [name, setName] = useState(preferences.profile.name);
  const [email, setEmail] = useState(preferences.profile.email);
  const [role, setRole] = useState(preferences.profile.role);
  const [tone, setTone] = useState(preferences.defaultWritingTone);
  const [outputLength, setOutputLength] = useState(preferences.preferredOutputLength);
  const [translationTarget, setTranslationTarget] = useState(
    preferences.preferredTranslationTarget,
  );
  const [emailTone, setEmailTone] = useState(preferences.defaultEmailTone);
  const [landingPage, setLandingPage] = useState(preferences.landingPage);
  const [confirmAction, setConfirmAction] = useState<
    null | "history" | "usage" | "preferences" | "all"
  >(null);

  function saveProfile() {
    setPreferencesStore({
      ...preferences,
      profile: { name: name.trim() || "NexaAI User", email, role },
    });
    toast({ title: "Profile saved", tone: "success" });
  }

  function saveAiPreferences() {
    setPreferencesStore({
      ...preferences,
      defaultWritingTone: tone,
      preferredOutputLength: outputLength,
      preferredTranslationTarget: translationTarget,
      defaultEmailTone: emailTone,
      landingPage,
    });
    toast({ title: "Preferences saved", tone: "success" });
  }

  function runDestructiveAction() {
    if (confirmAction === "history") {
      clearHistory();
      toast({ title: "AI history cleared", tone: "success" });
    } else if (confirmAction === "usage") {
      resetUsage();
      toast({ title: "Usage statistics reset", tone: "success" });
    } else if (confirmAction === "preferences") {
      setPreferencesStore({ ...DEFAULT_PREFERENCES });
      setThemePreference("system");
      setName(DEFAULT_PREFERENCES.profile.name);
      setEmail(DEFAULT_PREFERENCES.profile.email);
      setRole(DEFAULT_PREFERENCES.profile.role);
      setTone(DEFAULT_PREFERENCES.defaultWritingTone);
      setOutputLength(DEFAULT_PREFERENCES.preferredOutputLength);
      setTranslationTarget(DEFAULT_PREFERENCES.preferredTranslationTarget);
      setEmailTone(DEFAULT_PREFERENCES.defaultEmailTone);
      setLandingPage(DEFAULT_PREFERENCES.landingPage);
      toast({ title: "Preferences reset", tone: "success" });
    } else if (confirmAction === "all") {
      clearAllLocalData();
      setFavoritesStore([]);
      setThemePreference("system");
      setName(DEFAULT_PREFERENCES.profile.name);
      setEmail(DEFAULT_PREFERENCES.profile.email);
      setRole(DEFAULT_PREFERENCES.profile.role);
      setTone(DEFAULT_PREFERENCES.defaultWritingTone);
      setOutputLength(DEFAULT_PREFERENCES.preferredOutputLength);
      setTranslationTarget(DEFAULT_PREFERENCES.preferredTranslationTarget);
      setEmailTone(DEFAULT_PREFERENCES.defaultEmailTone);
      setLandingPage(DEFAULT_PREFERENCES.landingPage);
      toast({
        title: "All local NexaAI data cleared",
        description: "History, usage, favorites, preferences, and chat data were removed.",
        tone: "success",
      });
    }
    setConfirmAction(null);
  }

  const themeOptions: Array<{
    value: ThemePreference;
    title: string;
    description: string;
  }> = [
    { value: "light", title: "Light", description: "Clean white surfaces" },
    { value: "dark", title: "Dark", description: "Deep navy workspace" },
    { value: "system", title: "System", description: "Follow device setting" },
  ];

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage appearance, AI defaults, profile details, and local data."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Stored locally in this browser only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <Button onClick={saveProfile}>Save profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose light, dark, or system theme.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setThemePreference(option.value)}
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  preference === option.value
                    ? "border-primary bg-secondary"
                    : "border-border hover:bg-muted"
                }`}
              >
                <p className="text-sm font-medium">{option.title}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI preferences</CardTitle>
            <CardDescription>Defaults applied to relevant tools.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="writing-tone">Default writing tone</Label>
              <Select
                id="writing-tone"
                options={[...writerTones]}
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="output-length">Preferred output length</Label>
              <Select
                id="output-length"
                options={[...summaryLengths]}
                value={outputLength}
                onChange={(e) => setOutputLength(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="translation-target">Preferred translation target</Label>
              <Select
                id="translation-target"
                options={[...translatorLanguages]}
                value={translationTarget}
                onChange={(e) => setTranslationTarget(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-tone">Default email tone</Label>
              <Select
                id="email-tone"
                options={[...emailTones]}
                value={emailTone}
                onChange={(e) => setEmailTone(e.target.value)}
              />
            </div>
            <Button onClick={saveAiPreferences}>Save AI preferences</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Workspace defaults for this browser.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="landing">Preferred landing page</Label>
              <Select
                id="landing"
                options={landingOptions}
                value={landingPage}
                onChange={(e) => setLandingPage(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Saved with AI preferences. On first visit to the dashboard each session,
              NexaAI can open this page instead.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                window.location.href = landingPage || "/";
              }}
            >
              Open preferred page
            </Button>
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-medium">Local AI requests</p>
              <p className="mt-1 text-3xl font-semibold">{usage.totalRequests}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Informational browser tracking only — not a Gemini quota or billing meter.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Data management</CardTitle>
            <CardDescription>
              Destructive actions affect this browser only. API keys are never stored in
              localStorage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" onClick={() => setConfirmAction("history")}>
                Clear AI history
              </Button>
              <Button variant="outline" onClick={() => setConfirmAction("usage")}>
                Reset usage stats
              </Button>
              <Button variant="outline" onClick={() => setConfirmAction("preferences")}>
                Reset preferences
              </Button>
              <Button variant="danger" onClick={() => setConfirmAction("all")}>
                Clear all local data
              </Button>
            </div>

            {confirmAction ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm font-medium text-destructive">
                  {confirmAction === "history" && "Clear all saved AI history entries?"}
                  {confirmAction === "usage" && "Reset all local usage statistics?"}
                  {confirmAction === "preferences" &&
                    "Reset preferences and profile defaults?"}
                  {confirmAction === "all" &&
                    "Clear history, usage, favorites, preferences, theme, and chat conversations?"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This cannot be undone. Gemini API keys are not stored locally and will not
                  be affected.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="danger" size="sm" onClick={runDestructiveAction}>
                    Confirm
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmAction(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>API connection status</CardTitle>
            <CardDescription>
              Gemini runs through secure server routes. Keys stay in environment variables.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">Gemini connected (server-side)</p>
                <p className="text-sm text-muted-foreground">
                  Chat uses `/api/chat`. Writing and productivity tools use `/api/tools`.
                </p>
              </div>
            </div>
            <Badge tone="success">No API key in client storage</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
