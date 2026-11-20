"use client";

import { useState } from "react";
import { Loader2, SpellCheck, Square } from "lucide-react";
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
import { grammarTones, MAX_TOOL_TEXT_LENGTH } from "@/lib/tools/options";

export default function GrammarPage() {
  const { toast } = useToast();
  const {
    loading,
    error,
    result,
    explanation,
    setResult,
    generate,
    regenerate,
    clearOutput,
    stop,
    canRegenerate,
  } = useToolGeneration();

  const [input, setInput] = useState("");
  const [tone, setTone] = useState("original");

  async function handleCheck() {
    if (!input.trim() || loading) return;
    await generate({
      tool: "grammar",
      text: input.trim(),
      tone,
    });
  }

  function handleClearAll() {
    setInput("");
    clearOutput();
  }

  return (
    <div>
      <PageHeader
        title="Grammar Checker"
        description="Fix grammar and spelling, improve clarity, and optionally rewrite tone with Gemini."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ToolPanel title="Original text">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="grammar-input">Text to check</Label>
                <span className="text-xs text-muted-foreground">
                  {input.length}/{MAX_TOOL_TEXT_LENGTH}
                </span>
              </div>
              <Textarea
                id="grammar-input"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_TOOL_TEXT_LENGTH))}
                placeholder="Paste the text you want to improve..."
                className="min-h-[280px]"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rewrite-tone">Rewrite tone (optional)</Label>
              <Select
                id="rewrite-tone"
                options={[...grammarTones]}
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {loading ? (
                <Button variant="outline" onClick={stop}>
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              ) : (
                <Button onClick={() => void handleCheck()} disabled={!input.trim()}>
                  <SpellCheck className="h-4 w-4" />
                  Check grammar
                </Button>
              )}
              <Button variant="ghost" onClick={handleClearAll} disabled={loading}>
                Clear
              </Button>
            </div>
          </div>
        </ToolPanel>

        <ToolPanel
          title="Corrected text"
          actions={
            <OutputActions
              value={result}
              onClear={clearOutput}
              onRegenerate={() => void regenerate()}
              regenerateDisabled={loading || !canRegenerate}
              onCopied={() =>
                toast({ title: "Corrected text copied", tone: "success" })
              }
            />
          }
        >
          <ToolStatus
            loading={loading}
            error={error}
            empty={!result && !loading && !error}
            emptyMessage="Corrected text will appear here."
            onRetry={() => void regenerate()}
          />
          {loading && !result ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking…
            </div>
          ) : (
            <Textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Corrected text will appear here."
              className="min-h-[220px]"
            />
          )}

          {explanation ? (
            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
              <p className="mb-2 text-sm font-medium">Important corrections</p>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
                {explanation}
              </pre>
            </div>
          ) : null}
        </ToolPanel>
      </div>
    </div>
  );
}
