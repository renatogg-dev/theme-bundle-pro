/**
 * ZIP Generator
 * Creates downloadable theme packages with all platform formats
 * Uploads to Supabase Storage and creates download tokens
 */

import JSZip from "jszip";
import {
  exportAll,
  getPlatformFolder,
  type ThemeConfig,
  type DualThemeConfig,
  type ExportResult,
} from "./exporters";
import {
  uploadZipFile,
  createDownloadToken,
  buildDownloadUrl,
} from "./server";

interface GeneratePackageOptions {
  themeConfig: ThemeConfig;
  purchaseId: string;
}

interface GenerateDualPackageOptions {
  dualConfig: DualThemeConfig;
  purchaseId: string;
}

interface GeneratePackageResult {
  downloadUrl: string;
  expiresAt: Date;
  size: number;
}

/**
 * Generate a complete theme package with all platform formats
 * Uploads to Supabase Storage and returns a tokenized download URL
 */
export async function generateThemePackage(
  options: GeneratePackageOptions
): Promise<GeneratePackageResult> {
  const { themeConfig, purchaseId } = options;
  const zip = new JSZip();

  // Generate all exports
  const exports = exportAll(themeConfig);

  // Add files to ZIP organized by platform
  for (const result of exports) {
    const folderPath = getPlatformFolder(result.platform);
    const fullPath = result.subfolder
      ? `${folderPath}/${result.subfolder}/${result.filename}`
      : `${folderPath}/${result.filename}`;

    zip.file(fullPath, result.content);
  }

  // Add README
  zip.file("README.md", generateReadme(themeConfig, exports));

  // Add LICENSE
  zip.file("LICENSE.md", generateLicense(themeConfig));

  // Generate ZIP as Buffer (Node.js)
  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  const zipSize = zipBuffer.length;
  console.log(`[ZIP] Generated ${themeConfig.name} bundle (${(zipSize / 1024).toFixed(2)} KB)`);

  // Upload to Supabase Storage
  const { storagePath } = await uploadZipFile({
    purchaseId,
    themeName: themeConfig.name,
    zipBuffer,
  });

  // Create download token (expires in 7 days)
  const downloadToken = await createDownloadToken({
    storagePath,
    purchaseId,
    themeName: themeConfig.displayName,
    expiresInDays: 7,
  });

  // Build download URL with token
  const downloadUrl = buildDownloadUrl(downloadToken.token);

  return {
    downloadUrl,
    expiresAt: new Date(downloadToken.expiresAt),
    size: zipSize,
  };
}

/**
 * Generate README for the theme package
 */
function generateReadme(config: ThemeConfig, exports: ExportResult[]): string {
  const platformGroups = {
    terminals: exports.filter((e) =>
      ["alacritty", "gnome-terminal", "hyper", "iterm", "terminal-app", "windows-terminal"].includes(e.platform)
    ),
    editors: exports.filter((e) =>
      ["emacs", "jetbrains", "notepad-plus-plus", "sublime-text", "vim", "vscode", "xcode", "zed"].includes(e.platform)
    ),
    browsers: exports.filter((e) => ["chrome", "firefox"].includes(e.platform)),
    apps: exports.filter((e) => ["insomnia", "raycast", "slack"].includes(e.platform)),
  };

  return `# ${config.displayName} - Theme Bundle Pro

Thank you for purchasing the ${config.displayName} theme from Theme Bundle Pro!

This package contains your theme exported for **${exports.length} files** across **19 platforms**.

## Quick Start

1. Navigate to the folder for your application
2. Follow the installation instructions in that folder's README (if present)
3. Enjoy your new theme!

## Included Platforms

### Terminals (${platformGroups.terminals.length} files)
${platformGroups.terminals.map((e) => `- ${e.platform}: \`${e.filename}\``).join("\n")}

### Code Editors (${platformGroups.editors.length} files)
${platformGroups.editors.map((e) => `- ${e.platform}: \`${e.filename}\``).join("\n")}

### Browsers (${platformGroups.browsers.length} files)
${platformGroups.browsers.map((e) => `- ${e.platform}: \`${e.filename}\``).join("\n")}

### Apps (${platformGroups.apps.length} files)
${platformGroups.apps.map((e) => `- ${e.platform}: \`${e.filename}\``).join("\n")}

## Installation Guides

Each platform folder may contain a README with specific installation instructions.
For general guidance:

### Terminal Emulators
- **Alacritty**: Copy \`.toml\` to \`~/.config/alacritty/\` and import in config
- **iTerm2**: Double-click \`.itermcolors\` to import, then select in Preferences
- **Windows Terminal**: Add the scheme to your \`settings.json\`
- **Hyper**: Copy config to \`~/.hyper.js\`

### Code Editors
- **VS Code**: Copy folder to \`~/.vscode/extensions/\` or load unpacked
- **Sublime Text**: Copy \`.sublime-color-scheme\` to Packages/User
- **Vim/Neovim**: Copy to \`~/.vim/colors/\` or \`~/.config/nvim/colors/\`
- **JetBrains**: Import \`.icls\` via Settings > Editor > Color Scheme

### Browsers
- **Firefox**: Load as temporary extension via \`about:debugging\`
- **Chrome**: Load unpacked via \`chrome://extensions\` (dev mode)

### Apps
- **Slack**: Paste the theme string in Preferences > Themes > Custom
- **Raycast**: Double-click \`.raycasttheme\` to import
- **Insomnia**: Copy folder to Insomnia plugins directory

## Support

If you have any issues or questions:
- Email: support@theme-bundle-pro.xyz
- Website: https://theme-bundle-pro.xyz

## License

This theme is licensed for personal and commercial use.
See LICENSE.md for full terms.

---

Generated by Theme Bundle Pro
https://theme-bundle-pro.xyz
`;
}

/**
 * Generate LICENSE file
 */
function generateLicense(config: ThemeConfig): string {
  return `# Theme Bundle Pro License

## ${config.displayName} Theme

Copyright (c) ${new Date().getFullYear()} Theme Bundle Pro

### License Grant

You are granted a non-exclusive, worldwide license to:

1. **Use** this theme for personal and commercial projects
2. **Modify** the theme files for your own use
3. **Include** this theme in products you distribute (with attribution)

### Restrictions

You may NOT:

1. **Resell** this theme or derivative works as a standalone product
2. **Redistribute** this theme in a theme marketplace or similar
3. **Remove** attribution or claim the theme as your original work

### Attribution

When using this theme in a public project, a credit to Theme Bundle Pro
is appreciated but not required.

### No Warranty

This theme is provided "as is" without warranty of any kind.
Theme Bundle Pro is not liable for any damages arising from use.

### Contact

For licensing questions or commercial inquiries:
- Email: support@theme-bundle-pro.xyz
- Website: https://theme-bundle-pro.xyz

---

Thank you for supporting Theme Bundle Pro!
`;
}

/**
 * Generate a dual theme package with both light and dark modes
 * Uploads to Supabase Storage and returns a tokenized download URL
 */
export async function generateDualThemePackage(
  options: GenerateDualPackageOptions
): Promise<GeneratePackageResult> {
  const { dualConfig, purchaseId } = options;
  const zip = new JSZip();

  // Create light theme config
  const lightConfig: ThemeConfig = {
    name: `${dualConfig.name}-light`,
    displayName: `${dualConfig.displayName} Light`,
    author: dualConfig.author,
    colors: dualConfig.light,
  };

  // Create dark theme config
  const darkConfig: ThemeConfig = {
    name: `${dualConfig.name}-dark`,
    displayName: `${dualConfig.displayName} Dark`,
    author: dualConfig.author,
    colors: dualConfig.dark,
  };

  // Generate exports for both modes
  const lightExports = exportAll(lightConfig);
  const darkExports = exportAll(darkConfig);

  // Add light mode files to ZIP
  for (const result of lightExports) {
    const folderPath = getPlatformFolder(result.platform);
    const fullPath = result.subfolder
      ? `light/${folderPath}/${result.subfolder}/${result.filename}`
      : `light/${folderPath}/${result.filename}`;
    zip.file(fullPath, result.content);
  }

  // Add dark mode files to ZIP
  for (const result of darkExports) {
    const folderPath = getPlatformFolder(result.platform);
    const fullPath = result.subfolder
      ? `dark/${folderPath}/${result.subfolder}/${result.filename}`
      : `dark/${folderPath}/${result.filename}`;
    zip.file(fullPath, result.content);
  }

  // Add README for dual theme
  zip.file("README.md", generateDualReadme(dualConfig, lightExports, darkExports));

  // Add LICENSE
  zip.file("LICENSE.md", generateDualLicense(dualConfig));

  // Generate ZIP as Buffer (Node.js)
  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  const zipSize = zipBuffer.length;
  console.log(`[ZIP] Generated ${dualConfig.name} dual bundle (${(zipSize / 1024).toFixed(2)} KB)`);

  // Upload to Supabase Storage
  const { storagePath } = await uploadZipFile({
    purchaseId,
    themeName: dualConfig.name,
    zipBuffer,
  });

  // Create download token (expires in 7 days)
  const downloadToken = await createDownloadToken({
    storagePath,
    purchaseId,
    themeName: dualConfig.displayName,
    expiresInDays: 7,
  });

  // Build download URL with token
  const downloadUrl = buildDownloadUrl(downloadToken.token);

  return {
    downloadUrl,
    expiresAt: new Date(downloadToken.expiresAt),
    size: zipSize,
  };
}

/**
 * Generate README for dual theme package
 */
