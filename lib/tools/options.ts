export const writerContentTypes = [
  { label: "Blog", value: "blog" },
  { label: "Article", value: "article" },
  { label: "Social Media Post", value: "social" },
  { label: "Product Description", value: "product" },
  { label: "Professional Content", value: "professional" },
] as const;

export const writerTones = [
  { label: "Professional", value: "professional" },
  { label: "Friendly", value: "friendly" },
  { label: "Formal", value: "formal" },
  { label: "Persuasive", value: "persuasive" },
  { label: "Casual", value: "casual" },
] as const;

export const writerLanguages = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Portuguese", value: "pt" },
] as const;

export const summaryLengths = [
  { label: "Short", value: "short" },
  { label: "Medium", value: "medium" },
  { label: "Detailed", value: "detailed" },
] as const;

export const translatorLanguages = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Portuguese", value: "pt" },
  { label: "Italian", value: "it" },
  { label: "Dutch", value: "nl" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese (Simplified)", value: "zh" },
  { label: "Arabic", value: "ar" },
  { label: "Hindi", value: "hi" },
] as const;

export const sourceLanguages = [
  { label: "Auto Detect", value: "auto" },
  ...translatorLanguages,
] as const;

export const grammarTones = [
  { label: "Keep original tone", value: "original" },
  { label: "Professional", value: "professional" },
  { label: "Friendly", value: "friendly" },
  { label: "Formal", value: "formal" },
  { label: "Concise", value: "concise" },
] as const;

export const emailPurposes = [
  { label: "Business Inquiry", value: "business-inquiry" },
  { label: "Follow-up", value: "follow-up" },
  { label: "Job Application", value: "job-application" },
  { label: "Meeting Request", value: "meeting-request" },
  { label: "Thank You", value: "thank-you" },
  { label: "General", value: "general" },
] as const;

export const emailTones = [
  { label: "Professional", value: "professional" },
  { label: "Friendly", value: "friendly" },
  { label: "Formal", value: "formal" },
  { label: "Persuasive", value: "persuasive" },
  { label: "Concise", value: "concise" },
] as const;

export const emailRevisions = [
  { label: "Improve", value: "improve" },
  { label: "Shorten", value: "shorten" },
  { label: "Expand", value: "expand" },
  { label: "Rewrite", value: "rewrite" },
] as const;

export const codeLanguages = [
  { label: "TypeScript", value: "typescript" },
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "Go", value: "go" },
  { label: "Java", value: "java" },
  { label: "C#", value: "csharp" },
  { label: "SQL", value: "sql" },
  { label: "Rust", value: "rust" },
  { label: "Other", value: "other" },
] as const;

export const codeTasks = [
  { label: "Explain Code", value: "explain" },
  { label: "Find and Fix Bugs", value: "debug" },
  { label: "Improve Code", value: "improve" },
  { label: "Refactor Code", value: "refactor" },
  { label: "Generate Code", value: "generate" },
] as const;

export const coverLetterTones = [
  { label: "Professional", value: "professional" },
  { label: "Confident", value: "confident" },
  { label: "Friendly", value: "friendly" },
  { label: "Formal", value: "formal" },
] as const;

export const resumeSections = [
  { label: "Full resume", value: "full" },
  { label: "Summary", value: "summary" },
  { label: "Experience", value: "experience" },
  { label: "Skills", value: "skills" },
  { label: "Projects", value: "projects" },
] as const;

export const MAX_TOPIC_LENGTH = 500;
export const MAX_KEYWORDS_LENGTH = 300;
export const MAX_CONTEXT_LENGTH = 2000;
export const MAX_TOOL_TEXT_LENGTH = 12000;
export const MAX_CODE_LENGTH = 10000;
export const MAX_RESUME_FIELD_LENGTH = 4000;
export const MIN_SUMMARIZER_TEXT_LENGTH = 40;
