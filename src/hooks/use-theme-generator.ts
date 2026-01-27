"use client";

import { useState, useCallback, useMemo } from "react";
import { hexToHsl, hslToHex, hslToCSS, type HSLColor } from "@/lib/color-utils";
import { getThemeById } from "@/lib/themes/registry";
import type { ThemeId } from "@/lib/themes/types";

/**
 * Theme color variable names that can be customized
 */
export type ThemeColorVariable =
  | "primary"
  | "secondary"
  | "accent"
  | "background"
  | "foreground"
  | "muted";

/**
 * State shape for theme colors
 */
export interface ThemeGeneratorState {
  primary: HSLColor;
  secondary: HSLColor;
  accent: HSLColor;
  background: HSLColor;
  foreground: HSLColor;
  muted: HSLColor;
}

/**
 * CSS Variables object for applying as inline styles
 */
export interface CSSVariablesOverride {
  "--primary": string;
  "--secondary": string;
  "--accent": string;
  "--background": string;
  "--foreground": string;
  "--muted": string;
  // Derived variables for consistency
  "--primary-foreground": string;
  "--secondary-foreground": string;
  "--accent-foreground": string;
  "--card": string;
  "--card-foreground": string;
  "--popover": string;
  "--popover-foreground": string;
  "--muted-foreground": string;
}

/**
 * Default fallback colors (neutral gray theme)
 */
const DEFAULT_COLORS: ThemeGeneratorState = {
  primary: { h: 220, s: 70, l: 50 },
  secondary: { h: 260, s: 60, l: 55 },
  accent: { h: 180, s: 65, l: 45 },
  background: { h: 0, s: 0, l: 100 },
  foreground: { h: 0, s: 0, l: 4 },
  muted: { h: 0, s: 0, l: 96 },
};

/**
 * Convert theme definition hex colors to HSL state
 */
function themeColorsToState(
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
  }
): ThemeGeneratorState {
  return {
    primary: hexToHsl(colors.primary),
    secondary: hexToHsl(colors.secondary),
    accent: hexToHsl(colors.accent),
    background: hexToHsl(colors.background),
    foreground: hexToHsl(colors.foreground),
    muted: hexToHsl(colors.muted),
  };
}

/**
 * Calculate appropriate foreground color based on background lightness
 */
function calculateForeground(background: HSLColor): HSLColor {
  // If background is dark, use light foreground and vice versa
  if (background.l < 50) {
    return { h: background.h, s: Math.min(background.s, 20), l: 90 };
  }
  return { h: background.h, s: Math.min(background.s, 15), l: 10 };
}

/**
 * Calculate muted foreground based on muted background
 */
function calculateMutedForeground(muted: HSLColor): HSLColor {
  if (muted.l < 50) {
    return { h: muted.h, s: Math.min(muted.s, 15), l: 65 };
  }
  return { h: muted.h, s: Math.min(muted.s, 15), l: 45 };
}

/**
 * Hook for managing theme color customization
 */
