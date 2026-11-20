"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { getPreferencesSnapshot } from "@/lib/workspace/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== "/") return;
    try {
      if (sessionStorage.getItem("nexaai-landing-applied")) return;
      const preferred = getPreferencesSnapshot().landingPage;
      if (!preferred || preferred === "/") return;
      sessionStorage.setItem("nexaai-landing-applied", "1");
      router.replace(preferred);
    } catch {
      // ignore storage/navigation failures
    }
  }, [pathname, router]);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:shadow-card"
      >
        Skip to main content
      </a>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav
          menuOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main
          id="main-content"
          className="flex-1 overflow-x-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-8"
        >
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
