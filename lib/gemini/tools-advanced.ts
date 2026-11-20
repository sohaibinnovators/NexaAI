import { GeminiServiceError } from "@/lib/gemini/errors";
import {
  codeLanguages,
  codeTasks,
  coverLetterTones,
  emailPurposes,
  emailRevisions,
  emailTones,
  MAX_CODE_LENGTH,
  MAX_RESUME_FIELD_LENGTH,
  MAX_TOOL_TEXT_LENGTH,
  MAX_TOPIC_LENGTH,
  resumeSections,
} from "@/lib/tools/options";
import type {
  CodePayload,
  EmailPayload,
  ResumePayload,
  ToolApiSuccess,
} from "@/lib/tools/types";

function requireString(value: unknown, field: string) {
  if (typeof value !== "string") {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      `${field} must be a string.`,
      400,
    );
  }
  return value;
}

function requireOption<T extends string>(
  value: string,
  allowed: readonly T[],
  field: string,
): T {
  if (!allowed.includes(value as T)) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      `Invalid ${field} selection.`,
      400,
    );
  }
  return value as T;
}

function optionalTrimmed(
  value: unknown,
  field: string,
  maxLength: number,
): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const text = requireString(value, field).trim();
  if (!text) return undefined;
  if (text.length > maxLength) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      `${field} exceeds the ${maxLength} character limit.`,
      400,
    );
  }
  return text;
}

function labelFor(
  options: readonly { label: string; value: string }[],
  value: string,
) {
  return options.find((item) => item.value === value)?.label ?? value;
}

export function validateEmail(payload: Record<string, unknown>): EmailPayload {
  const purpose = requireOption(
    requireString(payload.purpose, "purpose").trim(),
    emailPurposes.map((item) => item.value),
    "email purpose",
  );
  const tone = requireOption(
    requireString(payload.tone, "tone").trim(),
    emailTones.map((item) => item.value),
    "tone",
  );
  const points = requireString(payload.points, "points").trim();
  if (!points) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Key points or instructions cannot be empty.",
      400,
    );
  }
  if (points.length > MAX_TOOL_TEXT_LENGTH) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      `Key points exceed the ${MAX_TOOL_TEXT_LENGTH} character limit.`,
      400,
    );
  }

  const recipient = optionalTrimmed(
    payload.recipient,
    "recipient",
    MAX_TOPIC_LENGTH,
  );
  const subjectHint = optionalTrimmed(
    payload.subjectHint,
    "subjectHint",
    MAX_TOPIC_LENGTH,
  );

  let revision: string | undefined;
  let draft: string | undefined;
  if (payload.revision !== undefined && payload.revision !== "") {
    revision = requireOption(
      requireString(payload.revision, "revision").trim(),
      emailRevisions.map((item) => item.value),
      "revision action",
    );
    draft = optionalTrimmed(payload.draft, "draft", MAX_TOOL_TEXT_LENGTH);
    if (!draft) {
      throw new GeminiServiceError(
        "VALIDATION_ERROR",
        "A draft email is required for revision actions.",
        400,
      );
    }
  }

  return {
    tool: "email",
    purpose,
    tone,
    points,
    recipient,
    subjectHint,
    revision,
    draft,
  };
}

export function validateCode(payload: Record<string, unknown>): CodePayload {
  const language = requireOption(
    requireString(payload.language, "language").trim(),
    codeLanguages.map((item) => item.value),
    "programming language",
  );
  const task = requireOption(
    requireString(payload.task, "task").trim(),
    codeTasks.map((item) => item.value),
    "task",
  );
  const instructions = requireString(payload.instructions, "instructions").trim();
  if (!instructions) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Instructions or problem description cannot be empty.",
      400,
    );
  }
  if (instructions.length > MAX_TOOL_TEXT_LENGTH) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      `Instructions exceed the ${MAX_TOOL_TEXT_LENGTH} character limit.`,
      400,
    );
  }

  const code = optionalTrimmed(payload.code, "code", MAX_CODE_LENGTH);
  if (task !== "generate" && !code) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Paste code to explain, debug, improve, or refactor.",
      400,
    );
  }

  return {
    tool: "code",
    language,
    task,
    instructions,
    code,
  };
}

