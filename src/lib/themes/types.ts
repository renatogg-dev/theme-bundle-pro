/**
 * Theme System Type Definitions
 * Supports 13 themes × 2 modes = 26 variations
 */

export type ThemeMode = "light" | "dark" | "system";

export type ThemeId =
  // Flagships (3)
  | "deep-space"
  | "mint-carbon"
  | "solar-flare"
  // Legacy Collection (10)
  | "dracula"
  | "nord"
  | "monokai"
  | "gruvbox"
  | "tokyo-night"
  | "catppuccin"
  | "one-dark"
  | "synthwave"
  | "solarized"
  | "github";

export type ThemeCategory = "flagship" | "legacy";

export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  category: ThemeCategory;
  origin?: string;
  inspiration?: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  tags: string[];
}

export interface ThemeContextValue {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

// Utility type for theme selection
export interface ThemeOption {
  id: ThemeId;
  name: string;
  colors: [string, string, string]; // Preview colors (primary, secondary, accent)
}
