"use client";

import { useMemo, useState } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Conversation } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

function relativeTime(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onRename,
  onDelete,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...conversations].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    if (!q) return sorted;
    return sorted.filter((conversation) => {
      const haystack = `${conversation.title} ${conversation.messages
        .map((m) => m.content)
        .join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [conversations, query]);

  return (
    <Card className="flex h-[min(70vh,760px)] flex-col overflow-hidden p-3">
      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Conversations
      </p>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations..."
          className="h-9 pl-9"
          aria-label="Search conversations"
        />
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            No conversations found.
          </p>
        ) : (
          filtered.map((conversation) => {
            const preview =
              [...conversation.messages]
                .reverse()
                .find((m) => m.role === "user" || m.role === "assistant")
                ?.content ?? "No messages yet";
            const isEditing = editingId === conversation.id;
            const isDeleting = pendingDeleteId === conversation.id;

            return (
              <div
                key={conversation.id}
                className={cn(
                  "rounded-lg border border-transparent px-2 py-2 transition-colors",
                  activeId === conversation.id
                    ? "border-border bg-secondary"
                    : "hover:bg-muted",
                )}
              >
                {isEditing ? (
                  <form
                    className="space-y-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      onRename(conversation.id, draftTitle);
                      setEditingId(null);
                    }}
                  >
                    <Input
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      autoFocus
                      className="h-8"
                    />
                    <div className="flex gap-1">
                      <Button type="submit" size="sm" className="h-7 px-2 text-xs">
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : isDeleting ? (
                  <div className="space-y-2 px-1 py-1">
                    <p className="text-xs text-muted-foreground">
                      Delete this conversation?
                    </p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="danger"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          onDelete(conversation.id);
                          setPendingDeleteId(null);
                        }}
                      >
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => setPendingDeleteId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="group">
                    <button
                      type="button"
                      onClick={() => onSelect(conversation.id)}
                      className="w-full text-left"
                    >
                      <p className="truncate text-sm font-medium">{conversation.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{preview}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {relativeTime(conversation.updatedAt)}
                      </p>
                    </button>
                    <div className="mt-1 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          setEditingId(conversation.id);
                          setDraftTitle(conversation.title);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Rename
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => setPendingDeleteId(conversation.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
