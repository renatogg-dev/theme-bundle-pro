"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* Window chrome component for realistic app frames */
function WindowChrome({
  title,
  variant = "dark",
  children,
}: {
  title: string;
  variant?: "dark" | "light";
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border shadow-lg">
      {/* Title bar */}
      <div
        className={`flex items-center gap-2 px-3 py-2 ${
          variant === "dark" ? "bg-muted/80" : "bg-muted/50"
        }`}
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="flex-1 text-center text-[10px] font-medium text-muted-foreground">
          {title}
        </span>
        <div className="w-[52px]" /> {/* Spacer for centering */}
      </div>
      {/* Content */}
      <div className="bg-background">{children}</div>
    </div>
  );
}

/* VS Code style editor preview */
function EditorPreview() {
  return (
    <WindowChrome title="theme.config.ts — VS Code">
      <div className="flex">
        {/* Line numbers */}
        <div className="select-none border-r border-border/50 bg-muted/20 px-2 py-3 text-right font-mono text-[10px] leading-5 text-muted-foreground/50">
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          <div>5</div>
          <div>6</div>
          <div>7</div>
        </div>
        {/* Code content */}
        <div className="flex-1 overflow-hidden p-3 font-mono text-[11px] leading-5">
          <div>
            <span className="syntax-keyword">import</span>{" "}
            <span className="text-foreground">{"{"}</span>{" "}
            <span className="syntax-function">defineTheme</span>{" "}
            <span className="text-foreground">{"}"}</span>{" "}
            <span className="syntax-keyword">from</span>{" "}
            <span className="syntax-string">&apos;@theme/core&apos;</span>
          </div>
          <div className="syntax-comment">{"// "} Theme configuration</div>
          <div>
            <span className="syntax-keyword">export const</span>{" "}
            <span className="syntax-function">theme</span>{" "}
            <span className="text-muted-foreground">=</span>{" "}
            <span className="syntax-function">defineTheme</span>
            <span className="text-foreground">({"{"}</span>
          </div>
          <div>
            {"  "}
            <span className="syntax-property">name</span>
            <span className="text-muted-foreground">:</span>{" "}
            <span className="syntax-string">&apos;Deep Space&apos;</span>
            <span className="text-foreground">,</span>
          </div>
          <div>
            {"  "}
            <span className="syntax-property">type</span>
            <span className="text-muted-foreground">:</span>{" "}
            <span className="syntax-string">&apos;dark&apos;</span>
            <span className="text-foreground">,</span>
          </div>
          <div>
            {"  "}
            <span className="syntax-property">colors</span>
            <span className="text-muted-foreground">:</span>{" "}
            <span className="text-foreground">{"{ "}</span>
            <span className="syntax-property">primary</span>
            <span className="text-muted-foreground">:</span>{" "}
            <span className="syntax-string">&apos;#7c3aed&apos;</span>
            <span className="text-foreground">{" }"}</span>
          </div>
          <div>
            <span className="text-foreground">{"})"}</span>
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

/* Terminal preview with ANSI colors */
function TerminalPreview() {
  return (
    <WindowChrome title="Terminal — zsh">
      <div className="bg-background p-3 font-mono text-[11px] leading-5">
        <div className="flex items-center gap-1">
          <span className="term-prompt">➜</span>{" "}
          <span className="term-path font-semibold">theme-bundle</span>{" "}
          <span className="term-branch">git:(</span>
          <span className="term-error">main</span>
          <span className="term-branch">)</span>{" "}
          <span className="text-foreground">npm run build</span>
        </div>
        <div className="mt-1 text-muted-foreground">
          <span className="term-prompt">✔</span> Compiled successfully in{" "}
          <span className="term-success">1.2s</span>
        </div>
        <div className="text-muted-foreground">
          <span className="term-path">→</span> Generated{" "}
          <span className="text-foreground">19</span> theme files
        </div>
        {/* ANSI color palette row */}
        <div className="mt-2 flex gap-1">
          <span className="ansi-white h-3 w-3 rounded-sm" title="white" />
          <span className="ansi-gray h-3 w-3 rounded-sm" title="gray" />
          <span className="ansi-red h-3 w-3 rounded-sm" title="red" />
          <span className="ansi-green h-3 w-3 rounded-sm" title="green" />
          <span className="ansi-yellow h-3 w-3 rounded-sm" title="yellow" />
          <span className="ansi-blue h-3 w-3 rounded-sm" title="blue" />
          <span className="ansi-magenta h-3 w-3 rounded-sm" title="magenta" />
          <span className="ansi-cyan h-3 w-3 rounded-sm" title="cyan" />
        </div>
        <div className="mt-1 flex items-center gap-1">
          <span className="term-prompt">➜</span>{" "}
          <span className="term-path font-semibold">theme-bundle</span>{" "}
          <span className="animate-pulse text-primary">▊</span>
        </div>
      </div>
    </WindowChrome>
  );
}

/* GitHub-style diff preview */
function DiffPreview() {
  return (
    <WindowChrome title="README.md — Changes" variant="light">
      <div className="font-mono text-[11px] leading-5">
        {/* Diff header */}
        <div className="border-b border-border/50 bg-muted/30 px-3 py-1.5 text-muted-foreground">
          @@ -1,4 +1,6 @@ Theme Bundle
        </div>
        {/* Context line */}
        <div className="flex border-b border-border/30 bg-background">
          <span className="w-8 select-none border-r border-border/30 bg-muted/20 px-1.5 text-right text-muted-foreground/50">
            1
          </span>
          <span className="flex-1 px-2 text-muted-foreground">
            # Theme Bundle
          </span>
        </div>
        {/* Added line */}
        <div className="diff-added-bg flex border-b border-border/30">
          <span className="diff-added-gutter diff-added-text w-8 select-none border-r px-1.5 text-right">
            +
          </span>
          <span className="flex-1 px-2 text-foreground">
            <span className="diff-added-text">+</span> Multi-platform theme exporter
          </span>
        </div>
        {/* Added line */}
        <div className="diff-added-bg flex border-b border-border/30">
          <span className="diff-added-gutter diff-added-text w-8 select-none border-r px-1.5 text-right">
            +
          </span>
          <span className="flex-1 px-2 text-foreground">
            <span className="diff-added-text">+</span> Supports 19+ applications
          </span>
        </div>
        {/* Removed line */}
        <div className="diff-removed-bg flex border-b border-border/30">
          <span className="diff-removed-gutter diff-removed-text w-8 select-none border-r px-1.5 text-right">
            −
          </span>
          <span className="flex-1 px-2 text-muted-foreground line-through">
            <span className="diff-removed-text">−</span> Manual config required
          </span>
        </div>
        {/* Context line */}
        <div className="flex bg-background">
          <span className="w-8 select-none border-r border-border/30 bg-muted/20 px-1.5 text-right text-muted-foreground/50">
            5
          </span>
          <span className="flex-1 px-2 text-muted-foreground">
            ## Installation
          </span>
        </div>
      </div>
    </WindowChrome>
  );
}

export function PreviewApp() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Platform Previews</CardTitle>
        <p className="text-sm text-muted-foreground">
          See how your theme looks across different tools
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <EditorPreview />
        <div className="grid gap-4 md:grid-cols-2">
          <TerminalPreview />
          <DiffPreview />
        </div>
      </CardContent>
    </Card>
  );
}
