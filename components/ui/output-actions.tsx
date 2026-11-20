"use client";

import { useState } from "react";
import { Check, Copy, Eraser, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";

export function OutputActions({
  value,
  onClear,
  onRegenerate,
  onCopied,
  regenerateDisabled,
  clearDisabled,
}: {
  value: string;
  onClear?: () => void;
  onRegenerate?: () => void;
  onCopied?: () => void;
  regenerateDisabled?: boolean;
  clearDisabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(value);
    if (!ok) return;
    setCopied(true);
    onCopied?.();
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={handleCopy} disabled={!value}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      {onRegenerate ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={regenerateDisabled}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate
        </Button>
      ) : null}
      {onClear ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={clearDisabled ?? !value}
        >
          <Eraser className="h-3.5 w-3.5" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
