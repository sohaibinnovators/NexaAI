export const demoUser = {
  name: "Alex Rivera",
  email: "alex.rivera@nexaai.app",
  role: "Product Designer",
  plan: "Pro Workspace",
  initials: "AR",
};

export const dashboardStats = [
  {
    label: "Total AI Requests",
    value: "248",
    hint: "Demo sample for this workspace",
    trend: "+18 this week",
  },
  {
    label: "Tools Used",
    value: "8",
    hint: "All core tools explored",
    trend: "Full suite",
  },
  {
    label: "Available Usage",
    value: "72%",
    hint: "Remaining of demo monthly allotment",
    trend: "Healthy",
  },
  {
    label: "Favorite Tools",
    value: "4",
    hint: "Pinned for quick access",
    trend: "Chat, Writer, Email, Code",
  },
];

export const recentActivity = [
  {
    id: "act-1",
    tool: "AI Writer",
    title: "Product launch blog outline",
    time: "12 minutes ago",
    status: "Completed",
  },
  {
    id: "act-2",
    tool: "Translator",
    title: "EN → ES feature announcement",
    time: "1 hour ago",
    status: "Completed",
  },
  {
    id: "act-3",
    tool: "Code Assistant",
    title: "Explain React Server Components",
    time: "Yesterday",
    status: "Completed",
  },
  {
    id: "act-4",
    tool: "Email Assistant",
    title: "Follow-up to design partners",
    time: "Yesterday",
    status: "Completed",
  },
  {
    id: "act-5",
    tool: "Document Summarizer",
    title: "Q3 research notes summary",
    time: "2 days ago",
    status: "Completed",
  },
];

export const favoriteTools = [
  { name: "AI Chat", href: "/chat", reason: "Daily ideation partner" },
  { name: "AI Writer", href: "/writer", reason: "Drafts and outlines" },
  { name: "Email Assistant", href: "/email", reason: "Client communication" },
  { name: "Code Assistant", href: "/code", reason: "Debugging support" },
];

export const chatHistory = [
  {
    id: "chat-1",
    title: "Sprint planning ideas",
    preview: "Help me structure next week's priorities...",
    time: "Today",
  },
  {
    id: "chat-2",
    title: "Onboarding copy review",
    preview: "Rewrite this empty-state message...",
    time: "Yesterday",
  },
  {
    id: "chat-3",
    title: "Competitor feature map",
    preview: "Compare three AI writing tools...",
    time: "Mon",
  },
];

export const suggestedPrompts = [
  "Summarize today's priorities into three focus areas",
  "Draft a concise product update for the team",
  "Explain trade-offs between SSR and CSR simply",
  "Suggest interview questions for a design hire",
];

export const historyEntries = [
  {
    id: "h1",
    tool: "AI Chat",
    title: "Brainstorm launch checklist",
    snippet: "Created a phased checklist for soft launch and GA.",
    date: "Mar 18, 2026 · 9:42 AM",
  },
  {
    id: "h2",
    tool: "AI Writer",
    title: "Case study introduction",
    snippet: "Generated a professional case study opening paragraph.",
    date: "Mar 17, 2026 · 4:15 PM",
  },
  {
    id: "h3",
    tool: "Document Summarizer",
    title: "Research PDF overview",
    snippet: "Condensed a 12-page brief into key findings.",
    date: "Mar 17, 2026 · 11:03 AM",
  },
  {
    id: "h4",
    tool: "Translator",
    title: "Support macro translation",
    snippet: "Translated support replies from English to French.",
    date: "Mar 16, 2026 · 6:28 PM",
  },
  {
    id: "h5",
    tool: "Grammar Checker",
    title: "Proposal polish",
    snippet: "Corrected tone and grammar in a client proposal.",
    date: "Mar 16, 2026 · 2:01 PM",
  },
  {
    id: "h6",
    tool: "Email Assistant",
    title: "Partnership outreach",
    snippet: "Drafted a warm outreach email for partnerships.",
    date: "Mar 15, 2026 · 10:44 AM",
  },
  {
    id: "h7",
    tool: "Code Assistant",
    title: "TypeScript utility helper",
    snippet: "Generated a typed debounce utility with comments.",
    date: "Mar 14, 2026 · 8:19 PM",
  },
  {
    id: "h8",
    tool: "Resume Builder",
    title: "Senior PM resume bullets",
    snippet: "Produced impact-focused experience bullets.",
    date: "Mar 13, 2026 · 3:52 PM",
  },
];

export const toolCatalog = [
  {
    name: "AI Chat",
    href: "/chat",
    description: "Ask questions, brainstorm ideas, and iterate in conversation.",
  },
  {
    name: "AI Writer",
    href: "/writer",
    description: "Create blogs, posts, and long-form drafts with tone control.",
  },
  {
    name: "Document Summarizer",
    href: "/summarizer",
    description: "Turn lengthy documents into clear, actionable summaries.",
  },
  {
    name: "Translator",
    href: "/translator",
    description: "Translate content while preserving meaning and tone.",
  },
  {
    name: "Grammar Checker",
    href: "/grammar",
    description: "Catch grammar issues and improve writing clarity.",
  },
  {
    name: "Email Assistant",
    href: "/email",
    description: "Compose professional emails for any context or purpose.",
  },
  {
    name: "Code Assistant",
    href: "/code",
    description: "Explain, generate, debug, and improve code snippets.",
  },
  {
    name: "Resume Builder",
    href: "/resume",
    description: "Generate resume sections tailored to a target role.",
  },
] as const;
