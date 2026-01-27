/**
 * GNOME Terminal Exporter
 * Generates a shell script to install the theme via dconf
 */

import {
  type ThemeConfig,
  type ExportResult,
  toHex,
  getAnsiColors,
} from "./types";

export function exportGnomeTerminal(theme: ThemeConfig): ExportResult {
  const { colors, name, displayName } = theme;
  const ansi = getAnsiColors(colors);

  // Generate palette array for dconf
  const palette = [
    toHex(ansi.black),
    toHex(ansi.red),
    toHex(ansi.green),
    toHex(ansi.yellow),
    toHex(ansi.blue),
    toHex(ansi.magenta),
    toHex(ansi.cyan),
    toHex(ansi.white),
    toHex(ansi.brightBlack),
    toHex(ansi.brightRed),
    toHex(ansi.brightGreen),
    toHex(ansi.brightYellow),
    toHex(ansi.brightBlue),
    toHex(ansi.brightMagenta),
    toHex(ansi.brightCyan),
    toHex(ansi.brightWhite),
  ];

  const paletteString = palette.map((c) => `'${c}'`).join(", ");

  const script = `#!/bin/bash
# ${displayName} theme for GNOME Terminal
#
# Installation:
# 1. Make this script executable: chmod +x install-${name}.sh
# 2. Run: ./install-${name}.sh
# 3. Open GNOME Terminal preferences and select "${displayName}" profile

# Profile settings
PROFILE_NAME="${displayName}"
PROFILE_SLUG="${name}"

# Check for dconf
if ! command -v dconf &> /dev/null; then
    echo "Error: dconf is required but not installed."
    exit 1
fi

# Get current profile list
PROFILE_LIST=$(dconf read /org/gnome/terminal/legacy/profiles:/list)

# Generate a new UUID for the profile
NEW_UUID=$(uuidgen)

# Create the profile path
PROFILE_PATH="/org/gnome/terminal/legacy/profiles:/:$NEW_UUID/"

# Set profile colors
dconf write "\${PROFILE_PATH}visible-name" "'$PROFILE_NAME'"
dconf write "\${PROFILE_PATH}background-color" "'${toHex(colors.background)}'"
dconf write "\${PROFILE_PATH}foreground-color" "'${toHex(colors.foreground)}'"
dconf write "\${PROFILE_PATH}cursor-background-color" "'${toHex(colors.primary)}'"
dconf write "\${PROFILE_PATH}cursor-foreground-color" "'${toHex(colors.background)}'"
dconf write "\${PROFILE_PATH}highlight-background-color" "'${toHex(colors.muted)}'"
dconf write "\${PROFILE_PATH}highlight-foreground-color" "'${toHex(colors.foreground)}'"
dconf write "\${PROFILE_PATH}palette" "[${paletteString}]"

# Enable custom colors
dconf write "\${PROFILE_PATH}use-theme-colors" "false"
dconf write "\${PROFILE_PATH}bold-is-bright" "true"

# Add to profile list
if [[ "$PROFILE_LIST" == *"$NEW_UUID"* ]]; then
    echo "Profile already exists"
else
    NEW_LIST=$(echo "$PROFILE_LIST" | sed "s/]/, '$NEW_UUID']/")
    dconf write /org/gnome/terminal/legacy/profiles:/list "$NEW_LIST"
fi

echo "✓ ${displayName} theme installed successfully!"
echo "  Open GNOME Terminal Preferences to select the profile."
`;

  return {
    filename: `install-${name}.sh`,
    content: script,
    platform: "gnome-terminal",
  };
}