export function validateResume(payload: Record<string, unknown>): ResumePayload {
  const modeRaw = requireString(payload.mode, "mode").trim();
  if (modeRaw !== "resume" && modeRaw !== "cover-letter") {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Mode must be resume or cover-letter.",
      400,
    );
  }

  if (modeRaw === "resume") {
    const fullName = optionalTrimmed(payload.fullName, "fullName", MAX_TOPIC_LENGTH);
    const professionalTitle = optionalTrimmed(
      payload.professionalTitle,
      "professionalTitle",
      MAX_TOPIC_LENGTH,
    );
    const contactInfo = optionalTrimmed(
      payload.contactInfo,
      "contactInfo",
      MAX_TOPIC_LENGTH,
    );
    const summary = optionalTrimmed(payload.summary, "summary", MAX_RESUME_FIELD_LENGTH);
    const experience = optionalTrimmed(
      payload.experience,
      "experience",
      MAX_RESUME_FIELD_LENGTH,
    );
    const education = optionalTrimmed(
      payload.education,
      "education",
      MAX_RESUME_FIELD_LENGTH,
    );
    const skills = optionalTrimmed(payload.skills, "skills", MAX_RESUME_FIELD_LENGTH);
    const projects = optionalTrimmed(
      payload.projects,
      "projects",
      MAX_RESUME_FIELD_LENGTH,
    );
    const certifications = optionalTrimmed(
      payload.certifications,
      "certifications",
      MAX_RESUME_FIELD_LENGTH,
    );

    if (!fullName && !professionalTitle && !experience && !skills && !summary) {
      throw new GeminiServiceError(
        "VALIDATION_ERROR",
        "Provide at least a name, title, summary, experience, or skills.",
        400,
      );
    }

    let sectionRewrite: string | undefined;
    let draft: string | undefined;
    if (payload.sectionRewrite !== undefined && payload.sectionRewrite !== "") {
      sectionRewrite = requireOption(
        requireString(payload.sectionRewrite, "sectionRewrite").trim(),
        resumeSections.map((item) => item.value),
        "section rewrite",
      );
      draft = optionalTrimmed(payload.draft, "draft", MAX_TOOL_TEXT_LENGTH);
      if (!draft) {
        throw new GeminiServiceError(
          "VALIDATION_ERROR",
          "A generated draft is required to rewrite a section.",
          400,
        );
      }
    }

    return {
      tool: "resume",
      mode: "resume",
      fullName,
      professionalTitle,
      contactInfo,
      summary,
      experience,
      education,
      skills,
      projects,
      certifications,
      sectionRewrite,
      draft,
    };
  }

  const jobTitle = requireString(payload.jobTitle, "jobTitle").trim();
  if (!jobTitle) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Job title cannot be empty.",
      400,
    );
  }
  if (jobTitle.length > MAX_TOPIC_LENGTH) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      `Job title exceeds the ${MAX_TOPIC_LENGTH} character limit.`,
      400,
    );
  }

  const companyName = requireString(payload.companyName, "companyName").trim();
  if (!companyName) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Company name cannot be empty.",
      400,
    );
  }

  const candidateBackground = requireString(
    payload.candidateBackground,
    "candidateBackground",
  ).trim();
  if (!candidateBackground) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Candidate experience and skills cannot be empty.",
      400,
    );
  }
  if (candidateBackground.length > MAX_RESUME_FIELD_LENGTH) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      `Candidate background exceeds the ${MAX_RESUME_FIELD_LENGTH} character limit.`,
      400,
    );
  }

  const tone = requireOption(
    requireString(payload.tone ?? "professional", "tone").trim(),
    coverLetterTones.map((item) => item.value),
    "tone",
  );

  return {
    tool: "resume",
    mode: "cover-letter",
    jobTitle,
    companyName,
    jobDescription: optionalTrimmed(
      payload.jobDescription,
      "jobDescription",
      MAX_RESUME_FIELD_LENGTH,
    ),
    candidateBackground,
    achievements: optionalTrimmed(
      payload.achievements,
      "achievements",
      MAX_RESUME_FIELD_LENGTH,
    ),
    additionalInstructions: optionalTrimmed(
      payload.additionalInstructions,
      "additionalInstructions",
      MAX_RESUME_FIELD_LENGTH,
    ),
    tone,
  };
}

