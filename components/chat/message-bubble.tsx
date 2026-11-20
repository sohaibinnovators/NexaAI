"use client";

import { useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { MarkdownMessage } from "@/components/chat/markdown-message";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/lib/chat/types";
import { copyToClipboard, cn } from "@/lib/utils";

function formatTimestamp(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export function MessageBubble({
  message,
  onRegenerate,
  showRegenerate,
}: {
  message: ChatMessage;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  async function handleCopy() {
    const ok = await copyToClipboard(message.content);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[92%] sm:max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          ) : (
            <MarkdownMessage content={message.content} />
          )}
        </div>
        <div
          className={cn(
            "mt-1.5 flex flex-wrap items-center gap-1.5 px-1",
            isUser ? "justify-end" : "justify-start",
          )}
        >
          <span className="text-[11px] text-muted-foreground">
            {formatTimestamp(message.createdAt)}
          </span>
          {!isUser ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              {showRegenerate && onRegenerate ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={onRegenerate}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
