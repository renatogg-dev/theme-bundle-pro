/**
 * Theme Exporter Types and Utilities
 * Common types and color conversion utilities for all platform exporters
 */

import { HSLColor, hslToHex } from "@/lib/color-utils";

// ============================================================================
// Core Types
// ============================================================================

/**
 * Complete theme configuration for export
 */
export interface ThemeConfig {
  /** Slug name for filenames (e.g., "dracula", "my-custom-theme") */
  name: string;
  /** Display name for UI (e.g., "Dracula", "My Custom Theme") */
  displayName: string;
  /** Theme author */
  author?: string;
  /** Theme colors in HSL format */
  colors: ThemeColors;
}

/**
 * All theme color tokens in HSL format
 */
export interface ThemeColors {
  // Brand colors
  primary: HSLColor;
  secondary: HSLColor;
  accent: HSLColor;

  // Surface colors
  background: HSLColor;
  foreground: HSLColor;
  muted: HSLColor;
  mutedForeground: HSLColor;

  // UI colors
  card: HSLColor;
  cardForeground: HSLColor;
  popover: HSLColor;
  popoverForeground: HSLColor;
  border: HSLColor;
  input: HSLColor;
  ring: HSLColor;

  // Semantic colors
  destructive: HSLColor;
  destructiveForeground: HSLColor;

  // ANSI colors for terminals (optional, will generate if not provided)
  ansi?: AnsiColors;
}

/**
 * ANSI 16-color palette for terminal emulators
 */
export interface AnsiColors {
  black: HSLColor;
  red: HSLColor;
  green: HSLColor;
  yellow: HSLColor;
  blue: HSLColor;
  magenta: HSLColor;
  cyan: HSLColor;
  white: HSLColor;
  brightBlack: HSLColor;
  brightRed: HSLColor;
  brightGreen: HSLColor;
  brightYellow: HSLColor;
  brightBlue: HSLColor;
  brightMagenta: HSLColor;
  brightCyan: HSLColor;
  brightWhite: HSLColor;
}

/**
 * Result of an export operation
 */
export interface ExportResult {
  /** Filename with extension (e.g., "dracula.yml") */
  filename: string;
  /** File content as string */
  content: string;
  /** Platform identifier */
  platform: Platform;
  /** Optional subfolder within platform folder */
  subfolder?: string;
}

/**
 * Supported export platforms
 */
export type Platform =
  // Terminals
  | "alacritty"
  | "gnome-terminal"
  | "hyper"
  | "iterm"
  | "terminal-app"
  | "windows-terminal"
  // Editors
  | "emacs"
  | "jetbrains"
  | "notepad-plus-plus"
  | "sublime-text"
  | "vim"
  | "vscode"
  | "xcode"
  | "zed"
  // Browsers
  | "chrome"
  | "firefox"
  // Apps
  | "insomnia"
  | "raycast"
  | "slack";

/**
 * Exporter function signature
 */
export type Exporter = (theme: ThemeConfig) => ExportResult | ExportResult[];

// ============================================================================
// Color Conversion Utilities
// ============================================================================

export interface RGBColor {
  r: number; // 0-255
  g: number;
  b: number;
}

export interface RGBNormalized {
  r: number; // 0-1
  g: number;
  b: number;
}

/**
 * Convert HSL to RGB (0-255)
 */