export function buildEmailPrompt(input: EmailPayload) {
  const purposeLabel = labelFor(emailPurposes, input.purpose);
  const toneLabel = labelFor(emailTones, input.tone);

  if (input.revision && input.draft) {
    const revisionLabel = labelFor(emailRevisions, input.revision);
    return [
      `${revisionLabel} the following email while keeping it natural and relevant.`,
      `Original purpose: ${purposeLabel}.`,
      `Tone: ${toneLabel}.`,
      input.recipient ? `Audience: ${input.recipient}` : null,
      `Key points to preserve: ${input.points}`,
      "Respond in exactly this format:",
      "SUBJECT: <subject line>",
      "BODY:",
      "<email body>",
      "",
      "Current draft:",
      input.draft,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `Write a complete ${purposeLabel.toLowerCase()} email.`,
    `Tone: ${toneLabel}.`,
    input.recipient ? `Recipient / audience: ${input.recipient}` : null,
    input.subjectHint ? `Subject guidance: ${input.subjectHint}` : null,
    `Key points / instructions: ${input.points}`,
    "Make the email sound natural, specific, and professional. Avoid generic filler.",
    "Respond in exactly this format:",
    "SUBJECT: <subject line>",
    "BODY:",
    "<email body>",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildCodePrompt(input: CodePayload) {
  const languageLabel = labelFor(codeLanguages, input.language);
  const taskLabel = labelFor(codeTasks, input.task);

  const taskGuide =
    input.task === "explain"
      ? "Explain what the code does clearly. Use Markdown. Include short code citations where helpful."
      : input.task === "debug"
        ? "Find bugs and propose fixed code. Explain the issues briefly, then provide corrected code in fenced blocks."
        : input.task === "improve"
          ? "Improve readability, safety, and quality. Explain key changes, then provide improved code in fenced blocks."
          : input.task === "refactor"
            ? "Refactor the code for structure and maintainability without changing intended behavior. Explain changes, then provide refactored code."
            : "Generate clean, working code for the request. Explain briefly, then provide code in fenced blocks.";

  return [
    `Task: ${taskLabel}`,
    `Language: ${languageLabel}`,
    `Instructions: ${input.instructions}`,
    taskGuide,
    "Never execute code. Do not claim you ran it.",
    "Preserve indentation and formatting in code fences.",
    input.code ? `Code:\n\`\`\`${input.language}\n${input.code}\n\`\`\`` : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildResumePrompt(input: ResumePayload) {
  if (input.mode === "cover-letter") {
    const toneLabel = labelFor(coverLetterTones, input.tone ?? "professional");
    return [
      `Write a tailored cover letter for the role of ${input.jobTitle} at ${input.companyName}.`,
      `Tone: ${toneLabel}.`,
      `Candidate experience and skills:\n${input.candidateBackground}`,
      input.jobDescription ? `Job description:\n${input.jobDescription}` : null,
      input.achievements ? `Relevant projects / achievements:\n${input.achievements}` : null,
      input.additionalInstructions
        ? `Additional instructions:\n${input.additionalInstructions}`
        : null,
      "CRITICAL: Use only information supplied by the user. Never invent qualifications, employers, degrees, certifications, or achievements.",
      "If information is missing, write an honest draft without unsupported claims.",
      "Return the cover letter only.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (input.sectionRewrite && input.draft) {
    const sectionLabel = labelFor(resumeSections, input.sectionRewrite);
    return [
      `Improve/rewrite the ${sectionLabel} section of this resume.`,
      "Keep the rest of the resume intact unless the section is the full resume.",
      "CRITICAL: Use only supplied facts. Never invent experience or credentials.",
      "Return the full updated resume text.",
      `User-provided facts:\n${JSON.stringify(
        {
          fullName: input.fullName,
          professionalTitle: input.professionalTitle,
          contactInfo: input.contactInfo,
          summary: input.summary,
          experience: input.experience,
          education: input.education,
          skills: input.skills,
          projects: input.projects,
          certifications: input.certifications,
        },
        null,
        2,
      )}`,
      `Current draft:\n${input.draft}`,
    ].join("\n\n");
  }

  return [
    "Create a professionally structured resume from the supplied information only.",
    "Use clear section headings such as Summary, Experience, Education, Skills, Projects, and Certifications when data exists.",
    "CRITICAL: Never invent qualifications, degrees, employment history, certifications, or achievements.",
    "If important information is missing, produce an honest draft and leave gaps rather than fabricating details.",
    "Return plain text suitable for copying.",
    `Provided information:\n${JSON.stringify(
      {
        fullName: input.fullName,
        professionalTitle: input.professionalTitle,
        contactInfo: input.contactInfo,
        summary: input.summary,
        experience: input.experience,
        education: input.education,
        skills: input.skills,
        projects: input.projects,
        certifications: input.certifications,
      },
      null,
      2,
    )}`,
  ].join("\n\n");
}

export function parseEmailResponse(raw: string): Pick<
  ToolApiSuccess,
  "result" | "subject" | "body"
> {
  const subjectMatch = raw.match(/SUBJECT:\s*(.+)/i);
  const bodyMatch = raw.match(/BODY:\s*([\s\S]*)/i);

  const subject = subjectMatch?.[1]?.trim();
  const body = bodyMatch?.[1]?.trim();

  if (subject || body) {
    const composed = [
      subject ? `Subject: ${subject}` : null,
      body ?? "",
    ]
      .filter((part) => part !== null)
      .join("\n\n")
      .trim();

    return {
      result: composed || raw.trim(),
      subject,
      body,
    };
  }

  return { result: raw.trim() };
}

export const ADVANCED_SYSTEM_PROMPTS = {
  email:
    "You are NexaAI Email Assistant. Write natural, relevant emails with a clear subject and body. Avoid generic templates, empty flattery, and unsupported claims. Prefer concrete next steps. Follow the requested output format exactly.",
  code: "You are NexaAI Code Assistant. Help with explanation, debugging, improvement, refactoring, and generation. Never execute code or claim you ran it. Prefer Markdown with fenced code blocks, preserve indentation, and call out assumptions briefly.",
  resume:
    "You are NexaAI Resume & Cover Letter Builder. Use only user-supplied information. Never invent credentials, employers, degrees, metrics, or achievements. Prefer honest, professional drafts and clearly mark missing sections instead of fabricating them.",
} as const;
