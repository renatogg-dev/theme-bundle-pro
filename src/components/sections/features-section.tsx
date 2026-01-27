"use client";

import {
  Palette,
  Moon,
  Accessibility,
  Copy,
  Layers,
  Zap,
  RefreshCw,
  Code,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Palette,
    title: "Real-Time Customization",
    description:
      "Tweak any color with live preview. Start from presets, make them your own.",
  },
  {
    icon: Moon,
    title: "Light & Dark Modes",
    description:
      "Every preset includes carefully crafted light and dark variants. 26 base variations.",
  },
  {
    icon: Accessibility,
    title: "WCAG AA Compliant",
    description:
      "All color combinations tested for accessibility. Minimum 4.5:1 contrast ratio.",
  },
  {
    icon: Copy,
    title: "Full Source Code",
    description:
      "Get complete CSS files with all variables. Ready to drop into your project.",
  },
  {
    icon: Layers,
    title: "Export to 19 Platforms",
    description:
      "VS Code, JetBrains, iTerm, Windows Terminal, Vim, Emacs, Slack, Chrome, Firefox, and more.",
  },
  {
    icon: Zap,
    title: "No Dependencies",
    description:
      "Pure CSS variables. Works with any framework. No runtime JS overhead.",
  },
  {
    icon: RefreshCw,
    title: "Buy via Gumroad",
    description:
      "Simple checkout, instant download. One-time purchase, lifetime updates.",
  },
  {
    icon: Code,
    title: "TypeScript Support",
    description:
      "Full type definitions for theme IDs, colors, and configuration options.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-border py-20 contain-section content-lazy">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Professional-grade theming infrastructure for terminals, editors, browsers, and apps
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group transition-all hover:shadow-lg hover:border-primary/50"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
