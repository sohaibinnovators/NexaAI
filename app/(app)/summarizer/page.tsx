"use client";

import { useState } from "react";
import { FileText, Loader2, Square } from "lucide-react";
import { ToolStatus } from "@/components/tools/tool-status";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OutputActions } from "@/components/ui/output-actions";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToolPanel } from "@/components/ui/tool-panel";
import { useToast } from "@/components/ui/toast";
import { useToolGeneration } from "@/hooks/use-tool-generation";
import { usePreferences } from "@/hooks/use-workspace";
import {
  MAX_TOOL_TEXT_LENGTH,
  MIN_SUMMARIZER_TEXT_LENGTH,
  summaryLengths,
} from "@/lib/tools/options";

export default function SummarizerPage() {
  const { toast } = useToast();
  const preferences = usePreferences();
  const {
    loading,
    error,
    result,
    setResult,
    generate,
    regenerate,
    clearOutput,
    stop,
    canRegenerate,
  } = useToolGeneration();

  const [text, setText] = useState("");
  const [length, setLength] = useState(preferences.preferredOutputLength || "medium");

  async function handleSummarize() {
    if (!text.trim() || loading) return;
    await generate({
      tool: "summarizer",
      text: text.trim(),
      length,
    });
  }

  return (
    <div>
      <PageHeader
        title="Document Summarizer"
        description="Paste document text, choose a summary length, and generate a clear Gemini summary."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ToolPanel title="Input" description="Paste the content you want summarized.">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="doc-text">Document text</Label>
                <span className="text-xs text-muted-foreground">
                  {text.length}/{MAX_TOOL_TEXT_LENGTH}
                </span>
              </div>
              <Textarea
                id="doc-text"
                placeholder="Paste the content you want summarized..."
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_TOOL_TEXT_LENGTH))}
                className="min-h-[280px]"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Minimum {MIN_SUMMARIZER_TEXT_LENGTH} characters. File upload will arrive in a
                later phase.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary-length">Summary length</Label>
              <Select
                id="summary-length"
                options={[...summaryLengths]}
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {loading ? (
                <Button variant="outline" onClick={stop}>
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              ) : (
                <Button
                  onClick={() => void handleSummarize()}
                  disabled={text.trim().length < MIN_SUMMARIZER_TEXT_LENGTH}
                >
                  <FileText className="h-4 w-4" />
                  Summarize
                </Button>
              )}
            </div>
          </div>
        </ToolPanel>

        <ToolPanel
          title="Results"
          description="Summary output appears here."
          actions={
            <OutputActions
              value={result}
              onClear={clearOutput}
              onRegenerate={() => void regenerate()}
              regenerateDisabled={loading || !canRegenerate}
              onCopied={() =>
                toast({ title: "Summary copied", tone: "success" })
              }
            />
          }
        >
          <ToolStatus
            loading={loading}
            error={error}
            empty={!result && !loading && !error}
            emptyMessage="Your summary will appear here."
            onRetry={() => void regenerate()}
          />
          {loading && !result ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Summarizing…
            </div>
          ) : (
            <Textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Your summary will appear here."
              className="min-h-[360px]"
            />
          )}
        </ToolPanel>
      </div>
    </div>
  );
}
