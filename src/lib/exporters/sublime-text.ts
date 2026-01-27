/**
 * Sublime Text Exporter
 * Generates .sublime-color-scheme JSON file
 */

import {
  type ThemeConfig,
  type ExportResult,
  toHex,
  getAnsiColors,
  lighten,
} from "./types";

export function exportSublimeText(theme: ThemeConfig): ExportResult {
  const { colors, name, displayName, author } = theme;
  const ansi = getAnsiColors(colors);
  const isDark = colors.background.l < 50;

  const scheme = {
    name: displayName,
    author: author || "Theme Bundle",
    variables: {
      // Base
      background: toHex(colors.background),
      foreground: toHex(colors.foreground),
      caret: toHex(colors.primary),
      selection: toHex(colors.muted),
      line_highlight: toHex(isDark ? lighten(colors.background, 5) : colors.muted),
      gutter: toHex(colors.card),
      gutter_foreground: toHex(colors.mutedForeground),
      // Syntax
      comment: toHex(colors.mutedForeground),
      string: toHex(ansi.green),
      number: toHex(ansi.magenta),
      keyword: toHex(ansi.red),
      function: toHex(ansi.blue),
      class: toHex(ansi.yellow),
      variable: toHex(colors.foreground),
      tag: toHex(ansi.red),
      attribute: toHex(ansi.yellow),
      property: toHex(ansi.cyan),
      // UI
      accent: toHex(colors.primary),
      error: toHex(colors.destructive),
      warning: toHex(ansi.yellow),
      info: toHex(ansi.blue),
      success: toHex(ansi.green),
    },
    globals: {
      background: "var(background)",
      foreground: "var(foreground)",
      caret: "var(caret)",
      block_caret: "var(caret)",
      selection: "var(selection)",
      selection_border: "var(accent)",
      line_highlight: "var(line_highlight)",
      gutter: "var(gutter)",
      gutter_foreground: "var(gutter_foreground)",
      find_highlight: "var(accent)",
      find_highlight_foreground: "var(background)",
      brackets_foreground: "var(accent)",
      brackets_options: "underline",
      bracket_contents_foreground: "var(accent)",
      bracket_contents_options: "underline",
      tags_foreground: "var(accent)",
      tags_options: "stippled_underline",
      shadow: "color(var(background) blend(#000 75%))",
      accent: "var(accent)",
    },
    rules: [
      {
        name: "Comment",
        scope: "comment, punctuation.definition.comment",
        foreground: "var(comment)",
        font_style: "italic",
      },
      {
        name: "String",
        scope: "string",
        foreground: "var(string)",
      },
      {
        name: "Number",
        scope: "constant.numeric",
        foreground: "var(number)",
      },
      {
        name: "Built-in constant",
        scope: "constant.language",
        foreground: "var(number)",
      },
      {
        name: "Keyword",
        scope: "keyword, storage.type, storage.modifier",
        foreground: "var(keyword)",
      },
      {
        name: "Operator",
        scope: "keyword.operator",
        foreground: "var(foreground)",
      },
      {
        name: "Function name",
        scope: "entity.name.function, support.function",
        foreground: "var(function)",
      },
      {
        name: "Class name",
        scope: "entity.name.class, entity.name.type, support.class",
        foreground: "var(class)",
      },
      {
        name: "Variable",
        scope: "variable, variable.parameter",
        foreground: "var(variable)",
      },
      {
        name: "Tag name",
        scope: "entity.name.tag",
        foreground: "var(tag)",
      },
      {
        name: "Attribute name",
        scope: "entity.other.attribute-name",
        foreground: "var(attribute)",
      },
      {
        name: "Property name",
        scope: "support.type.property-name, meta.object-literal.key",
        foreground: "var(property)",
      },
      {
        name: "Invalid",
        scope: "invalid",
        foreground: "var(foreground)",
        background: "var(error)",
      },
      {
        name: "Markup heading",
        scope: "markup.heading",
        foreground: "var(function)",
        font_style: "bold",
      },
      {
        name: "Markup bold",
        scope: "markup.bold",
        font_style: "bold",
      },
      {
        name: "Markup italic",
        scope: "markup.italic",
        font_style: "italic",
      },
      {
        name: "Markup link",
        scope: "markup.underline.link",
        foreground: "var(accent)",
      },
    ],
  };

  return {
    filename: `${name}.sublime-color-scheme`,
    content: JSON.stringify(scheme, null, 2),
    platform: "sublime-text",
  };
}
