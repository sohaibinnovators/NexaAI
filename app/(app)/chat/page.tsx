"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  Loader2,
  MessageSquarePlus,
  Send,
  Sparkles,
  Square,
} from "lucide-react";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";
import { MessageBubble } from "@/components/chat/message-bubble";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { suggestedPrompts } from "@/lib/chat/constants";
import {
  createConversation,
  createMessage,
  deriveTitleFromMessage,
} from "@/lib/chat/storage";
import {
  getConversationsServerSnapshot,
  getConversationsSnapshot,
  setConversationsStore,
  subscribeConversations,
} from "@/lib/chat/store";
import type {
  ChatApiResponse,
  ChatMessage,
  Conversation,
} from "@/lib/chat/types";
import { recordActivity } from "@/lib/workspace/activity";
import { useUsageStats } from "@/hooks/use-workspace";

type RequestError = {
  code: string;
  message: string;
};

export default function ChatPage() {
  const conversations = useSyncExternalStore(
    subscribeConversations,
    getConversationsSnapshot,
    getConversationsServerSnapshot,
  );
  const usage = useUsageStats();
  const usageCount = usage.byTool.chat ?? 0;

  const [activeId, setActiveId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("c");
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RequestError | null>(null);
  const [pendingRetry, setPendingRetry] = useState<{
    message: string;
    history: ChatMessage[];
    replaceAssistantId?: string;
  } | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);

  const resolvedActiveId =
    activeId && conversations.some((item) => item.id === activeId)
      ? activeId
      : (conversations[0]?.id ?? null);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === resolvedActiveId) ?? null,
    [conversations, resolvedActiveId],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeConversation?.messages, loading, error]);

  const replaceConversations = useCallback(
    (updater: (prev: Conversation[]) => Conversation[]) => {
      setConversationsStore(updater(getConversationsSnapshot()));
    },
    [],
  );

  const updateConversation = useCallback(
    (id: string, updater: (conversation: Conversation) => Conversation) => {
      replaceConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === id ? updater(conversation) : conversation,
        ),
      );
    },
    [replaceConversations],
  );

  const stopRequest = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    sendingRef.current = false;
  }, []);

  const requestAssistant = useCallback(
    async ({
      conversationId,
      message,
      history,
      replaceAssistantId,
    }: {
      conversationId: string;
      message: string;
      history: ChatMessage[];
      replaceAssistantId?: string;
    }) => {
      if (sendingRef.current) return;
      sendingRef.current = true;
      setLoading(true);
      setError(null);
      setPendingRetry({ message, history, replaceAssistantId });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            message,
            history: history.map(({ role, content }) => ({ role, content })),
          }),
        });

        const data = (await response.json()) as ChatApiResponse;

        if (!data.ok) {
          setError({ code: data.error.code, message: data.error.message });
          if (replaceAssistantId) {
            updateConversation(conversationId, (conversation) => ({
              ...conversation,
              messages: conversation.messages.filter(
                (item) => item.id !== replaceAssistantId,
              ),
              updatedAt: new Date().toISOString(),
            }));
          }
          return;
        }

        const assistantMessage = createMessage("assistant", data.reply);

        updateConversation(conversationId, (conversation) => {
          const messages = replaceAssistantId
            ? conversation.messages.map((item) =>
                item.id === replaceAssistantId ? assistantMessage : item,
              )
            : [...conversation.messages, assistantMessage];

          const shouldRename =
            conversation.title === "New conversation" ||
            conversation.title.startsWith("New conversation");

          return {
            ...conversation,
            title: shouldRename
              ? deriveTitleFromMessage(message)
              : conversation.title,
            messages,
            updatedAt: new Date().toISOString(),
          };
        });

        recordActivity({
          toolId: "chat",
          title: deriveTitleFromMessage(message),
          inputPreview: message,
          output: data.reply,
          conversationId,
        });
        setPendingRetry(null);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setError({
            code: "TIMEOUT",
            message: "Request stopped. You can retry whenever you're ready.",
          });
        } else {
          setError({
            code: "NETWORK_ERROR",
            message:
              "Network error while contacting the AI service. Check your connection and try again.",
          });
        }
      } finally {
        abortRef.current = null;
        setLoading(false);
        sendingRef.current = false;
      }
    },
    [updateConversation],
  );

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || loading || sendingRef.current) return;

      const userMessage = createMessage("user", text);
      const snapshot = getConversationsSnapshot();
      const existing = snapshot.find((item) => item.id === resolvedActiveId);

      let conversationId: string;
      let history: ChatMessage[];

      if (existing) {
        conversationId = existing.id;
        history = existing.messages;
        updateConversation(existing.id, (item) => ({
          ...item,
          messages: [...item.messages, userMessage],
          title:
            item.messages.length === 0
              ? deriveTitleFromMessage(text)
              : item.title,
          updatedAt: new Date().toISOString(),
        }));
      } else {
        const created = createConversation({
          title: deriveTitleFromMessage(text),
          messages: [userMessage],
        });
        conversationId = created.id;
        history = [];
        setConversationsStore([created, ...snapshot]);
        setActiveId(created.id);
      }

      setInput("");

      await requestAssistant({
        conversationId,
        message: text,
        history,
      });
    },
    [loading, requestAssistant, resolvedActiveId, updateConversation],
  );

  const regenerateLast = useCallback(async () => {
    if (!activeConversation || loading || sendingRef.current) return;

    const messages = [...activeConversation.messages];
    let assistantIndex = -1;
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === "assistant") {
        assistantIndex = i;
        break;
      }
    }
    if (assistantIndex < 0) return;

    let userIndex = -1;
    for (let i = assistantIndex - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === "user") {
        userIndex = i;
        break;
      }
    }
    if (userIndex < 0) return;

    const userMessage = messages[userIndex]!;
    const assistantMessage = messages[assistantIndex]!;
    const history = messages.slice(0, userIndex);

    await requestAssistant({
      conversationId: activeConversation.id,
      message: userMessage.content,
      history,
      replaceAssistantId: assistantMessage.id,
    });
  }, [activeConversation, loading, requestAssistant]);

  const retryLast = useCallback(async () => {
    if (!pendingRetry || !activeConversation) return;
    await requestAssistant({
      conversationId: activeConversation.id,
      message: pendingRetry.message,
      history: pendingRetry.history,
      replaceAssistantId: pendingRetry.replaceAssistantId,
    });
  }, [activeConversation, pendingRetry, requestAssistant]);

  function startNewConversation() {
    stopRequest();
    const created = createConversation();
    setConversationsStore([created, ...getConversationsSnapshot()]);
    setActiveId(created.id);
    setInput("");
    setError(null);
    setPendingRetry(null);
  }

  function renameConversation(id: string, title: string) {
    const next = title.trim() || "Untitled conversation";
    updateConversation(id, (conversation) => ({
      ...conversation,
      title: next,
      updatedAt: new Date().toISOString(),
    }));
  }

  function deleteConversation(id: string) {
    const next = getConversationsSnapshot().filter((item) => item.id !== id);
    setConversationsStore(next);
    if (resolvedActiveId === id) {
      setActiveId(next[0]?.id ?? null);
    }
    setError(null);
    setPendingRetry(null);
  }

  const messages = activeConversation?.messages ?? [];
  const showWelcome = messages.length === 0 && !loading;
  const lastAssistantId = [...messages]
    .reverse()
    .find((item) => item.role === "assistant")?.id;

  return (
    <div>
      <PageHeader
        title="AI Chat"
        description="Multi-turn Gemini assistant with local conversation history, Markdown replies, and request controls."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary">{usageCount} AI requests</Badge>
            <Button variant="outline" onClick={startNewConversation}>
              <MessageSquarePlus className="h-4 w-4" />
              New conversation
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ConversationSidebar
          conversations={conversations}
          activeId={resolvedActiveId}
          onSelect={(id) => {
            stopRequest();
            setActiveId(id);
            setError(null);
            setPendingRetry(null);
          }}
          onRename={renameConversation}
          onDelete={deleteConversation}
        />

        <Card className="flex h-[min(70vh,760px)] flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
            {showWelcome ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="max-w-md">
                  <h2 className="text-lg font-semibold tracking-tight">
                    Start a conversation
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ask a question, paste code, or pick a suggested prompt.
                    Replies support Markdown and code blocks.
                  </p>
                </div>
                <div className="flex max-w-xl flex-wrap justify-center gap-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                showRegenerate={
                  !loading &&
                  message.id === lastAssistantId &&
                  Boolean(lastAssistantId)
                }
                onRegenerate={() => void regenerateLast()}
              />
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  NexaAI is thinking…
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                <p className="text-sm font-medium text-destructive">
                  {error.code === "QUOTA_EXCEEDED"
                    ? "Quota exhausted"
                    : error.code === "RATE_LIMIT"
                      ? "Rate limit reached"
                      : "Something went wrong"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => void retryLast()}>
                    Retry
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setError(null)}>
                    Dismiss
                  </Button>
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border p-4">
            {!showWelcome ? (
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestedPrompts.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInput(prompt)}
                    className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask NexaAI anything..."
                className="min-h-[88px] flex-1"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage(input);
                  }
                }}
              />
              {loading ? (
                <Button
                  variant="outline"
                  className="sm:mb-0.5"
                  onClick={stopRequest}
                >
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              ) : (
                <Button
                  className="sm:mb-0.5"
                  onClick={() => void sendMessage(input)}
                  disabled={!input.trim()}
                >
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="success">Gemini connected</Badge>
              <span className="text-xs text-muted-foreground">
                Enter to send · Shift+Enter for a new line
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
