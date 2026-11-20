import { generateText } from "@/lib/gemini/generate";
import { GeminiServiceError } from "@/lib/gemini/errors";
import {
  ADVANCED_SYSTEM_PROMPTS,
  buildCodePrompt,
  buildEmailPrompt,
  buildResumePrompt,
  parseEmailResponse,
  validateCode,
  validateEmail,
  validateResume,
} from "@/lib/gemini/tools-advanced";
import {
  grammarTones,
  MAX_CONTEXT_LENGTH,
  MAX_KEYWORDS_LENGTH,
  MAX_TOOL_TEXT_LENGTH,
  MAX_TOPIC_LENGTH,
  MIN_SUMMARIZER_TEXT_LENGTH,
  sourceLanguages,
  summaryLengths,
  translatorLanguages,
  writerContentTypes,
  writerLanguages,
  writerTones,
} from "@/lib/tools/options";
import type {
  GrammarPayload,
  SummarizerPayload,
  ToolApiSuccess,
  ToolRequestPayload,
  TranslatorPayload,
  WriterPayload,
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

function labelFor(
  options: readonly { label: string; value: string }[],
  value: string,
) {
  return options.find((item) => item.value === value)?.label ?? value;
}

function validateWriter(payload: Record<string, unknown>): WriterPayload {
  const contentType = requireOption(
    requireString(payload.contentType, "contentType").trim(),
    writerContentTypes.map((item) => item.value),
    "content type",
  );
  const topic = requireString(payload.topic, "topic").trim();
  if (!topic) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Topic or instructions cannot be empty.",
      400,
    );
  }
  if (topic.length > MAX_TOPIC_LENGTH) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      `Topic exceeds the ${MAX_TOPIC_LENGTH} character limit.`,
      400,
    );
  }

  const tone = requireOption(
    requireString(payload.tone, "tone").trim(),
    writerTones.map((item) => item.value),
    "tone",
  );
  const language = requireOption(
    requireString(payload.language, "language").trim(),
    writerLanguages.map((item) => item.value),
    "language",
  );

  const keywords =
    payload.keywords === undefined
      ? undefined
      : requireString(payload.keywords, "keywords").trim();
  if (keywords && keywords.length > MAX_KEYWORDS_LENGTH) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      `Keywords exceed the ${MAX_KEYWORDS_LENGTH} character limit.`,
      400,
    );
  }

  const context =
    payload.context === undefined
      ? undefined
      : requireString(payload.context, "context").trim();
  if (context && context.length > MAX_CONTEXT_LENGTH) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      `Context exceeds the ${MAX_CONTEXT_LENGTH} character limit.`,
      400,
    );
  }

  return {
    tool: "writer",
    contentType,
    topic,
    tone,
    language,
    keywords: keywords || undefined,
    context: context || undefined,
  };
}

function validateSummarizer(payload: Record<string, unknown>): SummarizerPayload {
  const text = requireString(payload.text, "text").trim();
  if (!text) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Document text cannot be empty.",
      400,
    );
  }
  if (text.length < MIN_SUMMARIZER_TEXT_LENGTH) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      `Please paste at least ${MIN_SUMMARIZER_TEXT_LENGTH} characters to summarize.`,
      400,
    );
  }
  if (text.length > MAX_TOOL_TEXT_LENGTH) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      `Text exceeds the ${MAX_TOOL_TEXT_LENGTH} character limit.`,
      400,
    );
  }

  const length = requireOption(
    requireString(payload.length, "length").trim(),
    summaryLengths.map((item) => item.value),
    "summary length",
  );

  return { tool: "summarizer", text, length };
}

