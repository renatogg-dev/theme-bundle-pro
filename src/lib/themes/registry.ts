import type { ThemeDefinition, ThemeId } from "./types";

/**
 * Complete Theme Registry
 * All 13 themes with their metadata and color previews
 */
export const themeRegistry: ThemeDefinition[] = [
  // ============================================
  // FLAGSHIP THEMES (Original, CLI-inspired)
  // ============================================
  {
    id: "deep-space",
    name: "Deep Space",
    description: "High-fidelity evolution of classic night themes. Deep void backgrounds with neon cyan and violet accents.",
    category: "flagship",
    inspiration: "Tokyo Night / Dracula",
    colors: {
      light: {
        background: "#f0f4f8",
        foreground: "#1f2937",
        primary: "#00a3cc",
        secondary: "#3b5998",
        accent: "#8b5cf6",
        muted: "#e5e9ef",
      },
      dark: {
        background: "#0f1117",
        foreground: "#d1d5e0",
        primary: "#00d4ff",
        secondary: "#4a90ff",
        accent: "#a855f7",
        muted: "#1e2330",
      },
    },
    tags: ["neon", "cyan", "space", "modern", "dark-focused"],
  },
  {
    id: "mint-carbon",
    name: "Mint Carbon",
    description: "Hacker minimalist aesthetic refined for corporate dashboards. Matte charcoal with elegant mint green.",
    category: "flagship",
    inspiration: "Terminal / Matrix",
    colors: {
      light: {
        background: "#f5f7f6",
        foreground: "#252828",
        primary: "#1f8a55",
        secondary: "#1a5c3e",
        accent: "#339988",
        muted: "#e8ebe9",
      },
      dark: {
        background: "#181a1a",
        foreground: "#e3e8e5",
        primary: "#2eb872",
        secondary: "#2d5c45",
        accent: "#26c9a8",
        muted: "#252828",
      },
    },
    tags: ["terminal", "green", "minimal", "corporate", "hacker"],
  },
  {
    id: "solar-flare",
    name: "Solar Flare",
    description: "Warm schemes adapted for high contrast and vibrant energy. Amber and red for dynamic interfaces.",
    category: "flagship",
    inspiration: "Gruvbox / Monokai",
    colors: {
      light: {
        background: "#fef7ed",
        foreground: "#2a2420",
        primary: "#d97706",
        secondary: "#ea580c",
        accent: "#dc2626",
        muted: "#f3e8db",
      },
      dark: {
        background: "#1d1816",
        foreground: "#efe0c8",
        primary: "#f59e0b",
        secondary: "#ea580c",
        accent: "#ef4444",
        muted: "#2a231e",
      },
    },
    tags: ["warm", "orange", "energetic", "bold", "contrast"],
  },

  // ============================================
  // LEGACY COLLECTION (Classic CLI themes)
  // ============================================
  {
    id: "dracula",
    name: "Dracula",
    description: "The iconic dark theme for code editors. Purple and pink with cyan highlights.",
    category: "legacy",
    origin: "draculatheme.com",
    colors: {
      light: {
        background: "#f4f3f7",
        foreground: "#282a36",
        primary: "#9063d4",
        secondary: "#e84a9c",
        accent: "#2cb5c7",
        muted: "#e8e6ed",
      },
      dark: {
        background: "#282a36",
        foreground: "#f8f8f2",
        primary: "#bd93f9",
        secondary: "#ff79c6",
        accent: "#8be9fd",
        muted: "#44475a",
      },
    },
    tags: ["purple", "pink", "iconic", "vampire", "classic"],
  },
  {
    id: "nord",
    name: "Nord",
    description: "Arctic, north-bluish color palette. Clean and calm with aurora accents.",
    category: "legacy",
    origin: "nordtheme.com",
    colors: {
      light: {
        background: "#eceff4",
        foreground: "#2e3440",
        primary: "#5e81ac",
        secondary: "#b48ead",
        accent: "#8fbcbb",
        muted: "#d8dee9",
      },
      dark: {
        background: "#2e3440",
        foreground: "#d8dee9",
        primary: "#88c0d0",
        secondary: "#b48ead",
        accent: "#8fbcbb",
        muted: "#434c5e",
      },
    },
    tags: ["arctic", "blue", "calm", "frost", "scandinavian"],
  },
  {
    id: "monokai",
    name: "Monokai",
    description: "Iconic Sublime Text color scheme. Vibrant pink, green, and yellow on dark.",
    category: "legacy",
    origin: "monokai.pro",
    colors: {
      light: {
        background: "#f8f8f2",
        foreground: "#272822",
        primary: "#c41b5a",
        secondary: "#8f5fd6",
        accent: "#6d9a1f",
        muted: "#eeeeee",
      },
      dark: {
        background: "#272822",
        foreground: "#f8f8f2",
        primary: "#f92672",
        secondary: "#ae81ff",
        accent: "#a6e22e",
        muted: "#3e3d32",
      },
    },
    tags: ["pink", "vibrant", "sublime", "classic", "high-contrast"],
  },
  {
    id: "gruvbox",
    name: "Gruvbox",
    description: "Retro groove with warm, earthy tones. Orange, green, and yellow palette.",
    category: "legacy",
    origin: "github.com/morhetz/gruvbox",
    colors: {
      light: {
        background: "#fbf1c7",
        foreground: "#282828",
        primary: "#d65d0e",
        secondary: "#427b58",
        accent: "#d79921",
        muted: "#ebdbb2",
      },
      dark: {
        background: "#282828",
        foreground: "#ebdbb2",
        primary: "#fe8019",
        secondary: "#8ec07c",
        accent: "#fabd2f",
        muted: "#3c3836",
      },
    },
    tags: ["retro", "warm", "earthy", "orange", "cozy"],
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    description: "Clean theme celebrating the lights of Tokyo at night. Blue and purple neons.",
    category: "legacy",
    origin: "github.com/enkia/tokyo-night-vscode-theme",
    colors: {
      light: {
        background: "#e1e2e7",
        foreground: "#343b58",
        primary: "#2959c5",
        secondary: "#7847bd",
        accent: "#1898c7",
        muted: "#d5d6db",
      },
      dark: {
        background: "#1a1b26",
        foreground: "#a9b1d6",
        primary: "#7aa2f7",
        secondary: "#bb9af7",
        accent: "#7dcfff",
        muted: "#292e42",
      },
    },
    tags: ["tokyo", "neon", "blue", "night", "city"],
  },
  {
    id: "catppuccin",
    name: "Catppuccin",
    description: "Soothing pastel theme with soft, muted colors. Mauve, pink, and lavender.",
    category: "legacy",
    origin: "catppuccin.com",
    colors: {
      light: {
        background: "#eff1f5",
        foreground: "#4c4f69",
        primary: "#8839ef",
        secondary: "#dd7bbb",
        accent: "#7287fd",
        muted: "#ccd0da",
      },
      dark: {
        background: "#1e1e2e",
        foreground: "#cdd6f4",
        primary: "#cba6f7",
        secondary: "#f5c2e7",
        accent: "#b4befe",
        muted: "#45475a",
      },
    },
    tags: ["pastel", "soft", "cozy", "purple", "soothing"],
  },
  {
    id: "one-dark",
    name: "One Dark",
    description: "Atom editor's signature theme. Clean, balanced with muted yet vibrant accents.",
    category: "legacy",
    origin: "Atom Editor",
    colors: {
      light: {
        background: "#fafafa",
        foreground: "#383a42",
        primary: "#0083c9",
        secondary: "#a626a4",
        accent: "#0e8b93",
        muted: "#e5e5e6",
      },
      dark: {
        background: "#282c34",
        foreground: "#abb2bf",
        primary: "#61afef",
        secondary: "#c678dd",
        accent: "#56b6c2",
        muted: "#3e4451",
      },
    },
    tags: ["atom", "balanced", "blue", "professional", "clean"],
  },
  {
    id: "synthwave",
    name: "Synthwave",
    description: "Retro-futuristic 80s neon aesthetic. Hot pink, cyan, and electric purple.",
    category: "legacy",
    origin: "Synthwave '84 VSCode",
    colors: {
      light: {
        background: "#f5f0f8",
        foreground: "#34254d",
        primary: "#e020a0",
        secondary: "#14b881",
        accent: "#f04830",
        muted: "#e8e0f0",
      },
      dark: {
        background: "#262335",
        foreground: "#e0d0f0",
        primary: "#ff7edb",
        secondary: "#72f1b8",
        accent: "#f97e72",
        muted: "#3d3855",
      },
    },
    tags: ["80s", "neon", "retro", "pink", "futuristic"],
  },
  {
    id: "solarized",
    name: "Solarized",
    description: "Precision colors for machines and people. Carefully designed for readability.",
    category: "legacy",
    origin: "ethanschoonover.com/solarized",
    colors: {
      light: {
        background: "#fdf6e3",
        foreground: "#657b83",
        primary: "#268bd2",
        secondary: "#6c71c4",
        accent: "#2aa198",
        muted: "#eee8d5",
      },
      dark: {
        background: "#002b36",
        foreground: "#839496",
        primary: "#268bd2",
        secondary: "#6c71c4",
        accent: "#2aa198",
        muted: "#073642",
      },
    },
    tags: ["scientific", "precise", "readable", "blue", "teal"],
  },
  {
    id: "github",
    name: "GitHub",
    description: "Clean and professional GitHub interface colors. Highly readable and familiar.",
    category: "legacy",
    origin: "github.com",
    colors: {
      light: {
        background: "#ffffff",
        foreground: "#24292f",
        primary: "#0969da",
        secondary: "#8250df",
        accent: "#1a7f37",
        muted: "#f6f8fa",
      },
      dark: {
        background: "#0d1117",
        foreground: "#c9d1d9",
        primary: "#58a6ff",
        secondary: "#a371f7",
        accent: "#3fb950",
        muted: "#21262d",
      },
    },
    tags: ["professional", "clean", "familiar", "blue", "minimal"],
  },
];

// Helper functions
export const flagshipThemes = themeRegistry.filter((t) => t.category === "flagship");
export const legacyThemes = themeRegistry.filter((t) => t.category === "legacy");

export function getThemeById(id: ThemeId): ThemeDefinition | undefined {
  return themeRegistry.find((t) => t.id === id);
}

export function getThemePreviewColors(id: ThemeId, mode: "light" | "dark"): [string, string, string] {
  const theme = getThemeById(id);
  if (!theme) return ["#888", "#666", "#444"];
  
  const colors = theme.colors[mode];
  return [colors.primary, colors.secondary, colors.accent];
}

// Default theme
export const DEFAULT_THEME_ID: ThemeId = "deep-space";
