/**
 * Zed Editor Exporter
 * Generates JSON theme file for Zed
 */

import {
  type ThemeConfig,
  type ExportResult,
  toHex,
  getAnsiColors,
  lighten,
  darken,
} from "./types";

export function exportZed(theme: ThemeConfig): ExportResult {
  const { colors, name, displayName, author } = theme;
  const ansi = getAnsiColors(colors);
  const isDark = colors.background.l < 50;

  const zedTheme = {
    $schema: "https://zed.dev/schema/themes/v0.1.0.json",
    name: displayName,
    author: author || "Theme Bundle",
    themes: [
      {
        name: displayName,
        appearance: isDark ? "dark" : "light",
        style: {
          // Background colors
          background: toHex(colors.background),
          "elevated_surface.background": toHex(colors.card),
          "surface.background": toHex(colors.card),
          
          // Text colors
          text: toHex(colors.foreground),
          "text.muted": toHex(colors.mutedForeground),
          "text.placeholder": toHex(colors.mutedForeground),
          "text.disabled": toHex(colors.mutedForeground),
          "text.accent": toHex(colors.primary),
          
          // Border
          border: toHex(colors.border),
          "border.variant": toHex(colors.border),
          "border.focused": toHex(colors.ring),
          "border.selected": toHex(colors.primary),
          "border.transparent": "transparent",
          "border.disabled": toHex(colors.muted),
          
          // Element colors
          "element.background": toHex(colors.muted),
          "element.hover": toHex(isDark ? lighten(colors.muted, 5) : darken(colors.muted, 5)),
          "element.active": toHex(colors.primary),
          "element.selected": toHex(colors.primary),
          "element.disabled": toHex(colors.muted),
          
          // Ghost element
          "ghost_element.background": "transparent",
          "ghost_element.hover": toHex(colors.muted),
          "ghost_element.active": toHex(colors.primary),
          "ghost_element.selected": toHex(colors.muted),
          "ghost_element.disabled": "transparent",
          
          // Editor
          "editor.background": toHex(colors.background),
          "editor.gutter.background": toHex(colors.background),
          "editor.subheader.background": toHex(colors.card),
          "editor.active_line.background": toHex(colors.card),
          "editor.highlighted_line.background": toHex(colors.muted),
          "editor.line_number": toHex(colors.mutedForeground),
          "editor.active_line_number": toHex(colors.foreground),
          "editor.invisible": toHex(colors.mutedForeground),
          "editor.wrap_guide": toHex(colors.border),
          "editor.active_wrap_guide": toHex(colors.border),
          
          // Tab bar
          "tab_bar.background": toHex(colors.card),
          "tab.inactive_background": toHex(colors.card),
          "tab.active_background": toHex(colors.background),
          
          // Toolbar
          "toolbar.background": toHex(colors.background),
          
          // Title bar
          "title_bar.background": toHex(colors.background),
          
          // Status bar
          "status_bar.background": toHex(colors.card),
          
          // Panel
          "panel.background": toHex(colors.card),
          "panel.focused_border": toHex(colors.primary),
          
          // Scrollbar
          "scrollbar.thumb.background": toHex(colors.muted),
          "scrollbar.thumb.hover_background": toHex(isDark ? lighten(colors.muted, 10) : darken(colors.muted, 10)),
          "scrollbar.thumb.border": toHex(colors.border),
          "scrollbar.track.background": toHex(colors.background),
          "scrollbar.track.border": toHex(colors.border),
          
          // Terminal
          "terminal.background": toHex(colors.background),
          "terminal.foreground": toHex(colors.foreground),
          "terminal.bright_foreground": toHex(colors.foreground),
          "terminal.dim_foreground": toHex(colors.mutedForeground),
          "terminal.ansi.black": toHex(ansi.black),
          "terminal.ansi.red": toHex(ansi.red),
          "terminal.ansi.green": toHex(ansi.green),
          "terminal.ansi.yellow": toHex(ansi.yellow),
          "terminal.ansi.blue": toHex(ansi.blue),
          "terminal.ansi.magenta": toHex(ansi.magenta),
          "terminal.ansi.cyan": toHex(ansi.cyan),
          "terminal.ansi.white": toHex(ansi.white),
          "terminal.ansi.bright_black": toHex(ansi.brightBlack),
          "terminal.ansi.bright_red": toHex(ansi.brightRed),
          "terminal.ansi.bright_green": toHex(ansi.brightGreen),
          "terminal.ansi.bright_yellow": toHex(ansi.brightYellow),
          "terminal.ansi.bright_blue": toHex(ansi.brightBlue),
          "terminal.ansi.bright_magenta": toHex(ansi.brightMagenta),
          "terminal.ansi.bright_cyan": toHex(ansi.brightCyan),
          "terminal.ansi.bright_white": toHex(ansi.brightWhite),
          
          // Syntax highlighting
          "syntax": {
            "attribute": { color: toHex(ansi.cyan) },
            "boolean": { color: toHex(ansi.magenta) },
            "comment": { color: toHex(colors.mutedForeground), font_style: "italic" },
            "comment.doc": { color: toHex(colors.mutedForeground), font_style: "italic" },
            "constant": { color: toHex(ansi.magenta) },
            "constructor": { color: toHex(ansi.yellow) },
            "embedded": { color: toHex(colors.foreground) },
            "emphasis": { font_style: "italic" },
            "emphasis.strong": { font_weight: 700 },
            "enum": { color: toHex(ansi.yellow) },
            "function": { color: toHex(ansi.blue) },
            "hint": { color: toHex(ansi.cyan) },
            "keyword": { color: toHex(ansi.red) },
            "label": { color: toHex(ansi.cyan) },
            "link_text": { color: toHex(colors.primary) },
            "link_uri": { color: toHex(colors.primary) },
            "number": { color: toHex(ansi.magenta) },
            "operator": { color: toHex(colors.foreground) },
            "predictive": { color: toHex(colors.mutedForeground), font_style: "italic" },
            "preproc": { color: toHex(ansi.cyan) },
            "primary": { color: toHex(colors.primary) },
            "property": { color: toHex(ansi.cyan) },
            "punctuation": { color: toHex(colors.foreground) },
            "punctuation.bracket": { color: toHex(colors.foreground) },
            "punctuation.delimiter": { color: toHex(colors.foreground) },
            "punctuation.list_marker": { color: toHex(colors.primary) },
            "punctuation.special": { color: toHex(ansi.cyan) },
            "string": { color: toHex(ansi.green) },
            "string.escape": { color: toHex(ansi.cyan) },
            "string.regex": { color: toHex(ansi.cyan) },
            "string.special": { color: toHex(ansi.cyan) },
            "string.special.symbol": { color: toHex(ansi.cyan) },
            "tag": { color: toHex(ansi.red) },
            "text.literal": { color: toHex(ansi.green) },
            "title": { color: toHex(ansi.blue), font_weight: 700 },
            "type": { color: toHex(ansi.yellow) },
            "variable": { color: toHex(colors.foreground) },
            "variable.special": { color: toHex(ansi.cyan) },
            "variant": { color: toHex(ansi.yellow) },
          },
        },
      },
    ],
  };

  return {
    filename: `${name}.json`,
    content: JSON.stringify(zedTheme, null, 2),
    platform: "zed",
  };
}