function validateTranslator(payload: Record<string, unknown>): TranslatorPayload {
  const text = requireString(payload.text, "text").trim();
  if (!text) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Text to translate cannot be empty.",
      400,
    );
  }
  if (text.length > MAX_TOOL_TEXT_LENGTH) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      `Text exceeds the ${MAX_TOOL_TEXT_LENGTH} character limit.`,
      400,
    );
  }

  const sourceLanguage = requireOption(
    requireString(payload.sourceLanguage, "sourceLanguage").trim(),
    sourceLanguages.map((item) => item.value),
    "source language",
  );
  const targetLanguage = requireOption(
    requireString(payload.targetLanguage, "targetLanguage").trim(),
    translatorLanguages.map((item) => item.value),
    "target language",
  );

  if (sourceLanguage !== "auto" && sourceLanguage === targetLanguage) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Source and target languages must be different.",
      400,
    );
  }

  return { tool: "translator", text, sourceLanguage, targetLanguage };
}

function validateGrammar(payload: Record<string, unknown>): GrammarPayload {
  const text = requireString(payload.text, "text").trim();
  if (!text) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Text to check cannot be empty.",
      400,
    );
  }
  if (text.length > MAX_TOOL_TEXT_LENGTH) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      `Text exceeds the ${MAX_TOOL_TEXT_LENGTH} character limit.`,
      400,
    );
  }

  const toneRaw =
    payload.tone === undefined
      ? "original"
      : requireString(payload.tone, "tone").trim();
  const tone = requireOption(
    toneRaw,
    grammarTones.map((item) => item.value),
    "rewrite tone",
  );

  return { tool: "grammar", text, tone };
}

export function validateToolPayload(body: unknown): ToolRequestPayload {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Unsupported request payload.",
      400,
    );
  }

  const payload = body as Record<string, unknown>;
  if ("stream" in payload || "tools" in payload || "system" in payload) {
    throw new GeminiServiceError(
      "VALIDATION_ERROR",
      "Unsupported fields in request payload.",
      400,
    );
  }

  const tool = requireString(payload.tool, "tool").trim();
  switch (tool) {
    case "writer":
      return validateWriter(payload);
    case "summarizer":
      return validateSummarizer(payload);
    case "translator":
      return validateTranslator(payload);
    case "grammar":
      return validateGrammar(payload);
    case "email":
      return validateEmail(payload);
    case "code":
      return validateCode(payload);
    case "resume":
      return validateResume(payload);
    default:
      throw new GeminiServiceError(
        "VALIDATION_ERROR",
        "Unsupported tool requested.",
        400,
      );
  }
}

