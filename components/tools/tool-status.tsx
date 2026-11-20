import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ToolStatus({
  loading,
  error,
  empty,
  emptyMessage,
  onRetry,
}: {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
}) {
  if (loading) {
    return (
      <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Generating with Gemini…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-3">
        <p className="text-sm font-medium text-destructive">Generation failed</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        {onRetry ? (
          <Button size="sm" variant="outline" className="mt-2" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
    );
  }

  if (empty) {
    return (
      <p className="mb-3 text-sm text-muted-foreground">
        {emptyMessage ?? "Output will appear here after you generate."}
      </p>
    );
  }

  return null;
}
