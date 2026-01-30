"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Code, Globe, MessageSquare } from "lucide-react";

interface BuyerPreviewProps {
  cssVariables: React.CSSProperties;
}

/* Window chrome component for realistic app frames */
function WindowChrome({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))]">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(var(--muted))]">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="flex-1 text-center text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
          {title}
        </span>
        <div className="w-[52px]" />
      </div>
      {/* Content */}
      <div className="bg-[hsl(var(--background))]">{children}</div>
    </div>
  );
}

/* VS Code style editor preview */
function EditorPreview() {
  return (
    <WindowChrome title="theme.config.ts — VS Code">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-10 border-r border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-2 space-y-2">
          <div className="h-5 w-5 rounded bg-[hsl(var(--primary))] opacity-80" />
          <div className="h-5 w-5 rounded bg-[hsl(var(--muted-foreground))] opacity-30" />
          <div className="h-5 w-5 rounded bg-[hsl(var(--muted-foreground))] opacity-30" />
        </div>
        {/* Line numbers */}
        <div className="select-none border-r border-[hsl(var(--border))] bg-[hsl(var(--muted))] bg-opacity-20 px-2 py-3 text-right font-mono text-[10px] leading-5 text-[hsl(var(--muted-foreground))] opacity-50">
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
            <span className="text-[hsl(var(--primary))]">import</span>{" "}
            <span className="text-[hsl(var(--foreground))]">{"{"}</span>{" "}
            <span className="text-[hsl(var(--accent))]">defineTheme</span>{" "}
            <span className="text-[hsl(var(--foreground))]">{"}"}</span>{" "}
            <span className="text-[hsl(var(--primary))]">from</span>{" "}
            <span className="text-[hsl(var(--secondary))]">&apos;@theme/core&apos;</span>
          </div>
          <div className="text-[hsl(var(--muted-foreground))]">{"// "} Theme configuration</div>
          <div>
            <span className="text-[hsl(var(--primary))]">export const</span>{" "}
            <span className="text-[hsl(var(--accent))]">theme</span>{" "}
            <span className="text-[hsl(var(--muted-foreground))]">=</span>{" "}
            <span className="text-[hsl(var(--accent))]">defineTheme</span>
            <span className="text-[hsl(var(--foreground))]">({"{"}</span>
          </div>
          <div>
            {"  "}
            <span className="text-[hsl(var(--foreground))]">name</span>
            <span className="text-[hsl(var(--muted-foreground))]">:</span>{" "}
            <span className="text-[hsl(var(--secondary))]">&apos;Custom Theme&apos;</span>
            <span className="text-[hsl(var(--foreground))]">,</span>
          </div>
          <div>
            {"  "}
            <span className="text-[hsl(var(--foreground))]">type</span>
            <span className="text-[hsl(var(--muted-foreground))]">:</span>{" "}
            <span className="text-[hsl(var(--secondary))]">&apos;dark&apos;</span>
            <span className="text-[hsl(var(--foreground))]">,</span>
          </div>
          <div>
            {"  "}
            <span className="text-[hsl(var(--foreground))]">primary</span>
            <span className="text-[hsl(var(--muted-foreground))]">:</span>{" "}
            <span className="text-[hsl(var(--primary))] px-1 rounded bg-[hsl(var(--primary))] bg-opacity-20">&apos;#7c3aed&apos;</span>
          </div>
          <div>
            <span className="text-[hsl(var(--foreground))]">{"})"}</span>
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

/* Terminal preview with prompt and colors */
function TerminalPreview() {
  return (
    <WindowChrome title="Terminal — zsh">
      <div className="bg-[hsl(var(--background))] p-3 font-mono text-[11px] leading-5">
        <div className="flex items-center gap-1">
          <span className="text-[hsl(var(--accent))]">➜</span>{" "}
          <span className="text-[hsl(var(--primary))] font-semibold">theme-bundle</span>{" "}
          <span className="text-[hsl(var(--secondary))]">git:(</span>
          <span className="text-[hsl(var(--destructive))]">main</span>
          <span className="text-[hsl(var(--secondary))]">)</span>{" "}
          <span className="text-[hsl(var(--foreground))]">npm run build</span>
        </div>
        <div className="mt-1 text-[hsl(var(--muted-foreground))]">
          <span className="text-[hsl(var(--accent))]">✔</span> Compiled successfully in{" "}
          <span className="text-[hsl(var(--accent))]">1.2s</span>
        </div>
        <div className="text-[hsl(var(--muted-foreground))]">
          <span className="text-[hsl(var(--primary))]">→</span> Generated{" "}
          <span className="text-[hsl(var(--foreground))]">19</span> theme files
        </div>
        {/* ANSI color palette preview */}
        <div className="mt-2 flex gap-1">
          <span className="h-3 w-3 rounded-sm bg-[hsl(var(--foreground))]" title="foreground" />
          <span className="h-3 w-3 rounded-sm bg-[hsl(var(--muted-foreground))]" title="muted" />
          <span className="h-3 w-3 rounded-sm bg-[hsl(var(--destructive))]" title="red" />
          <span className="h-3 w-3 rounded-sm bg-[hsl(var(--accent))]" title="green" />
          <span className="h-3 w-3 rounded-sm bg-[hsl(var(--secondary))]" title="yellow" />
          <span className="h-3 w-3 rounded-sm bg-[hsl(var(--primary))]" title="blue" />
        </div>
        <div className="mt-1 flex items-center gap-1">
          <span className="text-[hsl(var(--accent))]">➜</span>{" "}
          <span className="text-[hsl(var(--primary))] font-semibold">theme-bundle</span>{" "}
          <span className="animate-pulse text-[hsl(var(--primary))]">▊</span>
        </div>
      </div>
    </WindowChrome>
  );
}

/* Browser preview */
function BrowserPreview() {
  return (
    <WindowChrome title="Chrome — New Tab">
      <div className="p-3 space-y-3">
        {/* URL bar */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--muted))]">
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--muted-foreground))] opacity-50" />
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--muted-foreground))] opacity-50" />
          </div>
          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
            https://themebundle.com
          </span>
        </div>
        {/* Page content */}
        <div className="space-y-2">
          <div className="h-6 w-3/4 rounded bg-[hsl(var(--primary))] opacity-80" />
          <div className="h-3 w-full rounded bg-[hsl(var(--muted-foreground))] opacity-30" />
          <div className="h-3 w-5/6 rounded bg-[hsl(var(--muted-foreground))] opacity-30" />
          <div className="flex gap-2 pt-2">
            <div className="px-3 py-1.5 rounded text-[10px] font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
              Get Started
            </div>
            <div className="px-3 py-1.5 rounded text-[10px] font-medium bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">
              Learn More
            </div>
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

