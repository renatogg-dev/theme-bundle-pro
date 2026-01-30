/**
 * Theme Exporters Index
 * Exports all platform-specific theme generators
 */

// Types
export * from "./types";

// Terminal exporters
export { exportAlacritty } from "./alacritty";
export { exportGnomeTerminal } from "./gnome-terminal";
export { exportHyper } from "./hyper";
export { exportIterm } from "./iterm";
export { exportTerminalApp } from "./terminal-app";
export { exportWindowsTerminal } from "./windows-terminal";

// Editor exporters
export { exportEmacs } from "./emacs";
export { exportJetbrains } from "./jetbrains";
export { exportNotepadPlusPlus } from "./notepad-plus-plus";
export { exportSublimeText } from "./sublime-text";
export { exportVim } from "./vim";
export { exportVscode } from "./vscode";
export { exportXcode } from "./xcode";
export { exportZed } from "./zed";

// Browser exporters
export { exportChrome } from "./chrome";
export { exportFirefox } from "./firefox";

// App exporters
export { exportInsomnia } from "./insomnia";
export { exportRaycast } from "./raycast";
export { exportSlack } from "./slack";

// All exporters as array for batch processing
import { exportAlacritty } from "./alacritty";
import { exportGnomeTerminal } from "./gnome-terminal";
import { exportHyper } from "./hyper";
import { exportIterm } from "./iterm";
import { exportTerminalApp } from "./terminal-app";
import { exportWindowsTerminal } from "./windows-terminal";
import { exportEmacs } from "./emacs";
import { exportJetbrains } from "./jetbrains";
import { exportNotepadPlusPlus } from "./notepad-plus-plus";
import { exportSublimeText } from "./sublime-text";
import { exportVim } from "./vim";
import { exportVscode } from "./vscode";
import { exportXcode } from "./xcode";
import { exportZed } from "./zed";
import { exportChrome } from "./chrome";
import { exportFirefox } from "./firefox";
import { exportInsomnia } from "./insomnia";
import { exportRaycast } from "./raycast";
import { exportSlack } from "./slack";
import type { ThemeConfig, DualThemeConfig, ExportResult, Exporter } from "./types";

// Re-export DualThemeConfig explicitly for clarity
export type { DualThemeConfig };

/**
 * All available exporters
 */
export const allExporters: Exporter[] = [
  // Terminals
  exportAlacritty,
  exportGnomeTerminal,
  exportHyper,
  exportIterm,
  exportTerminalApp,
  exportWindowsTerminal,
  // Editors
  exportEmacs,
  exportJetbrains,
  exportNotepadPlusPlus,
  exportSublimeText,
  exportVim,
  exportVscode,
  exportXcode,
  exportZed,
  // Browsers
  exportChrome,
  exportFirefox,
  // Apps
  exportInsomnia,
  exportRaycast,
  exportSlack,
];

/**
 * Export theme to all platforms
 * Returns flat array of all export results
 */
export function exportAll(theme: ThemeConfig): ExportResult[] {
  const results: ExportResult[] = [];

  for (const exporter of allExporters) {
    const result = exporter(theme);
    if (Array.isArray(result)) {
      results.push(...result);
    } else {
      results.push(result);
    }
  }

  return results;
}

/**
 * Export theme to specific platforms
 */
export function exportToPlatforms(
  theme: ThemeConfig,
  platforms: string[]
): ExportResult[] {
  const results: ExportResult[] = [];

  for (const exporter of allExporters) {
    const result = exporter(theme);
    const items = Array.isArray(result) ? result : [result];

    for (const item of items) {
      if (platforms.includes(item.platform)) {
        results.push(item);
      }
    }
  }

  return results;
}

/**
 * Platform categories for UI
 */
export const platformCategories = {
  terminals: [
    { id: "alacritty", name: "Alacritty", icon: "terminal" },
    { id: "gnome-terminal", name: "GNOME Terminal", icon: "terminal" },
    { id: "hyper", name: "Hyper", icon: "terminal" },
    { id: "iterm", name: "iTerm2", icon: "terminal" },
    { id: "terminal-app", name: "Terminal.app", icon: "terminal" },
    { id: "windows-terminal", name: "Windows Terminal", icon: "terminal" },
  ],
  editors: [
    { id: "emacs", name: "Emacs", icon: "code" },
    { id: "jetbrains", name: "JetBrains IDEs", icon: "code" },
    { id: "notepad-plus-plus", name: "Notepad++", icon: "code" },
    { id: "sublime-text", name: "Sublime Text", icon: "code" },
    { id: "vim", name: "Vim/Neovim", icon: "code" },
    { id: "vscode", name: "VS Code", icon: "code" },
    { id: "xcode", name: "Xcode", icon: "code" },
    { id: "zed", name: "Zed", icon: "code" },
  ],
  browsers: [
    { id: "chrome", name: "Google Chrome", icon: "globe" },
    { id: "firefox", name: "Firefox", icon: "globe" },
  ],
  apps: [
    { id: "insomnia", name: "Insomnia", icon: "api" },
    { id: "raycast", name: "Raycast", icon: "command" },
    { id: "slack", name: "Slack", icon: "message" },
  ],
} as const;
