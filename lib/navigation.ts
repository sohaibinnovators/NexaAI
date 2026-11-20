import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  MessageSquare,
  PenLine,
  FileText,
  Languages,
  SpellCheck,
  Mail,
  Code2,
  FileUser,
  History,
  Settings,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const mainNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview of your AI workspace",
  },
  {
    title: "AI Chat",
    href: "/chat",
    icon: MessageSquare,
    description: "Conversational AI assistant",
  },
  {
    title: "AI Writer",
    href: "/writer",
    icon: PenLine,
    description: "Generate polished written content",
  },
  {
    title: "Document Summarizer",
    href: "/summarizer",
    icon: FileText,
    description: "Condense long documents quickly",
  },
  {
    title: "Translator",
    href: "/translator",
    icon: Languages,
    description: "Translate text across languages",
  },
  {
    title: "Grammar Checker",
    href: "/grammar",
    icon: SpellCheck,
    description: "Improve clarity and correctness",
  },
  {
    title: "Email Assistant",
    href: "/email",
    icon: Mail,
    description: "Draft professional emails",
  },
  {
    title: "Code Assistant",
    href: "/code",
    icon: Code2,
    description: "Explain, generate, and debug code",
  },
  {
    title: "Resume Builder",
    href: "/resume",
    icon: FileUser,
    description: "Build resumes and cover letters",
  },
];

export const secondaryNav: NavItem[] = [
  {
    title: "History",
    href: "/history",
    icon: History,
    description: "Review past AI activity",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Manage preferences and profile",
  },
];

export const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/chat": "AI Chat",
  "/writer": "AI Writer",
  "/summarizer": "Document Summarizer",
  "/translator": "Translator",
  "/grammar": "Grammar Checker",
  "/email": "Email Assistant",
  "/code": "Code Assistant",
  "/resume": "Resume Builder",
  "/history": "History",
  "/settings": "Settings",
};

export function getPageTitle(pathname: string) {
  return pageTitles[pathname] ?? "NexaAI";
}
