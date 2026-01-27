/**
 * Vim/Neovim Exporter
 * Generates .vim colorscheme file
 */

import {
  type ThemeConfig,
  type ExportResult,
  toHex,
  getAnsiColors,
  hslToRgb,
} from "./types";

function guiColor(hsl: { h: number; s: number; l: number }): string {
  return toHex(hsl);
}

function ctermColor(hsl: { h: number; s: number; l: number }): number {
  // Convert to closest xterm-256 color
  const { r, g, b } = hslToRgb(hsl);
  
  // Grayscale ramp (232-255)
  if (r === g && g === b) {
    if (r < 8) return 16;
    if (r > 248) return 231;
    return Math.round((r - 8) / 10) + 232;
  }
  
  // Color cube (16-231)
  const toColorCube = (v: number) => {
    if (v < 48) return 0;
    if (v < 115) return 1;
    return Math.min(5, Math.floor((v - 35) / 40));
  };
  
  return 16 + 36 * toColorCube(r) + 6 * toColorCube(g) + toColorCube(b);
}

export function exportVim(theme: ThemeConfig): ExportResult {
  const { colors, name, displayName, author } = theme;
  const ansi = getAnsiColors(colors);
  const isDark = colors.background.l < 50;

  const hi = (
    group: string,
    fg?: { h: number; s: number; l: number },
    bg?: { h: number; s: number; l: number },
    style?: string
  ): string => {
    const parts = [`hi ${group}`];
    
    if (fg) {
      parts.push(`guifg=${guiColor(fg)}`);
      parts.push(`ctermfg=${ctermColor(fg)}`);
    } else {
      parts.push("guifg=NONE");
      parts.push("ctermfg=NONE");
    }
    
    if (bg) {
      parts.push(`guibg=${guiColor(bg)}`);
      parts.push(`ctermbg=${ctermColor(bg)}`);
    } else {
      parts.push("guibg=NONE");
      parts.push("ctermbg=NONE");
    }
    
    if (style) {
      parts.push(`gui=${style}`);
      parts.push(`cterm=${style}`);
    } else {
      parts.push("gui=NONE");
      parts.push("cterm=NONE");
    }
    
    return parts.join(" ");
  };

  const vimscript = `" ${displayName} - Vim color scheme
" Author: ${author || "Theme Bundle"}
" Maintainer: Theme Bundle (https://themebundle.com)
" License: MIT

" Reset
hi clear
if exists("syntax_on")
  syntax reset
endif

let g:colors_name = "${name}"
set background=${isDark ? "dark" : "light"}

" Terminal colors (Neovim)
if has('nvim')
  let g:terminal_color_0 = '${guiColor(ansi.black)}'
  let g:terminal_color_1 = '${guiColor(ansi.red)}'
  let g:terminal_color_2 = '${guiColor(ansi.green)}'
  let g:terminal_color_3 = '${guiColor(ansi.yellow)}'
  let g:terminal_color_4 = '${guiColor(ansi.blue)}'
  let g:terminal_color_5 = '${guiColor(ansi.magenta)}'
  let g:terminal_color_6 = '${guiColor(ansi.cyan)}'
  let g:terminal_color_7 = '${guiColor(ansi.white)}'
  let g:terminal_color_8 = '${guiColor(ansi.brightBlack)}'
  let g:terminal_color_9 = '${guiColor(ansi.brightRed)}'
  let g:terminal_color_10 = '${guiColor(ansi.brightGreen)}'
  let g:terminal_color_11 = '${guiColor(ansi.brightYellow)}'
  let g:terminal_color_12 = '${guiColor(ansi.brightBlue)}'
  let g:terminal_color_13 = '${guiColor(ansi.brightMagenta)}'
  let g:terminal_color_14 = '${guiColor(ansi.brightCyan)}'
  let g:terminal_color_15 = '${guiColor(ansi.brightWhite)}'
endif

" Editor UI
${hi("Normal", colors.foreground, colors.background)}
${hi("NormalFloat", colors.popoverForeground, colors.popover)}
${hi("Cursor", colors.background, colors.primary)}
${hi("CursorLine", undefined, colors.card)}
${hi("CursorColumn", undefined, colors.card)}
${hi("LineNr", colors.mutedForeground, undefined)}
${hi("CursorLineNr", colors.foreground, colors.card, "bold")}
${hi("SignColumn", undefined, colors.background)}
${hi("VertSplit", colors.border, undefined)}
${hi("StatusLine", colors.foreground, colors.card)}
${hi("StatusLineNC", colors.mutedForeground, colors.muted)}
${hi("TabLine", colors.mutedForeground, colors.card)}
${hi("TabLineFill", undefined, colors.card)}
${hi("TabLineSel", colors.foreground, colors.background, "bold")}
${hi("Pmenu", colors.popoverForeground, colors.popover)}
${hi("PmenuSel", colors.background, colors.primary)}
${hi("PmenuSbar", undefined, colors.muted)}
${hi("PmenuThumb", undefined, colors.primary)}
${hi("Visual", undefined, colors.muted)}
${hi("Search", colors.background, colors.accent)}
${hi("IncSearch", colors.background, colors.primary, "bold")}
${hi("MatchParen", colors.primary, undefined, "bold")}
${hi("Folded", colors.mutedForeground, colors.card)}
${hi("FoldColumn", colors.mutedForeground, colors.background)}

" Syntax highlighting
${hi("Comment", colors.mutedForeground, undefined, "italic")}
${hi("String", ansi.green, undefined)}
${hi("Character", ansi.green, undefined)}
${hi("Number", ansi.magenta, undefined)}
${hi("Boolean", ansi.magenta, undefined)}
${hi("Float", ansi.magenta, undefined)}
${hi("Identifier", colors.foreground, undefined)}
${hi("Function", ansi.blue, undefined)}
${hi("Statement", ansi.red, undefined)}
${hi("Conditional", ansi.red, undefined)}
${hi("Repeat", ansi.red, undefined)}
${hi("Label", ansi.red, undefined)}
${hi("Operator", colors.foreground, undefined)}
${hi("Keyword", ansi.red, undefined)}
${hi("Exception", ansi.red, undefined)}
${hi("PreProc", ansi.cyan, undefined)}
${hi("Include", ansi.cyan, undefined)}
${hi("Define", ansi.cyan, undefined)}
${hi("Macro", ansi.cyan, undefined)}
${hi("PreCondit", ansi.cyan, undefined)}
${hi("Type", ansi.yellow, undefined)}
${hi("StorageClass", ansi.yellow, undefined)}
${hi("Structure", ansi.yellow, undefined)}
${hi("Typedef", ansi.yellow, undefined)}
${hi("Special", ansi.cyan, undefined)}
${hi("SpecialChar", ansi.magenta, undefined)}
${hi("Tag", ansi.red, undefined)}
${hi("Delimiter", colors.foreground, undefined)}
${hi("SpecialComment", colors.mutedForeground, undefined, "bold")}
${hi("Debug", ansi.red, undefined)}
${hi("Underlined", colors.primary, undefined, "underline")}
${hi("Error", colors.destructive, undefined)}
${hi("Todo", colors.accent, undefined, "bold")}
${hi("Title", ansi.blue, undefined, "bold")}

" Diff
${hi("DiffAdd", ansi.green, undefined)}
${hi("DiffChange", ansi.yellow, undefined)}
${hi("DiffDelete", ansi.red, undefined)}
${hi("DiffText", ansi.blue, undefined, "bold")}

" Git signs
${hi("GitSignsAdd", ansi.green, undefined)}
${hi("GitSignsChange", ansi.yellow, undefined)}
${hi("GitSignsDelete", ansi.red, undefined)}

" Diagnostics
${hi("DiagnosticError", colors.destructive, undefined)}
${hi("DiagnosticWarn", ansi.yellow, undefined)}
${hi("DiagnosticInfo", ansi.blue, undefined)}
${hi("DiagnosticHint", ansi.cyan, undefined)}

" vim: sw=2 ts=2 et
`;

  return {
    filename: `${name}.vim`,
    content: vimscript,
    platform: "vim",
    subfolder: "colors",
  };
}
