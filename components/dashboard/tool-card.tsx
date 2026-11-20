"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-workspace";
import { toggleFavorite } from "@/lib/workspace/activity";
import type { WorkspaceToolId } from "@/lib/workspace/types";
import { cn } from "@/lib/utils";

export function ToolCard({
  name,
  description,
  href,
  icon: Icon,
  toolId,
}: {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  toolId?: WorkspaceToolId;
}) {
  const favorites = useFavorites();
  const isFavorite = toolId ? favorites.includes(toolId) : false;

  return (
    <Card className="group h-full transition-shadow duration-200 hover:shadow-card">
      <CardHeader>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <Icon className="h-5 w-5" />
          </div>
          {toolId ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              onClick={() => toggleFavorite(toolId)}
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  isFavorite ? "fill-primary text-primary" : "text-muted-foreground",
                )}
              />
            </Button>
          ) : null}
        </div>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={href}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
        >
          Open tool
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
