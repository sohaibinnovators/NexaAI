"use client";

import { useState } from "react";
import { Loader2, PenLine, Square } from "lucide-react";
import { ToolStatus } from "@/components/tools/tool-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  writerContentTypes,
  writerLanguages,
  writerTones,
} from "@/lib/tools/options";

export default function WriterPage() {
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

  const [contentType, setContentType] = useState("blog");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState(preferences.defaultWritingTone || "professional");
  const [language, setLanguage] = useState("en");

  async function handleGenerate() {
    if (!topic.trim() || loading) return;
    await generate({
      tool: "writer",
      contentType,
      topic: topic.trim(),
      tone,
      language,
      keywords: keywords.trim() || undefined,
      context: context.trim() || undefined,
    });
  }

  return (
    <div>
      <PageHeader
        title="AI Writer"
        description="Generate blogs, articles, social posts, and more with Gemini-powered drafting."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ToolPanel title="Writing controls" description="Configure what you want to create.">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content-type">Writing type</Label>
              <Select
                id="content-type"
                options={[...writerContentTypes]}
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic or instructions</Label>
              <Input
                id="topic"
                placeholder="e.g. Introducing NexaAI to design teams"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (optional)</Label>
              <Input
                id="keywords"
                placeholder="e.g. productivity, AI workspace, collaboration"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="context">Additional context (optional)</Label>
              <Textarea
                id="context"
                placeholder="Audience, product details, constraints..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="min-h-[100px]"
                disabled={loading}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select
                  id="tone"
                  options={[...writerTones]}
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  id="language"
                  options={[...writerLanguages]}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {loading ? (
                <Button variant="outline" onClick={stop}>
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              ) : (
                <Button onClick={() => void handleGenerate()} disabled={!topic.trim()}>
                  <PenLine className="h-4 w-4" />
                  Generate
                </Button>
              )}
            </div>
          </div>
        </ToolPanel>

        <ToolPanel
          title="Generated content"
          description="Preview, regenerate, copy, or clear the draft."
          actions={
            <OutputActions
              value={result}
              onClear={clearOutput}
              onRegenerate={() => void regenerate()}
              regenerateDisabled={loading || !canRegenerate}
              onCopied={() =>
                toast({ title: "Copied to clipboard", tone: "success" })
              }
            />
          }
        >
          <ToolStatus
            loading={loading}
            error={error}
            empty={!result && !loading && !error}
            emptyMessage="Your generated content will appear here."
            onRetry={() => void regenerate()}
          />
          {loading && !result ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Writing…
            </div>
          ) : (
            <Textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Your generated content will appear here."
              className="min-h-[320px]"
            />
          )}
        </ToolPanel>
      </div>
    </div>
  );
}
