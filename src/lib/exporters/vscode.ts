/**
 * Visual Studio Code Exporter
 * Generates a complete VS Code theme extension structure
 */

import {
  type ThemeConfig,
  type ExportResult,
  toHex,
  getAnsiColors,
  toKebabCase,
  lighten,
  darken,
} from "./types";

export function exportVscode(theme: ThemeConfig): ExportResult[] {
  const { colors, name, displayName, author } = theme;
  const ansi = getAnsiColors(colors);
  const isDark = colors.background.l < 50;

  // Package.json
  const packageJson = {
    name: `${toKebabCase(name)}-theme`,
    displayName: `${displayName} Theme`,
    description: `${displayName} color theme for Visual Studio Code`,
    version: "1.0.0",
    publisher: author || "theme-bundle",
    engines: {
      vscode: "^1.60.0",
    },
    categories: ["Themes"],
    contributes: {
      themes: [
        {
          label: displayName,
          uiTheme: isDark ? "vs-dark" : "vs",
          path: `./themes/${name}-color-theme.json`,
        },
      ],
    },
  };

  // Theme colors
  const themeColors = {
    // Base colors
    "editor.background": toHex(colors.background),
    "editor.foreground": toHex(colors.foreground),
    "editorCursor.foreground": toHex(colors.primary),
    "editor.selectionBackground": toHex(colors.muted),
    "editor.lineHighlightBackground": toHex(isDark ? lighten(colors.background, 5) : darken(colors.background, 5)),
    
    // Activity bar
    "activityBar.background": toHex(colors.card),
    "activityBar.foreground": toHex(colors.foreground),
    "activityBar.activeBorder": toHex(colors.primary),
    "activityBarBadge.background": toHex(colors.primary),
    "activityBarBadge.foreground": toHex(colors.background),
    
    // Sidebar
    "sideBar.background": toHex(colors.card),
    "sideBar.foreground": toHex(colors.foreground),
    "sideBarTitle.foreground": toHex(colors.foreground),
    "sideBarSectionHeader.background": toHex(colors.muted),
    
    // Status bar
    "statusBar.background": toHex(colors.primary),
    "statusBar.foreground": toHex(colors.background),
    "statusBar.noFolderBackground": toHex(colors.muted),
    "statusBarItem.hoverBackground": toHex(lighten(colors.primary, 10)),
    
    // Title bar
    "titleBar.activeBackground": toHex(colors.background),
    "titleBar.activeForeground": toHex(colors.foreground),
    "titleBar.inactiveBackground": toHex(colors.card),
    
    // Tabs
    "tab.activeBackground": toHex(colors.background),
    "tab.activeForeground": toHex(colors.foreground),
    "tab.inactiveBackground": toHex(colors.card),
    "tab.inactiveForeground": toHex(colors.mutedForeground),
    "tab.activeBorderTop": toHex(colors.primary),
    
    // Editor groups
    "editorGroup.border": toHex(colors.border),
    "editorGroupHeader.tabsBackground": toHex(colors.card),
    
    // Input
    "input.background": toHex(colors.input),
    "input.foreground": toHex(colors.foreground),
    "input.border": toHex(colors.border),
    "input.placeholderForeground": toHex(colors.mutedForeground),
    "focusBorder": toHex(colors.ring),
    
    // Buttons
    "button.background": toHex(colors.primary),
    "button.foreground": toHex(colors.background),
    "button.hoverBackground": toHex(lighten(colors.primary, 10)),
    
    // Dropdown
    "dropdown.background": toHex(colors.popover),
    "dropdown.foreground": toHex(colors.popoverForeground),
    "dropdown.border": toHex(colors.border),
    
    // List
    "list.activeSelectionBackground": toHex(colors.primary),
    "list.activeSelectionForeground": toHex(colors.background),
    "list.hoverBackground": toHex(colors.muted),
    "list.focusBackground": toHex(colors.muted),
    
    // Git decoration
    "gitDecoration.addedResourceForeground": toHex(ansi.green),
    "gitDecoration.modifiedResourceForeground": toHex(ansi.yellow),
    "gitDecoration.deletedResourceForeground": toHex(ansi.red),
    "gitDecoration.untrackedResourceForeground": toHex(ansi.cyan),
    
    // Terminal
    "terminal.background": toHex(colors.background),
    "terminal.foreground": toHex(colors.foreground),
    "terminal.ansiBlack": toHex(ansi.black),
    "terminal.ansiRed": toHex(ansi.red),
    "terminal.ansiGreen": toHex(ansi.green),
    "terminal.ansiYellow": toHex(ansi.yellow),
    "terminal.ansiBlue": toHex(ansi.blue),
    "terminal.ansiMagenta": toHex(ansi.magenta),
    "terminal.ansiCyan": toHex(ansi.cyan),
    "terminal.ansiWhite": toHex(ansi.white),
    "terminal.ansiBrightBlack": toHex(ansi.brightBlack),
    "terminal.ansiBrightRed": toHex(ansi.brightRed),
    "terminal.ansiBrightGreen": toHex(ansi.brightGreen),
    "terminal.ansiBrightYellow": toHex(ansi.brightYellow),
    "terminal.ansiBrightBlue": toHex(ansi.brightBlue),
    "terminal.ansiBrightMagenta": toHex(ansi.brightMagenta),
    "terminal.ansiBrightCyan": toHex(ansi.brightCyan),
    "terminal.ansiBrightWhite": toHex(ansi.brightWhite),
    
    // Notifications
    "notificationCenter.border": toHex(colors.border),
    "notifications.background": toHex(colors.popover),
    "notifications.foreground": toHex(colors.popoverForeground),
    
    // Scrollbar
    "scrollbar.shadow": `${toHex(colors.background)}80`,
    "scrollbarSlider.background": `${toHex(colors.muted)}80`,
    "scrollbarSlider.hoverBackground": `${toHex(colors.muted)}aa`,
    "scrollbarSlider.activeBackground": toHex(colors.primary),
  };

  // Token colors for syntax highlighting
  const tokenColors = [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        foreground: toHex(colors.mutedForeground),
        fontStyle: "italic",
      },
    },
    {
      scope: ["string", "string.quoted"],
      settings: {
        foreground: toHex(ansi.green),
      },
    },
    {
      scope: ["constant.numeric", "constant.language", "constant.character"],
      settings: {
        foreground: toHex(ansi.magenta),
      },
    },
    {
      scope: ["keyword", "storage.type", "storage.modifier"],
      settings: {
        foreground: toHex(ansi.red),
      },
    },
    {
      scope: ["entity.name.function", "support.function"],
      settings: {
        foreground: toHex(ansi.blue),
      },
    },
    {
      scope: ["entity.name.type", "entity.name.class", "support.class"],
      settings: {
        foreground: toHex(ansi.yellow),
      },
    },
    {
      scope: ["variable", "variable.parameter"],
      settings: {
        foreground: toHex(colors.foreground),
      },
    },
    {
      scope: ["entity.name.tag"],
      settings: {
        foreground: toHex(ansi.red),
      },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: {
        foreground: toHex(ansi.yellow),
      },
    },
    {
      scope: ["support.type.property-name"],
      settings: {
        foreground: toHex(ansi.cyan),
      },
    },
    {
      scope: ["punctuation"],
      settings: {
        foreground: toHex(colors.foreground),
      },
    },
    {
      scope: ["meta.brace"],
      settings: {
        foreground: toHex(colors.foreground),
      },
    },
  ];

  const themeJson = {
    $schema: "vscode://schemas/color-theme",
    name: displayName,
    type: isDark ? "dark" : "light",
    colors: themeColors,
    tokenColors,
  };

  return [
    {
      filename: "package.json",
      content: JSON.stringify(packageJson, null, 2),
      platform: "vscode",
    },
    {
      filename: `${name}-color-theme.json`,
      content: JSON.stringify(themeJson, null, 2),
      platform: "vscode",
      subfolder: "themes",
    },
  ];
}
