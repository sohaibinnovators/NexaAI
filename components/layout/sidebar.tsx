"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { mainNav, secondaryNav } from "@/lib/navigation";
import { usePreferences } from "@/hooks/use-workspace";
import { cn } from "@/lib/utils";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

function NavLink({
  href,
  title,
  icon: Icon,
  onNavigate,
}: {
  href: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-active text-white"
          : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground",
      )}
    >
      <Icon
        className={cn(
          "h-4.5 w-4.5 shrink-0",
          active ? "text-white" : "text-sidebar-muted group-hover:text-sidebar-foreground",
        )}
      />
      <span className="truncate">{title}</span>
    </Link>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const preferences = usePreferences();
  const initials = preferences.profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "NA";

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/50 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        id="app-sidebar"
        aria-label="Primary"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(272px,85vw)] flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:static lg:w-[272px] lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-4">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-muted">
            Workspace
          </p>
          <div className="space-y-1">
            {mainNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                title={item.title}
                icon={item.icon}
                onNavigate={onClose}
              />
            ))}
          </div>

          <p className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-muted">
            Account
          </p>
          <div className="space-y-1">
            {secondaryNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                title={item.title}
                icon={item.icon}
                onNavigate={onClose}
              />
            ))}
          </div>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {preferences.profile.name}
              </p>
              <p className="truncate text-xs text-sidebar-muted">
                {preferences.profile.role || "NexaAI workspace"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
