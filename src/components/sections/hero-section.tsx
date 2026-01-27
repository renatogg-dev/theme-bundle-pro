"use client";

import { Terminal, ArrowRight, Sparkles, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { useTheme } from "@/hooks/use-theme";

export function HeroSection() {
  const { currentTheme } = useTheme();

  const scrollToThemes = () => {
    document.getElementById("themes")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[100svh] flex flex-col overflow-hidden border-b border-border contain-section">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Terminal className="h-5 w-5" />
          </div>
          <span className="font-bold text-foreground">Theme Bundle</span>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button size="sm" onClick={scrollToPricing}>
            Get Bundle
          </Button>
        </div>
      </header>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center mx-auto max-w-5xl px-6 py-20 text-center lg:py-32">
        <Badge
          variant="secondary"
          className="mx-auto mb-6 gap-2 px-4 py-1.5 text-sm"
        >
          <Palette className="h-3.5 w-3.5" />
          13 Presets • Unlimited Customization
        </Badge>

        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          <span className="text-glow text-primary">Theme Studio</span>
          <br />
          for Every Platform
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Pick from 13 premium presets. Customize every color in real-time.
          Export to 19 platforms — VS Code, JetBrains, iTerm, Windows Terminal,
          Slack, Chrome, Firefox, and more.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2 px-8" onClick={scrollToThemes}>
            Open Studio
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="gap-2 px-8" onClick={scrollToPricing}>
            <Sparkles className="h-4 w-4" />
            View Pricing
          </Button>
        </div>

        {/* Current Theme Indicator */}
        <div className="mx-auto mt-12 inline-flex items-center gap-2 rounded-full border bg-card/50 px-4 py-2 text-sm backdrop-blur-sm">
          <span className="text-muted-foreground">Current preset:</span>
          <span className="font-medium text-foreground">
            {currentTheme?.name || "Deep Space"}
          </span>
          <div className="flex gap-1">
            {currentTheme && (
              <>
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: currentTheme.colors.dark.primary,
                  }}
                />
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: currentTheme.colors.dark.secondary,
                  }}
                />
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: currentTheme.colors.dark.accent,
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
