"use client";

import { useEffect } from "react";
import { ThemeMarketplace } from "@/components/theme/theme-marketplace";
import { ThemeCustomizer } from "@/components/theme/theme-customizer";
import { PreviewDashboard } from "@/components/preview/preview-dashboard";
import { useThemeId, useCSSOverrides, useThemeMode } from "@/components/theme/providers";
import { useThemeGenerator, usePurchaseFlow } from "@/hooks";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles, Loader2, Package } from "lucide-react";

export function ThemesSection() {
  const { themeId } = useThemeId();
  const { resolvedTheme } = useThemeMode();
  const { setOverrides, clearOverrides } = useCSSOverrides();
  
  // Theme generator for customization
  const generator = useThemeGenerator(themeId, (resolvedTheme as "light" | "dark") ?? "dark");
  
  // Purchase flow hook
  const purchase = usePurchaseFlow({
    colors: generator.colors,
    basePresetId: generator.basePresetId,
    hasCustomChanges: generator.hasCustomChanges,
  });
  
  // Sync generator with selected theme
  useEffect(() => {
    const mode = (resolvedTheme as "light" | "dark") ?? "dark";
    generator.loadPreset(themeId, mode);
    clearOverrides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId, resolvedTheme]);
  
  // Apply CSS overrides when generator colors change
  useEffect(() => {
    if (generator.hasCustomChanges) {
      // Convert to plain record for compatibility
      const overrides: Record<string, string> = { ...generator.cssVariables };
      setOverrides(overrides);
    } else {
      clearOverrides();
    }
  }, [generator.cssVariables, generator.hasCustomChanges, setOverrides, clearOverrides]);

  // Handle purchase button click
  const handlePurchase = async () => {
    if (generator.hasCustomChanges) {
      // If user has custom changes, create a session to preserve them
      await purchase.startPurchase("bundle");
    } else {
      // If using a preset without changes, direct link is fine
      purchase.openGumroadDirect("bundle");
    }
  };

  return (
    <section id="themes" className="border-b border-border py-20 contain-section">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Theme Studio
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Select a preset, customize colors, and preview in real-time
          </p>
        </div>

        {/* Theme Marketplace - Preset Selection */}
        <ThemeMarketplace />

        {/* Theme Customizer */}
        <div className="mt-12">
          <ThemeCustomizer generator={generator} defaultCollapsed={false} />
        </div>

        {/* Live Preview */}
        <div className="mt-12">
          <div className="mb-8 text-center">
            <h3 className="text-xl font-semibold text-foreground">
              Live Preview
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {generator.hasCustomChanges
                ? "Previewing your customized theme"
                : "See how your selected theme looks on real UI components"}
            </p>
          </div>
          <PreviewDashboard />
        </div>

        {/* CTA - Get the Bundle */}
        <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <div className="mx-auto max-w-2xl">
            <Sparkles className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">
              {generator.hasCustomChanges ? "Ready to export your custom theme?" : "Love what you see?"}
            </h3>
            <p className="mt-3 text-muted-foreground">
              {generator.hasCustomChanges ? (
                <>
                  Your customized theme will be exported to <strong>19 platforms</strong> including
                  VS Code, iTerm, Vim, Alacritty, JetBrains, and more.
                </>
              ) : (
                <>
                  Get all 13 premium themes with full source code exported to 19 platforms.
                  Your customizations work with any preset as a starting point.
                </>
              )}
            </p>

            {/* Purchase Error */}
            {purchase.error && (
              <p className="mt-4 text-sm text-destructive">
                {purchase.error}. Please try again.
              </p>
            )}

            {/* Purchase Buttons */}
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="gap-2 text-base"
                onClick={handlePurchase}
                disabled={purchase.isLoading}
              >
                {purchase.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4" />
                    {generator.hasCustomChanges ? "Buy Custom Theme - $49" : "Get Full Bundle - $49"}
                  </>
                )}
              </Button>

              {generator.hasCustomChanges && (
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 text-base"
                  onClick={() => purchase.openGumroadDirect("bundle")}
                >
                  Browse All Themes
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Platform Badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {["VS Code", "iTerm", "Alacritty", "Vim", "JetBrains", "+14 more"].map((platform) => (
                <span
                  key={platform}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
