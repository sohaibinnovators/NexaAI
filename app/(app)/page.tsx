"use client";

import Link from "next/link";
import { Activity, Sparkles, Star, Zap } from "lucide-react";
import { ToolCard } from "@/components/dashboard/tool-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { usePreferences, useWorkspaceInsights } from "@/hooks/use-workspace";
import { mainNav } from "@/lib/navigation";
import { WORKSPACE_TOOLS } from "@/lib/workspace/tools-meta";

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

export default function DashboardPage() {
  const preferences = usePreferences();
  const insights = useWorkspaceInsights();
  const toolIcons = Object.fromEntries(
    mainNav
      .filter((item) => item.href !== "/")
      .map((item) => [item.href, item.icon]),
  );

  const firstName = preferences.profile.name.split(" ")[0] || "there";

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Your dashboard reflects real local AI activity from this browser—not Gemini quota or billing data."
      />

      <Card className="mb-6 overflow-hidden border-primary/20 bg-secondary/40">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                One Workspace. Smarter AI.
              </p>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Favorites, recent tools, and usage below update after successful AI requests.
              </p>
            </div>
          </div>
          <Badge tone="primary">Local activity</Badge>
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total AI Requests</CardDescription>
            <CardTitle className="text-3xl">{insights.totalRequests}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Successful local generations</p>
            <p className="mt-2 text-sm font-medium text-primary">
              {insights.todayCount} today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tools Used</CardDescription>
            <CardTitle className="text-3xl">{insights.toolsUsed}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Distinct tools with activity</p>
            <p className="mt-2 text-sm font-medium text-primary">
              of {WORKSPACE_TOOLS.length} available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Favorite Tools</CardDescription>
            <CardTitle className="text-3xl">{insights.favoritesCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Pinned for quick access</p>
            <p className="mt-2 text-sm font-medium text-primary">
              {insights.favoriteTools[0]?.label ?? "None yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Most used</CardDescription>
            <CardTitle className="text-3xl">
              {insights.mostUsed[0]?.count ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Top tool request count</p>
            <p className="mt-2 text-sm font-medium text-primary">
              {insights.mostUsed[0]?.label ?? "No activity yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <CardDescription>Latest successful generations from this device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.recentActivity.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
                <p className="text-sm font-medium">No activity yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Run any AI tool to start building your history.
                </p>
              </div>
            ) : (
              insights.recentActivity.map((item) => (
                <Link
                  key={item.id}
                  href="/history"
                  className="flex flex-col gap-2 rounded-lg border border-border px-3 py-3 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.toolLabel} · {relativeTime(item.createdAt)}
                    </p>
                  </div>
                  <Badge tone="success">Completed</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <CardTitle>Favorite Tools</CardTitle>
              </div>
              <CardDescription>Star tools from Quick Access to pin them here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {insights.favoriteTools.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No favorites yet. Use the star on any tool card.
                </p>
              ) : (
                insights.favoriteTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <div>
                      <p className="text-sm font-medium">{tool.label}</p>
                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                    <Zap className="h-4 w-4 text-primary" />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recently used</CardTitle>
              <CardDescription>Based on your latest successful requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {insights.recentTools.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Recent tools will appear after you generate content.
                </p>
              ) : (
                insights.recentTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <p className="text-sm font-medium">{tool.label}</p>
                    <span className="text-xs text-muted-foreground">
                      {insights.usageByTool.find((item) => item.id === tool.id)?.count ?? 0}{" "}
                      uses
                    </span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Usage by tool</CardTitle>
          <CardDescription>
            Local request counts only — not an official Gemini quota dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.usageByTool.every((tool) => tool.count === 0) ? (
            <p className="text-sm text-muted-foreground">
              No usage recorded yet. Generate with any tool to populate this chart.
            </p>
          ) : (
            insights.usageByTool.map((tool) => {
              const max = Math.max(...insights.usageByTool.map((item) => item.count), 1);
              const width = `${Math.round((tool.count / max) * 100)}%`;
              return (
                <div key={tool.id}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{tool.label}</span>
                    <span className="text-muted-foreground">{tool.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width }} />
                  </div>
                </div>
              );
            })
          )}

          <div className="mt-4 grid grid-cols-7 gap-2">
            {insights.recentDays.map((day) => (
              <div key={day.key} className="text-center">
                <div className="mb-1 flex h-16 items-end justify-center rounded-md bg-muted/60 px-1">
                  <div
                    className="w-full rounded-sm bg-primary/80"
                    style={{
                      height: `${Math.max(8, Math.min(100, day.count * 12))}%`,
                      opacity: day.count === 0 ? 0.2 : 1,
                    }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">{day.label}</p>
                <p className="text-[11px] font-medium">{day.count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Quick Access</h2>
          <p className="text-sm text-muted-foreground">
            Open any AI tool and star favorites for the dashboard.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {WORKSPACE_TOOLS.map((tool) => {
          const Icon = toolIcons[tool.href];
          if (!Icon) return null;
          return (
            <ToolCard
              key={tool.id}
              toolId={tool.id}
              name={tool.label}
              description={tool.description}
              href={tool.href}
              icon={Icon}
            />
          );
        })}
      </div>
    </div>
  );
}
