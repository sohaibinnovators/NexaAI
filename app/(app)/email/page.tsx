"use client";

import { useState } from "react";
import { Loader2, Mail, Square } from "lucide-react";
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
  emailPurposes,
  emailRevisions,
  emailTones,
} from "@/lib/tools/options";
import { copyToClipboard } from "@/lib/utils";

export default function EmailPage() {
  const { toast } = useToast();
  const preferences = usePreferences();
  const {
    loading,
    error,
    result,
    subject,
    body,
    setResult,
    setSubject,
    setBody,
    generate,
    regenerate,
    clearOutput,
    stop,
    canRegenerate,
  } = useToolGeneration();

  const [purpose, setPurpose] = useState("follow-up");
  const [recipient, setRecipient] = useState("");
  const [subjectHint, setSubjectHint] = useState("");
  const [points, setPoints] = useState("");
  const [tone, setTone] = useState(preferences.defaultEmailTone || "professional");

  async function handleGenerate() {
    if (!points.trim() || loading) return;
    await generate({
      tool: "email",
      purpose,
      tone,
      points: points.trim(),
      recipient: recipient.trim() || undefined,
      subjectHint: subjectHint.trim() || undefined,
    });
  }

  async function handleRevision(revision: string) {
    if (!result.trim() || loading) return;
    await generate({
      tool: "email",
      purpose,
      tone,
      points: points.trim() || "Preserve the intent of the current draft.",
      recipient: recipient.trim() || undefined,
      subjectHint: subjectHint.trim() || undefined,
      revision,
      draft: result,
    });
  }

  async function copyPart(label: string, value?: string | null) {
    if (!value?.trim()) {
      toast({ title: `No ${label.toLowerCase()} to copy`, tone: "default" });
      return;
    }
    const ok = await copyToClipboard(value);
    if (ok) toast({ title: `${label} copied`, tone: "success" });
  }

  return (
    <div>
      <PageHeader
        title="Email Assistant"
        description="Draft natural emails with purpose, tone, and revision controls powered by Gemini."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ToolPanel title="Email details">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Email purpose</Label>
              <Select
                id="purpose"
                options={[...emailPurposes]}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient / audience (optional)</Label>
              <Input
                id="recipient"
                placeholder="e.g. Hiring manager at Acme, design partner"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject-hint">Subject or topic</Label>
              <Input
                id="subject-hint"
                placeholder="e.g. Product demo follow-up"
                value={subjectHint}
                onChange={(e) => setSubjectHint(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Key points or instructions</Label>
              <Textarea
                id="points"
                placeholder="What should the email cover?"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="min-h-[140px]"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-tone">Tone</Label>
              <Select
                id="email-tone"
                options={[...emailTones]}
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
                <Button onClick={() => void handleGenerate()} disabled={!points.trim()}>
                  <Mail className="h-4 w-4" />
                  Generate email
                </Button>
              )}
            </div>
          </div>
        </ToolPanel>

        <ToolPanel
          title="Generated email"
          actions={
            <OutputActions
              value={result}
              onClear={clearOutput}
              onRegenerate={() => void regenerate()}
              regenerateDisabled={loading || !canRegenerate}
              onCopied={() =>
                toast({ title: "Email copied", tone: "success" })
              }
            />
          }
        >
          <ToolStatus
            loading={loading}
            error={error}
            empty={!result && !loading && !error}
            emptyMessage="Your email draft will appear here."
            onRetry={() => void regenerate()}
          />

          {result ? (
            <div className="mb-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => void copyPart("Subject", subject)}
                disabled={!subject}
              >
                Copy subject
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void copyPart("Body", body)}
                disabled={!body}
              >
                Copy body
              </Button>
              {emailRevisions.map((item) => (
                <Button
                  key={item.value}
                  size="sm"
                  variant="ghost"
                  disabled={loading || !result}
                  onClick={() => void handleRevision(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          ) : null}

          {loading && !result ? (
            <div className="flex min-h-[340px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Drafting email…
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="generated-subject">Subject</Label>
                <Input
                  id="generated-subject"
                  value={subject ?? ""}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setResult(
                      `Subject: ${e.target.value}\n\n${body ?? ""}`.trim(),
                    );
                  }}
                  placeholder="Subject line"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="generated-body">Body</Label>
                <Textarea
                  id="generated-body"
                  value={body ?? result}
                  onChange={(e) => {
                    setBody(e.target.value);
                    setResult(
                      `Subject: ${subject ?? ""}\n\n${e.target.value}`.trim(),
                    );
                  }}
                  placeholder="Email body"
                  className="min-h-[260px]"
                />
              </div>
            </div>
          )}
        </ToolPanel>
      </div>
    </div>
  );
}
