/**
 * Alacritty Terminal Exporter
 * Generates TOML configuration for Alacritty (v0.13+)
 */

import {
  type ThemeConfig,
  type ExportResult,
  toHexRaw,
  getAnsiColors,
} from "./types";

export function exportAlacritty(theme: ThemeConfig): ExportResult {
  const { colors, name, displayName } = theme;
  const ansi = getAnsiColors(colors);

  const toml = `# ${displayName} theme for Alacritty
# https://alacritty.org/

[colors.primary]
background = "#${toHexRaw(colors.background)}"
foreground = "#${toHexRaw(colors.foreground)}"

[colors.cursor]
text = "#${toHexRaw(colors.background)}"
cursor = "#${toHexRaw(colors.primary)}"

[colors.vi_mode_cursor]
text = "#${toHexRaw(colors.background)}"
cursor = "#${toHexRaw(colors.accent)}"

[colors.selection]
text = "#${toHexRaw(colors.foreground)}"
background = "#${toHexRaw(colors.muted)}"

[colors.search.matches]
foreground = "#${toHexRaw(colors.background)}"
background = "#${toHexRaw(colors.accent)}"

[colors.search.focused_match]
foreground = "#${toHexRaw(colors.background)}"
background = "#${toHexRaw(colors.primary)}"

[colors.hints.start]
foreground = "#${toHexRaw(colors.background)}"
background = "#${toHexRaw(ansi.yellow)}"

[colors.hints.end]
foreground = "#${toHexRaw(colors.background)}"
background = "#${toHexRaw(colors.muted)}"

[colors.normal]
black = "#${toHexRaw(ansi.black)}"
red = "#${toHexRaw(ansi.red)}"
green = "#${toHexRaw(ansi.green)}"
yellow = "#${toHexRaw(ansi.yellow)}"
blue = "#${toHexRaw(ansi.blue)}"
magenta = "#${toHexRaw(ansi.magenta)}"
cyan = "#${toHexRaw(ansi.cyan)}"
white = "#${toHexRaw(ansi.white)}"

[colors.bright]
black = "#${toHexRaw(ansi.brightBlack)}"
red = "#${toHexRaw(ansi.brightRed)}"
green = "#${toHexRaw(ansi.brightGreen)}"
yellow = "#${toHexRaw(ansi.brightYellow)}"
blue = "#${toHexRaw(ansi.brightBlue)}"
magenta = "#${toHexRaw(ansi.brightMagenta)}"
cyan = "#${toHexRaw(ansi.brightCyan)}"
white = "#${toHexRaw(ansi.brightWhite)}"
`;

  return {
    filename: `${name}.toml`,
    content: toml,
    platform: "alacritty",
  };
}
