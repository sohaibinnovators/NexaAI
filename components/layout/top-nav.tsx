"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider";
import { getPageTitle } from "@/lib/navigation";
import { usePreferences } from "@/hooks/use-workspace";

type TopNavProps = {
  onMenuClick: () => void;
  menuOpen?: boolean;
};

export function TopNav({ onMenuClick, menuOpen = false }: TopNavProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const preferences = usePreferences();
  const initials = preferences.profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "NA";
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="app-sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {getPageTitle(pathname)}
          </p>
        </div>

        <div className="relative hidden min-w-0 max-w-sm flex-1 md:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tools, history, settings..."
            className="h-10 pl-9"
            aria-label="Search"
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </Button>

          <div className="relative" ref={notificationsRef}>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={() => {
                setNotificationsOpen((v) => !v);
                setProfileOpen(false);
              }}
            >
              <Bell className="h-4.5 w-4.5" />
            </Button>
            {notificationsOpen ? (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card p-2 shadow-card">
                <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Notifications
                </p>
                <div className="space-y-1">
                  <div className="rounded-lg px-3 py-2 text-sm hover:bg-muted">
                    <p className="font-medium">Welcome to NexaAI</p>
                    <p className="text-xs text-muted-foreground">
                      Explore the eight AI tools in your workspace.
                    </p>
                  </div>
                  <div className="rounded-lg px-3 py-2 text-sm hover:bg-muted">
                    <p className="font-medium">Demo usage reminder</p>
                    <p className="text-xs text-muted-foreground">
                      Sample metrics are for UI preview only.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen((v) => !v);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 transition-colors hover:bg-muted"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {initials}
              </div>
              <span className="hidden max-w-[110px] truncate text-sm font-medium sm:inline">
                {preferences.profile.name}
              </span>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:inline" />
            </button>

            {profileOpen ? (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-card">
                <div className="border-b border-border px-3 py-2">
                  <p className="text-sm font-medium">{preferences.profile.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {preferences.profile.email}
                  </p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 md:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-9 pl-9"
            aria-label="Search mobile"
          />
        </div>
      </div>
    </header>
  );
}
