# Theme Bundle

Create, customize, and export color themes for 19 platforms — terminals, editors, browsers, and apps. 13 premium presets with Light and Dark modes included.

## Features

- **13 Premium Themes**: 3 original Flagships + 10 classic CLI-inspired themes
- **26 Total Variations**: Every theme has both Light and Dark modes
- **WCAG AA Compliant**: All color combinations tested for accessibility
- **Instant Theme Switching**: Change themes at runtime with smooth CSS transitions
- **TypeScript Support**: Full type definitions included
- **next-themes Integration**: Seamless dark mode support

## Themes

### Flagship (Original)
- **Deep Space** - Neon cyan on void black (Tokyo Night/Dracula inspired)
- **Mint Carbon** - Terminal green on matte charcoal
- **Solar Flare** - Warm amber on dark backgrounds (Gruvbox inspired)

### Legacy Collection
- Dracula
- Nord
- Monokai
- Gruvbox
- Tokyo Night
- Catppuccin
- One Dark
- Synthwave
- Solarized
- GitHub

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # ThemeProvider wrapper
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # Shadcn/ui components
│   ├── theme/              # Theme system components
│   │   ├── providers/      # ThemeProvider
│   │   ├── mode-toggle.tsx # Light/Dark toggle
│   │   └── theme-marketplace.tsx
│   ├── preview/            # Dashboard preview components
│   └── sections/           # Landing page sections
├── lib/
│   ├── themes/             # Theme registry and types
│   └── utils.ts
├── hooks/
│   └── use-theme.ts        # Combined theme hook
└── styles/
    ├── globals.css         # Main CSS with all themes
    └── themes/             # Individual theme files
        ├── _variables.css
        ├── flagships/
        └── legacy/
```

## Theme Architecture

The theme system uses a bidimensional approach:
- `data-theme` attribute: Controls the color palette (e.g., "dracula", "nord")
- `class` attribute: Controls Light/Dark mode (managed by next-themes)

```html
<!-- Light mode with Dracula colors -->
<html class="light" data-theme="dracula">

<!-- Dark mode with Dracula colors -->
<html class="dark" data-theme="dracula">
```

### CSS Selectors

```css
/* Light mode (default) */
[data-theme="dracula"] {
  --background: 250 15% 96%;
  --primary: 265 70% 55%;
}

/* Dark mode */
.dark[data-theme="dracula"] {
  --background: 231 15% 18%;
  --primary: 265 89% 78%;
}
```

## Usage

### ThemeProvider

Wrap your app with the ThemeProvider:

```tsx
import { ThemeProvider } from "@/components/theme/providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

### Theme Selection

```tsx
import { useThemeId } from "@/components/theme/providers";

function ThemeSelector() {
  const { themeId, setThemeId } = useThemeId();
  
  return (
    <button onClick={() => setThemeId("dracula")}>
      Switch to Dracula
    </button>
  );
}
```

### Mode Toggle

```tsx
import { ModeToggle } from "@/components/theme/mode-toggle";

function Header() {
  return (
    <header>
      <ModeToggle />
    </header>
  );
}
```

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS 3.4
- next-themes
- Radix UI primitives
- Lucide React icons
- TypeScript

## License

MIT
