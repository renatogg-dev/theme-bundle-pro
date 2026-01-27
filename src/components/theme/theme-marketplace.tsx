"use client";

import { Sparkles, Archive, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemePreviewCard } from "./theme-preview-card";
import { useThemeId } from "./providers";
import {
  themeRegistry,
  flagshipThemes,
  legacyThemes,
} from "@/lib/themes/registry";

export function ThemeMarketplace() {
  const { themeId, setThemeId } = useThemeId();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all" className="gap-2">
            <Layers className="h-4 w-4" />
            All ({themeRegistry.length})
          </TabsTrigger>
          <TabsTrigger value="flagship" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Flagship
          </TabsTrigger>
          <TabsTrigger value="legacy" className="gap-2">
            <Archive className="h-4 w-4" />
            Legacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {themeRegistry.map((theme) => (
              <ThemePreviewCard
                key={theme.id}
                theme={theme}
                isActive={themeId === theme.id}
                onSelect={() => setThemeId(theme.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flagship" className="mt-6">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Original themes crafted for modern UI, inspired by classic CLI
              aesthetics.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flagshipThemes.map((theme) => (
              <ThemePreviewCard
                key={theme.id}
                theme={theme}
                isActive={themeId === theme.id}
                onSelect={() => setThemeId(theme.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="legacy" className="mt-6">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Classic color schemes from legendary code editors, adapted for
              modern UI tokens.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {legacyThemes.map((theme) => (
              <ThemePreviewCard
                key={theme.id}
                theme={theme}
                isActive={themeId === theme.id}
                onSelect={() => setThemeId(theme.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
