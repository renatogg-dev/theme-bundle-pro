"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ColorPicker } from "./color-picker";
import {
  Palette,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import type { UseThemeGeneratorReturn, ThemeColorVariable } from "@/hooks";
import { cn } from "@/lib/utils";

interface ThemeCustomizerProps {
  /** Theme generator hook return value */
  generator: UseThemeGeneratorReturn;
  /** Additional className */
  className?: string;
  /** Start collapsed */
  defaultCollapsed?: boolean;
}

const COLOR_SECTIONS: {
  title: string;
  description: string;
  colors: {
    variable: ThemeColorVariable;
    label: string;
    description: string;
  }[];
}[] = [
  {
    title: "Brand Colors",
    description: "Primary colors for buttons, links, and accents",
    colors: [
      {
        variable: "primary",
        label: "Primary",
        description: "Main brand color for buttons and key elements",
      },
      {
        variable: "secondary",
        label: "Secondary",
        description: "Supporting color for less prominent elements",
      },
      {
        variable: "accent",
        label: "Accent",
        description: "Highlight color for special emphasis",
      },
    ],
  },
  {
    title: "Surface Colors",
    description: "Background and text colors",
    colors: [
      {
        variable: "background",
        label: "Background",
        description: "Main page background color",
      },
      {
        variable: "foreground",
        label: "Foreground",
        description: "Primary text color",
      },
      {
        variable: "muted",
        label: "Muted",
        description: "Subdued backgrounds and secondary text",
      },
    ],
  },
];

export function ThemeCustomizer({
  generator,
  className,
  defaultCollapsed = false,
}: ThemeCustomizerProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const {
    colors,
    hasCustomChanges,
    basePresetId,
    setColor,
    resetToPreset,
  } = generator;

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header */}
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                Theme Studio
                {hasCustomChanges && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-normal text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-3 w-3" />
                    Modified
                  </span>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {basePresetId
                  ? `Based on ${basePresetId.replace("-", " ")}`
                  : "Customize your theme colors"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronUp className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <CardContent className="space-y-6">
          {/* Color Sections */}
          {COLOR_SECTIONS.map((section, sectionIndex) => (
            <div key={section.title}>
              {sectionIndex > 0 && <Separator className="mb-6" />}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-foreground">
                  {section.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {section.description}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.colors.map((colorDef) => (
                  <ColorPicker
                    key={colorDef.variable}
                    label={colorDef.label}
                    description={colorDef.description}
                    value={colors[colorDef.variable]}
                    onChange={(newColor) => setColor(colorDef.variable, newColor)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Actions */}
          <Separator />
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToPreset}
              disabled={!hasCustomChanges}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Preset
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Inline/minimal version of the customizer for embedding
 */
export interface InlineThemeCustomizerProps {
  generator: UseThemeGeneratorReturn;
  className?: string;
}

export function InlineThemeCustomizer({
  generator,
  className,
}: InlineThemeCustomizerProps) {
  const { colors, setColor } = generator;

  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      {(["primary", "secondary", "accent"] as const).map((variable) => (
        <ColorPicker
          key={variable}
          label={variable.charAt(0).toUpperCase() + variable.slice(1)}
          value={colors[variable]}
          onChange={(newColor) => setColor(variable, newColor)}
          className="min-w-[160px]"
        />
      ))}
    </div>
  );
}
