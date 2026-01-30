/**
 * Color Utility Functions
 * HSL <-> HEX conversions for the Theme Generator
 */

export interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

/**
 * Convert HEX color to HSL
 * @param hex - Hex color string (with or without #)
 * @returns HSLColor object
 */
export function hexToHsl(hex: string): HSLColor {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * Convert HSL color to RGB
 * @param hsl - HSLColor object
 * @returns RGBColor object
 */
export function hslToRgb(hsl: HSLColor): RGBColor {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert HSL color to HEX
 * @param hsl - HSLColor object
 * @returns Hex color string with #
 */
export function hslToHex(hsl: HSLColor): string {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert HSLColor to CSS variable format
 * @param hsl - HSLColor object
 * @returns CSS HSL string without hsl() wrapper (e.g., "220 70% 50%")
 */
export function hslToCSS(hsl: HSLColor): string {
  return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
}

/**
 * Parse CSS HSL string to HSLColor object
 * Supports formats: "220 70% 50%" or "220, 70%, 50%"
 * @param css - CSS HSL string
 * @returns HSLColor object
 */
export function parseHSLString(css: string): HSLColor {
  // Remove any hsl() wrapper if present
  css = css.replace(/hsl\(|\)/g, "").trim();
  
  // Split by space or comma
  const parts = css.split(/[\s,]+/).map((part) => parseFloat(part));

  return {
    h: parts[0] || 0,
    s: parts[1] || 0,
    l: parts[2] || 0,
  };
}

/**
 * Validate if a string is a valid hex color
 * @param hex - Potential hex color string
 * @returns boolean
 */
export function isValidHex(hex: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Ensure hex color has # prefix
 * @param hex - Hex color string
 * @returns Hex color with # prefix
 */
export function normalizeHex(hex: string): string {
  if (!hex.startsWith("#")) {
    return `#${hex}`;
  }
  return hex;
}

/**
 * Calculate relative luminance for contrast calculations
 * @param hex - Hex color string
 * @returns Luminance value 0-1
 */
export function getLuminance(hex: string): number {
  hex = hex.replace(/^#/, "");
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Determine if text should be light or dark for optimal contrast
 * @param backgroundHex - Background color in hex
 * @returns "light" or "dark"
 */
export function getContrastingTextColor(backgroundHex: string): "light" | "dark" {
  const luminance = getLuminance(backgroundHex);
  return luminance > 0.179 ? "dark" : "light";
}