export function hslToRgb(hsl: HSLColor): RGBColor {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert HSL to normalized RGB (0-1) for iTerm/macOS plists
 */
export function hslToRgbNormalized(hsl: HSLColor): RGBNormalized {
  const rgb = hslToRgb(hsl);
  return {
    r: rgb.r / 255,
    g: rgb.g / 255,
    b: rgb.b / 255,
  };
}

/**
 * Convert HSL to hex string (with #)
 */
export function toHex(hsl: HSLColor): string {
  return hslToHex(hsl);
}

/**
 * Convert HSL to hex string (without #)
 */
export function toHexRaw(hsl: HSLColor): string {
  return hslToHex(hsl).replace("#", "");
}

/**
 * Convert HSL to CSS rgb() function
 */
export function toRgbString(hsl: HSLColor): string {
  const { r, g, b } = hslToRgb(hsl);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Convert HSL to CSS rgba() function
 */
export function toRgbaString(hsl: HSLColor, alpha: number = 1): string {
  const { r, g, b } = hslToRgb(hsl);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Lighten a color by percentage
 */
export function lighten(hsl: HSLColor, amount: number): HSLColor {
  return {
    h: hsl.h,
    s: hsl.s,
    l: Math.min(100, hsl.l + amount),
  };
}

/**
 * Darken a color by percentage
 */
export function darken(hsl: HSLColor, amount: number): HSLColor {
  return {
    h: hsl.h,
    s: hsl.s,
    l: Math.max(0, hsl.l - amount),
  };
}

/**
 * Saturate a color by percentage
 */
export function saturate(hsl: HSLColor, amount: number): HSLColor {
  return {
    h: hsl.h,
    s: Math.min(100, hsl.s + amount),
    l: hsl.l,
  };
}

/**
 * Desaturate a color by percentage
 */
export function desaturate(hsl: HSLColor, amount: number): HSLColor {
  return {
    h: hsl.h,
    s: Math.max(0, hsl.s - amount),
    l: hsl.l,
  };
}

/**
 * Adjust hue by degrees
 */
export function adjustHue(hsl: HSLColor, degrees: number): HSLColor {
  let newHue = (hsl.h + degrees) % 360;
  if (newHue < 0) newHue += 360;
  return {
    h: newHue,
    s: hsl.s,
    l: hsl.l,
  };
}

// ============================================================================
// ANSI Color Generation
// ============================================================================

/**
 * Generate a complete ANSI 16-color palette from theme colors
 * Uses the theme's primary colors as base and generates variations
 */
export function generateAnsiColors(colors: ThemeColors): AnsiColors {
  const isDark = colors.background.l < 50;

  // Base black/white from background/foreground
  const black = isDark ? colors.background : darken(colors.background, 10);
  const white = isDark ? colors.foreground : lighten(colors.foreground, 10);

  // Derive ANSI colors from theme accent colors
  const red = adjustHue(colors.destructive, 0);
  const green = adjustHue(colors.accent, 120 - colors.accent.h);
  const yellow = { h: 45, s: colors.primary.s, l: colors.primary.l };
  const blue = colors.primary;
  const magenta = adjustHue(colors.accent, 300 - colors.accent.h);
  const cyan = colors.accent;

  return {
    black,
    red,
    green,
    yellow,
    blue,
    magenta,
    cyan,
    white,
    brightBlack: lighten(black, 20),
    brightRed: lighten(red, 15),
    brightGreen: lighten(green, 15),
    brightYellow: lighten(yellow, 15),
    brightBlue: lighten(blue, 15),
    brightMagenta: lighten(magenta, 15),
    brightCyan: lighten(cyan, 15),
    brightWhite: lighten(white, 10),
  };
}

/**
 * Get ANSI colors from theme, generating if not provided
 */
export function getAnsiColors(colors: ThemeColors): AnsiColors {
  return colors.ansi ?? generateAnsiColors(colors);
}

// ============================================================================
// Platform Folder Mapping
// ============================================================================

/**
 * Get the folder path for a platform within the ZIP structure
 */
export function getPlatformFolder(platform: Platform): string {
  const folders: Record<Platform, string> = {
    // Terminals
    alacritty: "terminals/alacritty",
    "gnome-terminal": "terminals/gnome-terminal",
    hyper: "terminals/hyper",
    iterm: "terminals/iterm",
    "terminal-app": "terminals/terminal-app",
    "windows-terminal": "terminals/windows-terminal",
    // Editors
    emacs: "editors/emacs",
    jetbrains: "editors/jetbrains",
    "notepad-plus-plus": "editors/notepad-plus-plus",
    "sublime-text": "editors/sublime-text",
    vim: "editors/vim",
    vscode: "editors/vscode",
    xcode: "editors/xcode",
    zed: "editors/zed",
    // Browsers
    chrome: "browsers/chrome",
    firefox: "browsers/firefox",
    // Apps
    insomnia: "apps/insomnia",
    raycast: "apps/raycast",
    slack: "apps/slack",
  };

  return folders[platform];
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Escape XML special characters
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (c) => c.toUpperCase());
}

/**
 * Convert string to camelCase
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
