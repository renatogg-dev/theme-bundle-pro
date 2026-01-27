"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PreviewCodeBlock() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="terminal-card overflow-hidden rounded-lg">
      {/* Terminal Header */}
      <div className="terminal-card-header flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="terminal-dot terminal-dot-red" />
          <div className="terminal-dot terminal-dot-yellow" />
          <div className="terminal-dot terminal-dot-green" />
          <span className="ml-2 text-xs text-muted-foreground">theme.config.ts</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto bg-card p-4 font-mono text-sm">
        <pre className="text-foreground">
          <code>
            <Line num={1}>
              <span className="token-keyword">import</span>{" "}
              <span className="token-variable">{"{ ThemeProvider, useTheme }"}</span>{" "}
              <span className="token-keyword">from</span>{" "}
              <span className="token-string">&quot;@theme-bundle/react&quot;</span>
            </Line>
            <Line num={2}>
              <span className="token-keyword">import</span>{" "}
              <span className="token-variable">{"{ themes }"}</span>{" "}
              <span className="token-keyword">from</span>{" "}
              <span className="token-string">&quot;./themes&quot;</span>
            </Line>
            <Line num={3} />
            <Line num={4}>
              <span className="token-comment">{"// Theme configuration"}</span>
            </Line>
            <Line num={5}>
              <span className="token-keyword">export const</span>{" "}
              <span className="token-function">config</span>{" "}
              <span className="token-operator">=</span> {"{"}
            </Line>
            <Line num={6}>
              {"  "}
              <span className="token-variable">defaultTheme</span>
              <span className="token-operator">:</span>{" "}
              <span className="token-string">&quot;deep-space&quot;</span>,
            </Line>
            <Line num={7}>
              {"  "}
              <span className="token-variable">defaultMode</span>
              <span className="token-operator">:</span>{" "}
              <span className="token-string">&quot;dark&quot;</span>,
            </Line>
            <Line num={8}>
              {"  "}
              <span className="token-variable">themes</span>
              <span className="token-operator">:</span> [
            </Line>
            <Line num={9}>
              {"    "}
              <span className="token-string">&quot;deep-space&quot;</span>,{" "}
              <span className="token-comment">{"// Flagship"}</span>
            </Line>
            <Line num={10}>
              {"    "}
              <span className="token-string">&quot;mint-carbon&quot;</span>,
            </Line>
            <Line num={11}>
              {"    "}
              <span className="token-string">&quot;dracula&quot;</span>,{" "}
              <span className="token-comment">{"// Legacy"}</span>
            </Line>
            <Line num={12}>
              {"    "}
              <span className="token-string">&quot;nord&quot;</span>,
            </Line>
            <Line num={13}>{"  ],"}</Line>
            <Line num={14}>
              {"  "}
              <span className="token-variable">exports</span>
              <span className="token-operator">:</span>{" "}
              <span className="token-variable">{"["}</span>
              <span className="token-string">&quot;vscode&quot;</span>,{" "}
              <span className="token-string">&quot;iterm&quot;</span>,{" "}
              <span className="token-string">&quot;alacritty&quot;</span>
              <span className="token-variable">{"]"}</span>,
            </Line>
            <Line num={15}>{"}"}</Line>
            <Line num={16} />
            <Line num={17}>
              <span className="token-comment">{"// Usage in your app"}</span>
            </Line>
            <Line num={18}>
              <span className="token-keyword">export default function</span>{" "}
              <span className="token-function">App</span>() {"{"}
            </Line>
            <Line num={19}>
              {"  "}
              <span className="token-keyword">return</span> (
            </Line>
            <Line num={20}>
              {"    "}
              <span className="token-variable">{"<ThemeProvider"}</span>{" "}
              <span className="token-function">config</span>
              <span className="token-operator">=</span>
              {"{"}config{"}>"}
            </Line>
            <Line num={21}>
              {"      "}
              <span className="token-variable">{"<YourApp />"}</span>
            </Line>
            <Line num={22}>
              {"    "}
              <span className="token-variable">{"</ThemeProvider>"}</span>
            </Line>
            <Line num={23}>{"  )"}</Line>
            <Line num={24}>{"}"}</Line>
          </code>
        </pre>
      </div>
    </div>
  );
}

function Line({
  num,
  children,
}: {
  num: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex">
      <span className="mr-4 inline-block w-6 select-none text-right text-muted-foreground">
        {num}
      </span>
      <span>{children}</span>
    </div>
  );
}
