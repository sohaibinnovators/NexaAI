"use client";

import { useState } from "react";
import { ArrowLeftRight, Languages, Loader2, Square } from "lucide-react";
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
  sourceLanguages,
  translatorLanguages,
} from "@/lib/tools/options";

export default function TranslatorPage() {
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

  const [source, setSource] = useState("auto");
  const [target, setTarget] = useState(
    preferences.preferredTranslationTarget || "es",
  );
  const [input, setInput] = useState("");

  function swapLanguages() {
    if (source === "auto") {
      toast({
        title: "Cannot swap Auto Detect",
        description: "Choose a specific source language before swapping.",
        tone: "default",
      });
      return;
    }
    setSource(target);
    setTarget(source);
    setInput(result);
    setResult(input);
  }

  async function handleTranslate() {
    if (!input.trim() || loading) return;
    await generate({
      tool: "translator",
      text: input.trim(),
      sourceLanguage: source,
      targetLanguage: target,
    });
  }

  function handleClear() {
    clearOutput();
    setInput("");
  }

  return (
    <div>
      <PageHeader
        title="Translator"
        description="Translate text with Auto Detect support and Gemini-powered accuracy."
      />

      <ToolPanel title="Translation workspace">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="source-lang">Source language</Label>
            <Select
              id="source-lang"
              options={[...sourceLanguages]}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="sm:mb-0.5"
            onClick={swapLanguages}
            aria-label="Swap languages"
            disabled={loading}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Swap
          </Button>
          <div className="flex-1 space-y-2">
            <Label htmlFor="target-lang">Target language</Label>
            <Select
              id="target-lang"
              options={[...translatorLanguages]}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="source-text">Input</Label>
              <span className="text-xs text-muted-foreground">
                {input.length}/{MAX_TOOL_TEXT_LENGTH}
              </span>
            </div>
            <Textarea
              id="source-text"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_TOOL_TEXT_LENGTH))}
              placeholder="Enter text to translate..."
              className="min-h-[260px]"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="target-text">Output</Label>
              <OutputActions
                value={result}
                onClear={handleClear}
                onRegenerate={() => void regenerate()}
                regenerateDisabled={loading || !canRegenerate}
                onCopied={() =>
                  toast({ title: "Translation copied", tone: "success" })
                }
              />
            </div>
            <ToolStatus
              loading={loading}
              error={error}
              empty={!result && !loading && !error}
              emptyMessage="Translation will appear here."
              onRetry={() => void regenerate()}
            />
            {loading && !result ? (
              <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Translating…
              </div>
            ) : (
              <Textarea
                id="target-text"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="Translation will appear here."
                className="min-h-[260px]"
              />
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {loading ? (
            <Button variant="outline" onClick={stop}>
              <Square className="h-4 w-4" />
              Stop
            </Button>
          ) : (
            <Button onClick={() => void handleTranslate()} disabled={!input.trim()}>
              <Languages className="h-4 w-4" />
              Translate
            </Button>
          )}
          <Button variant="ghost" onClick={handleClear} disabled={loading}>
            Clear
          </Button>
        </div>
      </ToolPanel>
    </div>
  );
}