function buildWriterPrompt(input: WriterPayload) {
  const typeLabel = labelFor(writerContentTypes, input.contentType);
  const toneLabel = labelFor(writerTones, input.tone);
  const languageLabel = labelFor(writerLanguages, input.language);

  return [
    `Write a ${typeLabel} in ${languageLabel}.`,
    `Tone: ${toneLabel}.`,
    `Topic / instructions: ${input.topic}`,
    input.keywords ? `Keywords to include naturally: ${input.keywords}` : null,
    input.context ? `Additional context: ${input.context}` : null,
    "Return only the finished content. Do not wrap it in markdown fences unless the content itself needs them.",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildSummarizerPrompt(input: SummarizerPayload) {
  const lengthGuidance =
    input.length === "short"
      ? "Write a short summary in 3-5 sentences."
      : input.length === "detailed"
        ? "Write a detailed summary with clear sections and key takeaways."
        : "Write a medium-length summary covering the main points clearly.";

  return [
    lengthGuidance,
    "Preserve meaning, remove fluff, and keep the summary readable.",
    "Document text:",
    input.text,
  ].join("\n\n");
}

function buildTranslatorPrompt(input: TranslatorPayload) {
  const sourceLabel = labelFor(sourceLanguages, input.sourceLanguage);
  const targetLabel = labelFor(translatorLanguages, input.targetLanguage);

  return [
    input.sourceLanguage === "auto"
      ? `Detect the source language and translate the text into ${targetLabel}.`
      : `Translate the following text from ${sourceLabel} to ${targetLabel}.`,
    "Preserve meaning, tone, and formatting where practical.",
    "Return only the translated text.",
    "Text:",
    input.text,
  ].join("\n\n");
}

function buildGrammarPrompt(input: GrammarPayload) {
  const toneLabel = labelFor(grammarTones, input.tone ?? "original");

  return [
    "Correct grammar, spelling, punctuation, and clarity.",
    `Rewrite tone preference: ${toneLabel}.`,
    "Respond in exactly this format:",
    "CORRECTED:",
    "<corrected text>",
    "",
    "EXPLANATION:",
    "<brief bullet points of the most important corrections>",
    "",
    "Text:",
    input.text,
  ].join("\n");
}

function parseGrammarResponse(raw: string) {
  const correctedMatch = raw.match(
    /CORRECTED:\s*([\s\S]*?)(?:\n\s*EXPLANATION:|$)/i,
  );
  const explanationMatch = raw.match(/EXPLANATION:\s*([\s\S]*)$/i);

  const result = (correctedMatch?.[1] ?? raw).trim();
  const explanation = explanationMatch?.[1]?.trim();

  return { result, explanation: explanation || undefined };
}

const SYSTEM_PROMPTS: Record<ToolRequestPayload["tool"], string> = {
  writer:
    "You are NexaAI Writer, a professional content assistant. Create polished, original writing that matches the requested type, tone, and language. Lead with useful specificity, avoid filler clichés, and do not invent facts, statistics, quotes, or product claims.",
  summarizer:
    "You are NexaAI Summarizer. Produce accurate, well-structured summaries from the provided text only. Prioritize key claims, decisions, and action items. Do not invent details that are not present.",
  translator:
    "You are NexaAI Translator. Provide faithful translations that preserve meaning, register, and tone. Keep proper nouns intact when appropriate. Return only the translation unless asked otherwise.",
  grammar:
    "You are NexaAI Grammar Checker & Rewriter. Improve correctness, clarity, and flow while respecting the requested tone. Keep the author's meaning. Follow the requested output format exactly.",
  email: ADVANCED_SYSTEM_PROMPTS.email,
  code: ADVANCED_SYSTEM_PROMPTS.code,
  resume: ADVANCED_SYSTEM_PROMPTS.resume,
};

export async function runToolGeneration(
  input: ToolRequestPayload,
  abortSignal?: AbortSignal,
): Promise<ToolApiSuccess> {
  let prompt = "";
  let temperature = 0.6;
  let maxOutputTokens = 2048;

  switch (input.tool) {
    case "writer":
      prompt = buildWriterPrompt(input);
      temperature = 0.75;
      break;
    case "summarizer":
      prompt = buildSummarizerPrompt(input);
      temperature = 0.4;
      break;
    case "translator":
      prompt = buildTranslatorPrompt(input);
      temperature = 0.2;
      break;
    case "grammar":
      prompt = buildGrammarPrompt(input);
      temperature = 0.3;
      break;
    case "email":
      prompt = buildEmailPrompt(input);
      temperature = 0.7;
      break;
    case "code":
      prompt = buildCodePrompt(input);
      temperature = 0.35;
      maxOutputTokens = 4096;
      break;
    case "resume":
      prompt = buildResumePrompt(input);
      temperature = 0.55;
      maxOutputTokens = 4096;
      break;
  }

  const generated = await generateText({
    prompt,
    systemInstruction: SYSTEM_PROMPTS[input.tool],
    temperature,
    maxOutputTokens,
    abortSignal,
  });

  if (input.tool === "grammar") {
    const parsed = parseGrammarResponse(generated.text);
    return {
      ok: true,
      result: parsed.result,
      explanation: parsed.explanation,
      model: generated.model,
    };
  }

  if (input.tool === "email") {
    const parsed = parseEmailResponse(generated.text);
    return {
      ok: true,
      result: parsed.result,
      subject: parsed.subject,
      body: parsed.body,
      model: generated.model,
    };
  }

  return {
    ok: true,
    result: generated.text,
    model: generated.model,
  };
}
