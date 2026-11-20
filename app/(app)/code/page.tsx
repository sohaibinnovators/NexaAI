"use client";

import { useState } from "react";
import { Code2, Loader2, Square } from "lucide-react";
import { MarkdownMessage } from "@/components/chat/markdown-message";
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
import { codeLanguages, codeTasks, MAX_CODE_LENGTH } from "@/lib/tools/options";

export default function CodePage() {
  const { toast } = useToast();
  const {
    loading,
    error,
    result,
    generate,
    regenerate,
    clearOutput,
    stop,
    canRegenerate,
  } = useToolGeneration();

  const [language, setLanguage] = useState("typescript");
  const [task, setTask] = useState("explain");
  const [instructions, setInstructions] = useState("");
  const [code, setCode] = useState("");

  const needsCode = task !== "generate";

  async function handleRun() {
    if (!instructions.trim() || loading) return;
    if (needsCode && !code.trim()) {
      toast({
        title: "Code required",
        description: "Paste code for this task, or switch to Generate Code.",
        tone: "default",
      });
      return;
    }

    await generate({
      tool: "code",
      language,
      task,
      instructions: instructions.trim(),
      code: code.trim() || undefined,
    });
  }

  return (
    <div>
      <PageHeader
        title="Code Assistant"
        description="Explain, debug, improve, refactor, or generate code with Gemini. Code is never executed."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ToolPanel title="Request">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code-lang">Programming language</Label>
                <Select
                  id="code-lang"
                  options={[...codeLanguages]}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code-task">Task</Label>
                <Select
                  id="code-task"
                  options={[...codeTasks]}
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code-instructions">Instructions / problem description</Label>
              <Textarea
                id="code-instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Describe what you need help with..."
                className="min-h-[100px]"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="code-input">
                  {needsCode ? "Code input" : "Starter code (optional)"}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {code.length}/{MAX_CODE_LENGTH}
                </span>
              </div>
              <Textarea
                id="code-input"
                value={code}
                onChange={(e) => setCode(e.target.value.slice(0, MAX_CODE_LENGTH))}
                placeholder={
                  needsCode
                    ? "Paste code here. It will not be executed."
                    : "Optional starter snippet..."
                }
                className="min-h-[240px] font-mono text-[13px]"
                disabled={loading}
                spellCheck={false}
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
                  onClick={() => void handleRun()}
                  disabled={!instructions.trim() || (needsCode && !code.trim())}
                >
                  <Code2 className="h-4 w-4" />
                  Run assistant
                </Button>
              )}
            </div>
          </div>
        </ToolPanel>

        <ToolPanel
          title="Output"
          description="Markdown response with formatted code blocks"
          actions={
            <OutputActions
              value={result}
              onClear={clearOutput}
              onRegenerate={() => void regenerate()}
              regenerateDisabled={loading || !canRegenerate}
              onCopied={() =>
                toast({ title: "Response copied", tone: "success" })
              }
            />
          }
        >
          <ToolStatus
            loading={loading}
            error={error}
            empty={!result && !loading && !error}
            emptyMessage="Assistant output will appear here."
            onRetry={() => void regenerate()}
          />
          {loading && !result ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing…
            </div>
          ) : (
            <div className="min-h-[360px] overflow-x-auto rounded-lg border border-border bg-muted/30 p-4">
              {result ? (
                <MarkdownMessage content={result} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Output will appear here.
                </p>
              )}
            </div>
          )}
        </ToolPanel>
      </div>
    </div>
  );
}
