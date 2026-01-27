/**
 * iTerm2 Exporter
 * Generates .itermcolors XML plist file
 */

import {
  type ThemeConfig,
  type ExportResult,
  hslToRgbNormalized,
  getAnsiColors,
} from "./types";

function colorComponent(name: string, r: number, g: number, b: number): string {
  return `	<key>${name}</key>
	<dict>
		<key>Alpha Component</key>
		<real>1</real>
		<key>Blue Component</key>
		<real>${b.toFixed(8)}</real>
		<key>Color Space</key>
		<string>sRGB</string>
		<key>Green Component</key>
		<real>${g.toFixed(8)}</real>
		<key>Red Component</key>
		<real>${r.toFixed(8)}</real>
	</dict>`;
}

function hslToComponent(name: string, hsl: { h: number; s: number; l: number }): string {
  const { r, g, b } = hslToRgbNormalized(hsl);
  return colorComponent(name, r, g, b);
}

export function exportIterm(theme: ThemeConfig): ExportResult {
  const { colors, name, displayName } = theme;
  const ansi = getAnsiColors(colors);

  const components = [
    // ANSI colors
    hslToComponent("Ansi 0 Color", ansi.black),
    hslToComponent("Ansi 1 Color", ansi.red),
    hslToComponent("Ansi 2 Color", ansi.green),
    hslToComponent("Ansi 3 Color", ansi.yellow),
    hslToComponent("Ansi 4 Color", ansi.blue),
    hslToComponent("Ansi 5 Color", ansi.magenta),
    hslToComponent("Ansi 6 Color", ansi.cyan),
    hslToComponent("Ansi 7 Color", ansi.white),
    hslToComponent("Ansi 8 Color", ansi.brightBlack),
    hslToComponent("Ansi 9 Color", ansi.brightRed),
    hslToComponent("Ansi 10 Color", ansi.brightGreen),
    hslToComponent("Ansi 11 Color", ansi.brightYellow),
    hslToComponent("Ansi 12 Color", ansi.brightBlue),
    hslToComponent("Ansi 13 Color", ansi.brightMagenta),
    hslToComponent("Ansi 14 Color", ansi.brightCyan),
    hslToComponent("Ansi 15 Color", ansi.brightWhite),
    // UI colors
    hslToComponent("Background Color", colors.background),
    hslToComponent("Foreground Color", colors.foreground),
    hslToComponent("Bold Color", colors.foreground),
    hslToComponent("Cursor Color", colors.primary),
    hslToComponent("Cursor Text Color", colors.background),
    hslToComponent("Selection Color", colors.muted),
    hslToComponent("Selected Text Color", colors.foreground),
    hslToComponent("Badge Color", colors.accent),
    hslToComponent("Link Color", colors.primary),
    hslToComponent("Tab Color", colors.card),
  ];

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<!-- ${displayName} theme for iTerm2 -->
<plist version="1.0">
<dict>
${components.join("\n")}
</dict>
</plist>
`;

  return {
    filename: `${name}.itermcolors`,
    content: plist,
    platform: "iterm",
  };
}
