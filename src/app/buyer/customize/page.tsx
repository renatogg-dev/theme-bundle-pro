"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeCustomizer } from "@/components/theme/theme-customizer";
import { useThemeGenerator, type ThemeGeneratorState } from "@/hooks/use-theme-generator";
import { themeRegistry } from "@/lib/themes/registry";
import type { ThemeId } from "@/lib/themes/types";
import type { ThemeColors } from "@/lib/exporters/types";
import { Download, Palette, CheckCircle, Loader2, AlertCircle, ArrowLeft, Sun, Moon } from "lucide-react";
import type { HSLColor } from "@/lib/color-utils";
import { BuyerPreview } from "@/components/preview";

/**
 * Validate that a download URL is safe to redirect to (CWE-601 prevention)
 * Only allows URLs from the same origin or configured app URL
 */
function isValidDownloadUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Allow same-origin URLs (relative URLs resolve to same origin)
    if (parsed.origin === window.location.origin) {
      return true;
    }
    
    // Allow configured app URL if different from current origin
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) {
      const configuredOrigin = new URL(appUrl).origin;
      if (parsed.origin === configuredOrigin) {
        return true;
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

interface BuyerAccessInfo {
  licenseKeyHash: string;
  email: string;
  productType: "single" | "bundle";
  uses: number;
  test: boolean;
  purchaseId?: string;
}

// Helper to convert generator colors to ThemeColors
function colorsToThemeColors(colors: ThemeGeneratorState): ThemeColors {
  return {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    background: colors.background,
    foreground: colors.foreground,
    muted: colors.muted,
    mutedForeground: {
      h: colors.muted.h,
      s: Math.min(colors.muted.s, 15),
      l: colors.muted.l < 50 ? 65 : 45,
    },
    card: colors.background,
    cardForeground: colors.foreground,
    popover: colors.background,
    popoverForeground: colors.foreground,
    border: {
      h: colors.muted.h,
      s: colors.muted.s,
      l: colors.muted.l < 50 ? colors.muted.l + 10 : colors.muted.l - 10,
    },
    input: colors.muted,
    ring: colors.primary,
    destructive: { h: 0, s: 100, l: 67 },
    destructiveForeground: colors.foreground,
  };
}

export default function BuyerCustomizePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessInfo, setAccessInfo] = useState<BuyerAccessInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [activeMode, setActiveMode] = useState<"light" | "dark">("dark");
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>("deep-space");

  // Stored colors for each mode
  const [lightColors, setLightColors] = useState<ThemeGeneratorState | null>(null);
  const [darkColors, setDarkColors] = useState<ThemeGeneratorState | null>(null);

  // Theme generator hook - used for the active mode
  const generator = useThemeGenerator(selectedThemeId, activeMode);

  // Track if we're switching modes to avoid saving stale data
  const isSwitchingMode = useRef(false);
  // Track if initial load is complete
  const isInitialized = useRef(false);

  // All users get access to all themes for customization
  const availableThemes = useMemo(() => {
    if (!accessInfo) return [];
    return themeRegistry;
  }, [accessInfo]);

  // Initialize colors when theme is loaded (only once)
  useEffect(() => {
    if (!loading && accessInfo && !isInitialized.current) {
      isInitialized.current = true;
      // Default to deep-space theme
      setSelectedThemeId("deep-space");
    }
  }, [loading, accessInfo]);

  // Save current colors when mode changes
  useEffect(() => {
    if (isSwitchingMode.current) {
      isSwitchingMode.current = false;
      return;
    }

    // Don't save during initial load
    if (loading || !generator.colors) return;

    // Save current mode's colors
    if (activeMode === "light" && lightColors === null) {
      // First time on light, don't save yet
    } else if (activeMode === "dark" && darkColors === null) {
      // First time on dark, don't save yet
    }
  }, [activeMode, generator.colors, loading, lightColors, darkColors]);

  // Update stored colors when generator colors change
  useEffect(() => {
    if (loading || isSwitchingMode.current) return;
    
    const currentColors = { ...generator.colors };
    if (activeMode === "light") {
      setLightColors(currentColors);
    } else {
      setDarkColors(currentColors);
    }
  }, [generator.colors, activeMode, loading]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("buyerToken");
      
      if (!token) {
        router.push("/buyer");
        return;
      }

      try {
        const response = await fetch("/api/buyer/auth", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("buyerToken");
          router.push("/buyer");
          return;
        }

        const data = await response.json();
        setAccessInfo(data);
        
        // Initialize with dark mode first
        generator.loadPreset("deep-space", "dark");
      } catch {
        localStorage.removeItem("buyerToken");
        router.push("/buyer");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Handle theme selection
  const handleThemeSelect = (themeId: ThemeId) => {
    setSelectedThemeId(themeId);
    generator.loadPreset(themeId, activeMode);
    // Reset stored colors for both modes when changing theme
    setLightColors(null);
    setDarkColors(null);
  };

  // Handle mode switch
  const handleModeChange = useCallback((mode: "light" | "dark") => {
    if (mode === activeMode) return;

    // Save current colors before switching
    const currentColors = { ...generator.colors };
    if (activeMode === "light") {
      setLightColors(currentColors);
    } else {
      setDarkColors(currentColors);
    }

    isSwitchingMode.current = true;
    setActiveMode(mode);

    // Load saved colors for the new mode, or load from preset
    const savedColors = mode === "light" ? lightColors : darkColors;
    
    if (savedColors) {
      // Restore saved colors
      generator.loadPreset(selectedThemeId, mode);
      // Apply saved customizations
      setTimeout(() => {
        Object.entries(savedColors).forEach(([key, value]) => {
          if (key in generator.colors) {
            generator.setColor(key as keyof ThemeGeneratorState, value as HSLColor);
          }
        });
      }, 0);
    } else {
      // Load fresh from preset
      generator.loadPreset(selectedThemeId, mode);
    }
  }, [activeMode, generator, selectedThemeId, lightColors, darkColors]);

  // Handle download
  const handleDownload = async () => {
    const token = localStorage.getItem("buyerToken");
    if (!token || !accessInfo) return;

    setDownloading(true);
    setError(null);

    try {
      // Save current mode colors
      const currentColors = { ...generator.colors };
      let finalLightColors = lightColors;
      let finalDarkColors = darkColors;

      if (activeMode === "light") {
        finalLightColors = currentColors;
      } else {
        finalDarkColors = currentColors;
      }

      // If one mode wasn't customized, load defaults
      if (!finalLightColors) {
        generator.loadPreset(selectedThemeId, "light");
        finalLightColors = { ...generator.colors };
        // Restore current mode
        generator.loadPreset(selectedThemeId, activeMode);
      }
      if (!finalDarkColors) {
        generator.loadPreset(selectedThemeId, "dark");
        finalDarkColors = { ...generator.colors };
        // Restore current mode
        generator.loadPreset(selectedThemeId, activeMode);
      }

      const baseName = selectedThemeId || "custom";
      const displayName = generator.hasCustomChanges
        ? `Custom ${selectedThemeId?.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Theme"}`
        : selectedThemeId?.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Custom Theme";

      const response = await fetch("/api/buyer/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: baseName,
          displayName,
          lightColors: colorsToThemeColors(finalLightColors),
          darkColors: colorsToThemeColors(finalDarkColors),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Download failed");
      }

      const data = await response.json();
      
      if (data.downloadUrl) {
        // Security: Validate download URL before redirect (CWE-601 prevention)
        if (!isValidDownloadUrl(data.downloadUrl)) {
          console.error("Invalid download URL blocked:", data.downloadUrl);
          throw new Error("Invalid download URL received. Please contact support.");
        }
        
        window.location.href = data.downloadUrl;
        setDownloadComplete(true);
        localStorage.removeItem("buyerToken");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your theme...</p>
        </div>
      </main>
    );
  }

  // Error state (access already used)
  if (error && !accessInfo) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Access Already Used</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Download complete state
  if (downloadComplete) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle>Download Complete!</CardTitle>
            <CardDescription>
              Your custom theme bundle has been downloaded with both Light and Dark modes.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Your theme bundle includes configurations for 19 different platforms in both light and dark variants.
            </p>
            <Button variant="outline" onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Theme Bundle</h1>
              <p className="text-xs text-muted-foreground">
                Theme Customization Studio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {accessInfo?.email}
            </span>
            <Button 
              onClick={handleDownload}
              disabled={downloading}
              className="gap-2"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Theme
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Left: Preview */}
          <div className="space-y-6">
            {/* Theme Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Live Preview</CardTitle>
                    <CardDescription>
                      Customize {activeMode === "light" ? "Light" : "Dark"} Mode
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm">
                    {activeMode === "light" ? (
                      <Sun className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Moon className="h-4 w-4 text-blue-400" />
                    )}
                    {activeMode === "light" ? "Light" : "Dark"} Mode
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <BuyerPreview cssVariables={generator.cssVariables as React.CSSProperties} />
              </CardContent>
            </Card>

            {/* Theme Selector */}
            <Card>
                <CardHeader>
                  <CardTitle>Choose a Theme</CardTitle>
                  <CardDescription>
                    Select a theme as your starting point, then customize the colors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {availableThemes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handleThemeSelect(theme.id)}
                        className={`p-3 rounded-lg border transition-all text-left ${
                          selectedThemeId === theme.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex gap-1 mb-2">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: theme.colors[activeMode].primary }}
                          />
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: theme.colors[activeMode].secondary }}
                          />
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: theme.colors[activeMode].accent }}
                          />
                        </div>
                        <p className="text-xs font-medium truncate">{theme.name}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
          </div>

          {/* Right: Customizer */}
          <div className="space-y-6">
            {/* Mode Toggle */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Customize colors for each mode separately. Both will be included in your download.
                  </p>
                  <Tabs value={activeMode} onValueChange={(v) => handleModeChange(v as "light" | "dark")}>
                    <TabsList className="w-full">
                      <TabsTrigger value="light" className="flex-1 gap-2">
                        <Sun className="h-4 w-4" />
                        Light Mode
                        {lightColors && <span className="w-2 h-2 rounded-full bg-green-500" />}
                      </TabsTrigger>
                      <TabsTrigger value="dark" className="flex-1 gap-2">
                        <Moon className="h-4 w-4" />
                        Dark Mode
                        {darkColors && <span className="w-2 h-2 rounded-full bg-green-500" />}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardContent>
            </Card>

            {/* Color Customizer */}
            <ThemeCustomizer generator={generator} defaultCollapsed={false} />

            {/* Error Display */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Download Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Your download includes:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Light AND Dark mode versions</li>
                    <li>• VS Code extension</li>
                    <li>• iTerm2, Alacritty, Windows Terminal</li>
                    <li>• Vim, Sublime Text, JetBrains IDEs</li>
                    <li>• Chrome & Firefox themes</li>
                    <li>• Slack, Raycast, and more...</li>
                  </ul>
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                    Note: This is a one-time download. Make sure you&apos;re happy with your colors before downloading.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