export function useThemeGenerator(
  initialThemeId?: ThemeId,
  initialMode: "light" | "dark" = "dark"
) {
  // Track the base preset
  const [basePresetId, setBasePresetId] = useState<ThemeId | null>(
    initialThemeId ?? null
  );
  const [currentMode, setCurrentMode] = useState<"light" | "dark">(initialMode);

  // Color state
  const [colors, setColors] = useState<ThemeGeneratorState>(() => {
    if (initialThemeId) {
      const theme = getThemeById(initialThemeId);
      if (theme) {
        return themeColorsToState(theme.colors[initialMode]);
      }
    }
    return DEFAULT_COLORS;
  });

  // Track if user has made custom changes
  const [hasCustomChanges, setHasCustomChanges] = useState(false);

  /**
   * Load a preset theme's colors
   */
  const loadPreset = useCallback(
    (themeId: ThemeId, mode: "light" | "dark" = currentMode) => {
      const theme = getThemeById(themeId);
      if (theme) {
        setColors(themeColorsToState(theme.colors[mode]));
        setBasePresetId(themeId);
        setCurrentMode(mode);
        setHasCustomChanges(false);
      }
    },
    [currentMode]
  );

  /**
   * Set a single color variable
   */
  const setColor = useCallback(
    (variable: ThemeColorVariable, value: HSLColor) => {
      setColors((prev) => ({
        ...prev,
        [variable]: value,
      }));
      setHasCustomChanges(true);
    },
    []
  );

  /**
   * Set color from hex string
   */
  const setColorFromHex = useCallback(
    (variable: ThemeColorVariable, hex: string) => {
      const hsl = hexToHsl(hex);
      setColor(variable, hsl);
    },
    [setColor]
  );

  /**
   * Reset to the base preset
   */
  const resetToPreset = useCallback(() => {
    if (basePresetId) {
      loadPreset(basePresetId, currentMode);
    } else {
      setColors(DEFAULT_COLORS);
      setHasCustomChanges(false);
    }
  }, [basePresetId, currentMode, loadPreset]);

  /**
   * Get hex value for a color variable
   */
  const getHexColor = useCallback(
    (variable: ThemeColorVariable): string => {
      return hslToHex(colors[variable]);
    },
    [colors]
  );

  /**
   * Generate CSS variables object for inline styles
   */
  const cssVariables = useMemo((): CSSVariablesOverride => {
    const primaryFg = calculateForeground(colors.primary);
    const secondaryFg = calculateForeground(colors.secondary);
    const accentFg = calculateForeground(colors.accent);
    const mutedFg = calculateMutedForeground(colors.muted);

    return {
      "--primary": hslToCSS(colors.primary),
      "--secondary": hslToCSS(colors.secondary),
      "--accent": hslToCSS(colors.accent),
      "--background": hslToCSS(colors.background),
      "--foreground": hslToCSS(colors.foreground),
      "--muted": hslToCSS(colors.muted),
      "--primary-foreground": hslToCSS(primaryFg),
      "--secondary-foreground": hslToCSS(secondaryFg),
      "--accent-foreground": hslToCSS(accentFg),
      "--card": hslToCSS(colors.background),
      "--card-foreground": hslToCSS(colors.foreground),
      "--popover": hslToCSS(colors.background),
      "--popover-foreground": hslToCSS(colors.foreground),
      "--muted-foreground": hslToCSS(mutedFg),
    };
  }, [colors]);

  /**
   * Generate CSS code string for export
   */
  const generateCSSCode = useCallback((): string => {
    const lines = [
      "/* Custom Theme - Generated by Theme Studio */",
      ":root {",
      `  --primary: ${hslToCSS(colors.primary)};`,
      `  --primary-foreground: ${hslToCSS(calculateForeground(colors.primary))};`,
      `  --secondary: ${hslToCSS(colors.secondary)};`,
      `  --secondary-foreground: ${hslToCSS(calculateForeground(colors.secondary))};`,
      `  --accent: ${hslToCSS(colors.accent)};`,
      `  --accent-foreground: ${hslToCSS(calculateForeground(colors.accent))};`,
      `  --background: ${hslToCSS(colors.background)};`,
      `  --foreground: ${hslToCSS(colors.foreground)};`,
      `  --muted: ${hslToCSS(colors.muted)};`,
      `  --muted-foreground: ${hslToCSS(calculateMutedForeground(colors.muted))};`,
      `  --card: ${hslToCSS(colors.background)};`,
      `  --card-foreground: ${hslToCSS(colors.foreground)};`,
      `  --popover: ${hslToCSS(colors.background)};`,
      `  --popover-foreground: ${hslToCSS(colors.foreground)};`,
      "}",
    ];
    return lines.join("\n");
  }, [colors]);

  return {
    // State
    colors,
    basePresetId,
    currentMode,
    hasCustomChanges,

    // Actions
    loadPreset,
    setColor,
    setColorFromHex,
    resetToPreset,

    // Getters
    getHexColor,
    cssVariables,
    generateCSSCode,
  };
}

export type UseThemeGeneratorReturn = ReturnType<typeof useThemeGenerator>;
