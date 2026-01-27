/**
 * Hyper Terminal Exporter
 * Generates JavaScript configuration for Hyper terminal
 */

import {
  type ThemeConfig,
  type ExportResult,
  toHex,
  getAnsiColors,
} from "./types";

export function exportHyper(theme: ThemeConfig): ExportResult {
  const { colors, name, displayName } = theme;
  const ansi = getAnsiColors(colors);

  const config = `// ${displayName} theme for Hyper
// https://hyper.is/
//
// To use this theme, add the colors configuration to your ~/.hyper.js file
// under the 'config' key.

module.exports = {
  config: {
    // Theme colors
    backgroundColor: '${toHex(colors.background)}',
    foregroundColor: '${toHex(colors.foreground)}',
    cursorColor: '${toHex(colors.primary)}',
    cursorAccentColor: '${toHex(colors.background)}',
    selectionColor: '${toHex(colors.muted)}',
    borderColor: '${toHex(colors.border)}',

    // ANSI 16-color palette
    colors: {
      black: '${toHex(ansi.black)}',
      red: '${toHex(ansi.red)}',
      green: '${toHex(ansi.green)}',
      yellow: '${toHex(ansi.yellow)}',
      blue: '${toHex(ansi.blue)}',
      magenta: '${toHex(ansi.magenta)}',
      cyan: '${toHex(ansi.cyan)}',
      white: '${toHex(ansi.white)}',
      lightBlack: '${toHex(ansi.brightBlack)}',
      lightRed: '${toHex(ansi.brightRed)}',
      lightGreen: '${toHex(ansi.brightGreen)}',
      lightYellow: '${toHex(ansi.brightYellow)}',
      lightBlue: '${toHex(ansi.brightBlue)}',
      lightMagenta: '${toHex(ansi.brightMagenta)}',
      lightCyan: '${toHex(ansi.brightCyan)}',
      lightWhite: '${toHex(ansi.brightWhite)}',
    },

    // CSS for custom styling (optional)
    css: \`
      .tab_tab {
        border-color: ${toHex(colors.border)};
      }
      .tab_active {
        border-bottom-color: ${toHex(colors.primary)};
      }
    \`,

    // Terminal CSS (optional)
    termCSS: '',
  },
};
`;

  return {
    filename: `${name}.hyper.js`,
    content: config,
    platform: "hyper",
  };
}
