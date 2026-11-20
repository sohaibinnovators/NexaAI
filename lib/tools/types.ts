import type { ChatApiErrorCode } from "@/lib/chat/types";

export type ToolId =
  | "writer"
  | "summarizer"
  | "translator"
  | "grammar"
  | "email"
  | "code"
  | "resume";

export type WriterPayload = {
  tool: "writer";
  contentType: string;
  topic: string;
  tone: string;
  language: string;
  keywords?: string;
  context?: string;
};

export type SummarizerPayload = {
  tool: "summarizer";
  text: string;
  length: string;
};

export type TranslatorPayload = {
  tool: "translator";
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
};

export type GrammarPayload = {
  tool: "grammar";
  text: string;
  tone?: string;
};

export type EmailPayload = {
  tool: "email";
  purpose: string;
  tone: string;
  points: string;
  recipient?: string;
  subjectHint?: string;
  revision?: string;
  draft?: string;
};

export type CodePayload = {
  tool: "code";
  language: string;
  task: string;
  instructions: string;
  code?: string;
};

export type ResumePayload = {
  tool: "resume";
  mode: "resume" | "cover-letter";
  // Resume fields
  fullName?: string;
  professionalTitle?: string;
  contactInfo?: string;
  summary?: string;
  experience?: string;
  education?: string;
  skills?: string;
  projects?: string;
  certifications?: string;
  sectionRewrite?: string;
  draft?: string;
  // Cover letter fields
  jobTitle?: string;
  companyName?: string;
  jobDescription?: string;
  candidateBackground?: string;
  achievements?: string;
  additionalInstructions?: string;
  tone?: string;
};

export type ToolRequestPayload =
  | WriterPayload
  | SummarizerPayload
  | TranslatorPayload
  | GrammarPayload
  | EmailPayload
  | CodePayload
  | ResumePayload;

export type ToolApiSuccess = {
  ok: true;
  result: string;
  model: string;
  explanation?: string;
  subject?: string;
  body?: string;
};

export type ToolApiError = {
  ok: false;
  error: {
    code: ChatApiErrorCode;
    message: string;
  };
};

export type ToolApiResponse = ToolApiSuccess | ToolApiError;