/* Slack preview */
function SlackPreview() {
  return (
    <WindowChrome title="Slack">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-14 p-2 border-r border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary))] mx-auto mb-2" />
          <div className="space-y-2">
            <div className="h-6 w-6 rounded bg-[hsl(var(--muted-foreground))] opacity-30 mx-auto" />
            <div className="h-6 w-6 rounded bg-[hsl(var(--muted-foreground))] opacity-30 mx-auto" />
            <div className="h-6 w-6 rounded bg-[hsl(var(--accent))] opacity-60 mx-auto" />
          </div>
        </div>
        {/* Channel list */}
        <div className="w-24 p-2 border-r border-[hsl(var(--border))] bg-[hsl(var(--muted))] bg-opacity-50">
          <div className="text-[9px] font-semibold text-[hsl(var(--muted-foreground))] mb-1">Channels</div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 px-1 py-0.5 rounded bg-[hsl(var(--primary))] bg-opacity-20">
              <span className="text-[hsl(var(--muted-foreground))]">#</span>
              <span className="text-[9px] text-[hsl(var(--foreground))]">general</span>
            </div>
            <div className="flex items-center gap-1 px-1 py-0.5">
              <span className="text-[hsl(var(--muted-foreground))]">#</span>
              <span className="text-[9px] text-[hsl(var(--muted-foreground))]">random</span>
            </div>
          </div>
        </div>
        {/* Messages */}
        <div className="flex-1 p-2">
          <div className="flex items-start gap-2 mb-2">
            <div className="h-5 w-5 rounded bg-[hsl(var(--secondary))] flex-shrink-0" />
            <div>
              <div className="text-[9px] font-semibold text-[hsl(var(--foreground))]">User</div>
              <div className="text-[9px] text-[hsl(var(--muted-foreground))]">Theme looks great!</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded bg-[hsl(var(--accent))] flex-shrink-0" />
            <div>
              <div className="text-[9px] font-semibold text-[hsl(var(--foreground))]">Bot</div>
              <div className="text-[9px] text-[hsl(var(--muted-foreground))]">
                <span className="text-[hsl(var(--primary))]">@user</span> Thanks! 🎨
              </div>
            </div>
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

export function BuyerPreview({ cssVariables }: BuyerPreviewProps) {
  return (
    <div style={cssVariables}>
      <Tabs defaultValue="terminal" className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-4 bg-[hsl(var(--muted))]">
          <TabsTrigger value="terminal" className="text-xs gap-1.5">
            <Terminal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Terminal</span>
          </TabsTrigger>
          <TabsTrigger value="editor" className="text-xs gap-1.5">
            <Code className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Editor</span>
          </TabsTrigger>
          <TabsTrigger value="browser" className="text-xs gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Browser</span>
          </TabsTrigger>
          <TabsTrigger value="slack" className="text-xs gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Slack</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terminal" className="mt-0">
          <TerminalPreview />
        </TabsContent>

        <TabsContent value="editor" className="mt-0">
          <EditorPreview />
        </TabsContent>

        <TabsContent value="browser" className="mt-0">
          <BrowserPreview />
        </TabsContent>

        <TabsContent value="slack" className="mt-0">
          <SlackPreview />
        </TabsContent>
      </Tabs>
    </div>
  );
}
