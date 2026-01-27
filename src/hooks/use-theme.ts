"use client";

import { useThemeId, useThemeMode } from "@/components/theme/providers";
import { getThemeById, getThemePreviewColors } from "@/lib/themes/registry";

/**
 * Combined hook for accessing both theme ID and mode
 */
export function useTheme() {
  const { themeId, setThemeId } = useThemeId();
  const { theme: mode, setTheme: setMode, resolvedTheme } = useThemeMode();

  const currentTheme = getThemeById(themeId);
  const resolvedMode = resolvedTheme as "light" | "dark" | undefined;
  
  const previewColors = resolvedMode 
    ? getThemePreviewColors(themeId, resolvedMode)
    : getThemePreviewColors(themeId, "dark");

  return {
    // Theme ID (e.g., "dracula", "nord")
    themeId,
    setThemeId,
    
    // Mode (light/dark/system)
    mode,
    setMode,
    resolvedMode,
    
    // Theme metadata
    currentTheme,
    previewColors,
    
    // Convenience booleans
    isDark: resolvedMode === "dark",
    isLight: resolvedMode === "light",
  };
}