function generateDualReadme(
  config: DualThemeConfig,
  lightExports: ExportResult[],
  darkExports: ExportResult[]
): string {
  const totalFiles = lightExports.length + darkExports.length;

  const platformGroups = {
    terminals: lightExports.filter((e) =>
      ["alacritty", "gnome-terminal", "hyper", "iterm", "terminal-app", "windows-terminal"].includes(e.platform)
    ),
    editors: lightExports.filter((e) =>
      ["emacs", "jetbrains", "notepad-plus-plus", "sublime-text", "vim", "vscode", "xcode", "zed"].includes(e.platform)
    ),
    browsers: lightExports.filter((e) => ["chrome", "firefox"].includes(e.platform)),
    apps: lightExports.filter((e) => ["insomnia", "raycast", "slack"].includes(e.platform)),
  };

  return `# ${config.displayName} - Theme Bundle Pro

Thank you for purchasing the ${config.displayName} theme from Theme Bundle Pro!

This package contains **both Light and Dark modes** exported for **${totalFiles} files** across **19 platforms**.

## Folder Structure

\`\`\`
${config.name}-bundle/
├── light/          # Light mode theme files
│   ├── terminals/
│   ├── editors/
│   ├── browsers/
│   └── apps/
├── dark/           # Dark mode theme files
│   ├── terminals/
│   ├── editors/
│   ├── browsers/
│   └── apps/
├── README.md
└── LICENSE.md
\`\`\`

## Quick Start

1. Choose your preferred mode (light or dark)
2. Navigate to the folder for your application
3. Follow the installation instructions below
4. Enjoy your new theme!

## Included Platforms

### Terminals (${platformGroups.terminals.length} files per mode)
${platformGroups.terminals.map((e) => `- ${e.platform}: \`${e.filename}\``).join("\n")}

### Code Editors (${platformGroups.editors.length} files per mode)
${platformGroups.editors.map((e) => `- ${e.platform}: \`${e.filename}\``).join("\n")}

### Browsers (${platformGroups.browsers.length} files per mode)
${platformGroups.browsers.map((e) => `- ${e.platform}: \`${e.filename}\``).join("\n")}

### Apps (${platformGroups.apps.length} files per mode)
${platformGroups.apps.map((e) => `- ${e.platform}: \`${e.filename}\``).join("\n")}

## Installation Guides

Each platform folder may contain a README with specific installation instructions.
For general guidance:

### Terminal Emulators
- **Alacritty**: Copy \`.toml\` to \`~/.config/alacritty/\` and import in config
- **iTerm2**: Double-click \`.itermcolors\` to import, then select in Preferences
- **Windows Terminal**: Add the scheme to your \`settings.json\`
- **Hyper**: Copy config to \`~/.hyper.js\`

### Code Editors
- **VS Code**: Copy folder to \`~/.vscode/extensions/\` or load unpacked
- **Sublime Text**: Copy \`.sublime-color-scheme\` to Packages/User
- **Vim/Neovim**: Copy to \`~/.vim/colors/\` or \`~/.config/nvim/colors/\`
- **JetBrains**: Import \`.icls\` via Settings > Editor > Color Scheme

### Browsers
- **Firefox**: Load as temporary extension via \`about:debugging\`
- **Chrome**: Load unpacked via \`chrome://extensions\` (dev mode)

### Apps
- **Slack**: Paste the theme string in Preferences > Themes > Custom
- **Raycast**: Double-click \`.raycasttheme\` to import
- **Insomnia**: Copy folder to Insomnia plugins directory

## Support

If you have any issues or questions:
- Email: support@theme-bundle-pro.xyz
- Website: https://theme-bundle-pro.xyz

## License

This theme is licensed for personal and commercial use.
See LICENSE.md for full terms.

---

Generated by Theme Bundle Pro
https://theme-bundle-pro.xyz
`;
}

/**
 * Generate LICENSE file for dual theme
 */
function generateDualLicense(config: DualThemeConfig): string {
  return `# Theme Bundle Pro License

## ${config.displayName} Theme (Light & Dark)

Copyright (c) ${new Date().getFullYear()} Theme Bundle Pro

### License Grant

You are granted a non-exclusive, worldwide license to:

1. **Use** this theme for personal and commercial projects
2. **Modify** the theme files for your own use
3. **Include** this theme in products you distribute (with attribution)

### Restrictions

You may NOT:

1. **Resell** this theme or derivative works as a standalone product
2. **Redistribute** this theme in a theme marketplace or similar
3. **Remove** attribution or claim the theme as your original work

### Attribution

When using this theme in a public project, a credit to Theme Bundle Pro
is appreciated but not required.

### No Warranty

This theme is provided "as is" without warranty of any kind.
Theme Bundle Pro is not liable for any damages arising from use.

### Contact

For licensing questions or commercial inquiries:
- Email: support@theme-bundle-pro.xyz
- Website: https://theme-bundle-pro.xyz

---

Thank you for supporting Theme Bundle Pro!
`;
}

/**
 * Export for testing
 */
export { generateReadme, generateLicense, generateDualReadme, generateDualLicense };
