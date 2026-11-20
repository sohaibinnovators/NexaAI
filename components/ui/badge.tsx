import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "success" | "warning" | "primary";
};

const tones = {
  default: "bg-muted text-muted-foreground",
  success: "bg-emerald-500/10 text-success",
  warning: "bg-amber-500/10 text-warning",
  primary: "bg-secondary text-secondary-foreground",
};

export function Badge({
  className,
  tone = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
