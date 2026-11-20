"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Eye, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useHistoryEntries } from "@/hooks/use-workspace";
import { clearHistory, deleteHistoryEntry } from "@/lib/workspace/activity";
import { WORKSPACE_TOOLS } from "@/lib/workspace/tools-meta";
import type { HistoryEntry } from "@/lib/workspace/types";
import { copyToClipboard } from "@/lib/utils";

const toolFilters = [
  { label: "All tools", value: "all" },
  ...WORKSPACE_TOOLS.map((tool) => ({ label: tool.label, value: tool.id })),
];

const dateFilters = [
  { label: "Any time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
];

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function matchesDate(createdAt: string, filter: string) {
  if (filter === "all") return true;
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  if (filter === "today") {
    return new Date(createdAt).toDateString() === new Date().toDateString();
  }
  if (filter === "7d") return now - created <= 7 * 24 * 60 * 60 * 1000;
  if (filter === "30d") return now - created <= 30 * 24 * 60 * 60 * 1000;
  return true;
}

export default function HistoryPage() {
  const { toast } = useToast();
  const entries = useHistoryEntries();
  const [query, setQuery] = useState("");
  const [tool, setTool] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [confirmClear, setConfirmClear] = useState(false);
  const [selected, setSelected] = useState<HistoryEntry | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesTool = tool === "all" || entry.toolId === tool;
      const matchesDateFilter = matchesDate(entry.createdAt, dateFilter);
      const haystack =
        `${entry.title} ${entry.inputPreview} ${entry.outputPreview} ${entry.toolLabel}`.toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      return matchesTool && matchesDateFilter && matchesQuery;
    });
  }, [dateFilter, entries, query, tool]);

  async function handleCopy(output: string) {
    const ok = await copyToClipboard(output);
    if (ok) toast({ title: "Output copied", tone: "success" });
  }

  return (
    <div>
      <PageHeader
        title="History"
        description="Review saved AI activity across all tools. Chat entries link to existing conversations without duplicating message storage."
        actions={
          confirmClear ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  clearHistory();
                  setSelected(null);
                  setConfirmClear(false);
                  toast({ title: "History cleared", tone: "success" });
                }}
              >
                Confirm clear
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setConfirmClear(true)}
              disabled={entries.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              Clear history
            </Button>
          )
        }
      />

      <Card className="mb-4">
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_180px_180px] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="history-search">Search history</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="history-search"
                className="pl-9"
                placeholder="Search by title, input, or output..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="history-filter">Tool</Label>
            <Select
              id="history-filter"
              options={toolFilters}
              value={tool}
              onChange={(e) => setTool(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="history-date">Date</Label>
            <Select
              id="history-date"
              options={dateFilters}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm font-medium">No history yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Successful AI generations will appear here automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
          <div className="space-y-3">
            {filtered.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{entry.title}</p>
                    <Badge tone="primary">{entry.toolLabel}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.outputPreview}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(entry.createdAt)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(entry)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Review
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void handleCopy(entry.output)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </Button>
                    <Link
                      href={entry.href}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      Open tool
                    </Link>
                    {pendingDeleteId === entry.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            deleteHistoryEntry(entry.id);
                            if (selected?.id === entry.id) setSelected(null);
                            setPendingDeleteId(null);
                            toast({ title: "Entry deleted", tone: "success" });
                          }}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPendingDeleteId(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setPendingDeleteId(entry.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit lg:sticky lg:top-24">
            <CardContent className="space-y-3 p-4">
              {selected ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{selected.title}</p>
                    <Badge tone="primary">{selected.toolLabel}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(selected.createdAt)}
                  </p>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Input preview
                    </p>
                    <p className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                      {selected.inputPreview || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Generated output
                    </p>
                    <pre className="max-h-[420px] overflow-auto rounded-lg border border-border bg-card p-3 font-sans text-sm leading-relaxed whitespace-pre-wrap">
                      {selected.output}
                    </pre>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void handleCopy(selected.output)}
                    >
                      Copy output
                    </Button>
                    <Link
                      href={selected.href}
                      className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      Open related tool
                    </Link>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium">Select an entry</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Review full generated output without leaving History.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
