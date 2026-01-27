/**
 * macOS Terminal.app Exporter
 * Generates .terminal XML plist file
 */

import {
  type ThemeConfig,
  type ExportResult,
  hslToRgbNormalized,
  getAnsiColors,
  escapeXml,
} from "./types";

function colorToNSData(r: number, g: number, b: number): string {
  // Terminal.app accepts hex string format for color data
  const hexR = Math.round(r * 255).toString(16).padStart(2, "0");
  const hexG = Math.round(g * 255).toString(16).padStart(2, "0");
  const hexB = Math.round(b * 255).toString(16).padStart(2, "0");
  
  return `${hexR}${hexG}${hexB}`;
}

function hslToColorData(hsl: { h: number; s: number; l: number }): string {
  const { r, g, b } = hslToRgbNormalized(hsl);
  return colorToNSData(r, g, b);
}

export function exportTerminalApp(theme: ThemeConfig): ExportResult {
  const { colors, name, displayName } = theme;
  const ansi = getAnsiColors(colors);

  // Terminal.app uses a specific plist format
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<!-- ${escapeXml(displayName)} theme for macOS Terminal.app -->
<!-- Double-click to import, then set as default in Terminal Preferences -->
<plist version="1.0">
<dict>
	<key>name</key>
	<string>${escapeXml(displayName)}</string>
	<key>type</key>
	<string>Window Settings</string>
	
	<key>BackgroundColor</key>
	<data>${hslToColorData(colors.background)}</data>
	
	<key>TextColor</key>
	<data>${hslToColorData(colors.foreground)}</data>
	
	<key>TextBoldColor</key>
	<data>${hslToColorData(colors.foreground)}</data>
	
	<key>CursorColor</key>
	<data>${hslToColorData(colors.primary)}</data>
	
	<key>SelectionColor</key>
	<data>${hslToColorData(colors.muted)}</data>
	
	<key>ANSIBlackColor</key>
	<data>${hslToColorData(ansi.black)}</data>
	
	<key>ANSIRedColor</key>
	<data>${hslToColorData(ansi.red)}</data>
	
	<key>ANSIGreenColor</key>
	<data>${hslToColorData(ansi.green)}</data>
	
	<key>ANSIYellowColor</key>
	<data>${hslToColorData(ansi.yellow)}</data>
	
	<key>ANSIBlueColor</key>
	<data>${hslToColorData(ansi.blue)}</data>
	
	<key>ANSIMagentaColor</key>
	<data>${hslToColorData(ansi.magenta)}</data>
	
	<key>ANSICyanColor</key>
	<data>${hslToColorData(ansi.cyan)}</data>
	
	<key>ANSIWhiteColor</key>
	<data>${hslToColorData(ansi.white)}</data>
	
	<key>ANSIBrightBlackColor</key>
	<data>${hslToColorData(ansi.brightBlack)}</data>
	
	<key>ANSIBrightRedColor</key>
	<data>${hslToColorData(ansi.brightRed)}</data>
	
	<key>ANSIBrightGreenColor</key>
	<data>${hslToColorData(ansi.brightGreen)}</data>
	
	<key>ANSIBrightYellowColor</key>
	<data>${hslToColorData(ansi.brightYellow)}</data>
	
	<key>ANSIBrightBlueColor</key>
	<data>${hslToColorData(ansi.brightBlue)}</data>
	
	<key>ANSIBrightMagentaColor</key>
	<data>${hslToColorData(ansi.brightMagenta)}</data>
	
	<key>ANSIBrightCyanColor</key>
	<data>${hslToColorData(ansi.brightCyan)}</data>
	
	<key>ANSIBrightWhiteColor</key>
	<data>${hslToColorData(ansi.brightWhite)}</data>
	
	<key>UseBoldFonts</key>
	<true/>
	
	<key>BlinkText</key>
	<false/>
	
	<key>CursorBlink</key>
	<false/>
</dict>
</plist>
`;

  return {
    filename: `${name}.terminal`,
    content: plist,
    platform: "terminal-app",
  };
}
