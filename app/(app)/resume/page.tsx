"use client";

import { useState } from "react";
import { FileUser, Loader2, Square } from "lucide-react";
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
import {
  coverLetterTones,
  resumeSections,
} from "@/lib/tools/options";
import { cn } from "@/lib/utils";

export default function ResumePage() {
  const { toast } = useToast();
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

  const [mode, setMode] = useState<"resume" | "cover-letter">("resume");

  // Resume fields
  const [fullName, setFullName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [skills, setSkills] = useState("");
  const [projects, setProjects] = useState("");
  const [certifications, setCertifications] = useState("");
  const [sectionRewrite, setSectionRewrite] = useState("full");

  // Cover letter fields
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [candidateBackground, setCandidateBackground] = useState("");
  const [achievements, setAchievements] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [tone, setTone] = useState("professional");

  async function handleGenerate() {
    if (loading) return;

    if (mode === "resume") {
      await generate({
        tool: "resume",
        mode: "resume",
        fullName: fullName.trim() || undefined,
        professionalTitle: professionalTitle.trim() || undefined,
        contactInfo: contactInfo.trim() || undefined,
        summary: summary.trim() || undefined,
        experience: experience.trim() || undefined,
        education: education.trim() || undefined,
        skills: skills.trim() || undefined,
        projects: projects.trim() || undefined,
        certifications: certifications.trim() || undefined,
      });
      return;
    }

    await generate({
      tool: "resume",
      mode: "cover-letter",
      jobTitle: jobTitle.trim(),
      companyName: companyName.trim(),
      jobDescription: jobDescription.trim() || undefined,
      candidateBackground: candidateBackground.trim(),
      achievements: achievements.trim() || undefined,
      additionalInstructions: additionalInstructions.trim() || undefined,
      tone,
    });
  }

  async function handleSectionRewrite() {
    if (!result.trim() || loading || mode !== "resume") return;
    await generate({
      tool: "resume",
      mode: "resume",
      fullName: fullName.trim() || undefined,
      professionalTitle: professionalTitle.trim() || undefined,
      contactInfo: contactInfo.trim() || undefined,
      summary: summary.trim() || undefined,
      experience: experience.trim() || undefined,
      education: education.trim() || undefined,
      skills: skills.trim() || undefined,
      projects: projects.trim() || undefined,
      certifications: certifications.trim() || undefined,
      sectionRewrite,
      draft: result,
    });
  }

  const canGenerateResume =
    Boolean(
      fullName.trim() ||
        professionalTitle.trim() ||
        summary.trim() ||
        experience.trim() ||
        skills.trim(),
    );
  const canGenerateCoverLetter =
    Boolean(jobTitle.trim() && companyName.trim() && candidateBackground.trim());

  return (
    <div>
      <PageHeader
        title="Resume & Cover Letter Builder"
        description="Generate honest, professional documents from your details only—Gemini will not invent credentials."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant={mode === "resume" ? "primary" : "outline"}
          onClick={() => {
            setMode("resume");
            clearOutput();
          }}
        >
          Resume Builder
        </Button>
        <Button
          variant={mode === "cover-letter" ? "primary" : "outline"}
          onClick={() => {
            setMode("cover-letter");
            clearOutput();
          }}
        >
          Cover Letter Builder
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ToolPanel
          title={mode === "resume" ? "Resume details" : "Cover letter details"}
          description={
            mode === "resume"
              ? "Fill in what you know. Leave gaps rather than inventing facts."
              : "Provide the role, company, and your real experience."
          }
        >
          {mode === "resume" ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Professional title</Label>
                  <Input
                    id="title"
                    value={professionalTitle}
                    onChange={(e) => setProfessionalTitle(e.target.value)}
                    placeholder="e.g. Product Designer"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact information (optional)</Label>
                <Input
                  id="contact"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Email, phone, location, LinkedIn"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Professional summary / objective</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="min-h-[80px]"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Work experience</Label>
                <Textarea
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Role, company, dates, responsibilities, outcomes"
                  className="min-h-[110px]"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Textarea
                  id="education"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="min-h-[70px]"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="min-h-[70px]"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projects">Projects</Label>
                <Textarea
                  id="projects"
                  value={projects}
                  onChange={(e) => setProjects(e.target.value)}
                  className="min-h-[70px]"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications (optional)</Label>
                <Textarea
                  id="certifications"
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  className="min-h-[70px]"
                  disabled={loading}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="job-title">Job title</Label>
                  <Input
                    id="job-title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company name</Label>
                  <Input
                    id="company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-description">Job description (optional)</Label>
                <Textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[100px]"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="background">Candidate experience and skills</Label>
                <Textarea
                  id="background"
                  value={candidateBackground}
                  onChange={(e) => setCandidateBackground(e.target.value)}
                  className="min-h-[120px]"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="achievements">Relevant projects or achievements</Label>
                <Textarea
                  id="achievements"
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  className="min-h-[90px]"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="extra">Additional instructions</Label>
                <Textarea
                  id="extra"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  className="min-h-[70px]"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cover-tone">Tone</Label>
                <Select
                  id="cover-tone"
                  options={[...coverLetterTones]}
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {loading ? (
              <Button variant="outline" onClick={stop}>
                <Square className="h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={() => void handleGenerate()}
                disabled={
                  mode === "resume" ? !canGenerateResume : !canGenerateCoverLetter
                }
              >
                <FileUser className="h-4 w-4" />
                {mode === "resume" ? "Generate resume" : "Generate cover letter"}
              </Button>
            )}
          </div>
        </ToolPanel>

        <ToolPanel
          title={mode === "resume" ? "Resume preview" : "Cover letter preview"}
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
            emptyMessage="Generated content will appear here."
            onRetry={() => void regenerate()}
          />

          {mode === "resume" && result ? (
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor="section-rewrite">Improve / rewrite section</Label>
                <Select
                  id="section-rewrite"
                  options={[...resumeSections]}
                  value={sectionRewrite}
                  onChange={(e) => setSectionRewrite(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => void handleSectionRewrite()}
              >
                Rewrite section
              </Button>
            </div>
          ) : null}

          {loading && !result ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </div>
          ) : (
            <Textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Generated content will appear here."
              className={cn("min-h-[420px] leading-relaxed")}
            />
          )}
        </ToolPanel>
      </div>
    </div>
  );
}
