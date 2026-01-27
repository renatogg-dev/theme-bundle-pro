"use client";

import { Check, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ThemeDefinition } from "@/lib/themes/types";
import { useThemeMode } from "./providers";

interface ThemePreviewCardProps {
  theme: ThemeDefinition;
  isActive: boolean;
  onSelect: () => void;
}

export function ThemePreviewCard({
  theme,
  isActive,
  onSelect,
}: ThemePreviewCardProps) {
  const { resolvedTheme } = useThemeMode();
  const mode = (resolvedTheme as "light" | "dark") || "dark";
  const colors = theme.colors[mode];

  return (
    <Card
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
        isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      {/* Color Preview Bar */}
      <div className="flex h-16">
        <div
          className="flex-1"
          style={{ backgroundColor: colors.background }}
        />
        <div className="flex-1" style={{ backgroundColor: colors.primary }} />
        <div className="flex-1" style={{ backgroundColor: colors.secondary }} />
        <div className="flex-1" style={{ backgroundColor: colors.accent }} />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground">{theme.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {theme.description}
            </p>
          </div>

          {/* Active indicator */}
          {isActive && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
              <Check className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {theme.category === "flagship" && (
            <Badge variant="default" className="gap-1 text-[10px]">
              <Sparkles className="h-3 w-3" />
              Flagship
            </Badge>
          )}
          {theme.origin && (
            <Badge variant="outline" className="gap-1 text-[10px]">
              <ExternalLink className="h-2.5 w-2.5" />
              {theme.origin.replace(/^https?:\/\//, "").split("/")[0]}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
