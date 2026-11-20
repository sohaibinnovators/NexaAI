import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <Sparkles className="h-4.5 w-4.5" strokeWidth={2.25} />
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
            NexaAI
          </p>
          <p className="truncate text-[11px] text-sidebar-muted">
            One Workspace. Smarter AI.
          </p>
        </div>
      ) : null}
    </div>
  );
}
