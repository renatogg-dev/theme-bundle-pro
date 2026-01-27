/**
 * Windows Terminal Exporter
 * Generates JSON color scheme for Windows Terminal
 */

import {
  type ThemeConfig,
  type ExportResult,
  toHex,
  getAnsiColors,
} from "./types";

export function exportWindowsTerminal(theme: ThemeConfig): ExportResult {
  const { colors, name, displayName } = theme;
  const ansi = getAnsiColors(colors);

  const scheme = {
    name: displayName,
    background: toHex(colors.background),
    foreground: toHex(colors.foreground),
    cursorColor: toHex(colors.primary),
    selectionBackground: toHex(colors.muted),
    // ANSI colors
    black: toHex(ansi.black),
    red: toHex(ansi.red),
    green: toHex(ansi.green),
    yellow: toHex(ansi.yellow),
    blue: toHex(ansi.blue),
    purple: toHex(ansi.magenta),
    cyan: toHex(ansi.cyan),
    white: toHex(ansi.white),
    brightBlack: toHex(ansi.brightBlack),
    brightRed: toHex(ansi.brightRed),
    brightGreen: toHex(ansi.brightGreen),
    brightYellow: toHex(ansi.brightYellow),
    brightBlue: toHex(ansi.brightBlue),
    brightPurple: toHex(ansi.brightMagenta),
    brightCyan: toHex(ansi.brightCyan),
    brightWhite: toHex(ansi.brightWhite),
  };

  const content = `{
  "$schema": "https://raw.githubusercontent.com/microsoft/terminal/main/doc/cascadia/profiles.schema.json",
  "name": "${displayName}",
  "comment": "Add this scheme to your Windows Terminal settings.json under 'schemes' array",
  "scheme": ${JSON.stringify(scheme, null, 4)}
}
`;

  return {
    filename: `${name}.json`,
    content,
    platform: "windows-terminal",
  };
}
