"use client";

import { Check, Sparkles, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buildGumroadUrl, getGumroadProducts, type ProductType } from "@/lib/gumroad";

// Get product configuration from environment
const products = getGumroadProducts();

const plans: Array<{
  name: string;
  price: string;
  description: string;
  features: string[];
  popular: boolean;
  cta: string;
  productType: ProductType;
}> = [
  {
    name: products.single.name,
    price: `$${products.single.price}`,
    description: products.single.description,
    features: [
      "1 theme of your choice",
      "Light & Dark modes",
      "CSS variables file",
      "Exported to 19 platforms",
      "Personal & commercial use",
    ],
    popular: false,
    cta: "Buy Theme",
    productType: "single",
  },
  {
    name: products.bundle.name,
    price: `$${products.bundle.price}`,
    description: products.bundle.description,
    features: [
      "All 13 themes included",
      "26 total variations",
      "TypeScript support",
      "Theme switcher component",
      "Lifetime updates",
      "Priority support",
    ],
    popular: true,
    cta: "Get Full Bundle",
    productType: "bundle",
  },
  {
    name: products.team.name,
    price: `$${products.team.price}`,
    description: products.team.description,
    features: [
      "Everything in Full Bundle",
      "Up to 10 team members",
      "Shared license",
      "Custom theme requests",
      "Slack support channel",
      "Early access to new themes",
    ],
    popular: false,
    cta: "Contact Sales",
    productType: "team",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="border-b border-border py-20 contain-section content-lazy-lg">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            One-time purchase. Lifetime access. No subscriptions.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const gumroadUrl = buildGumroadUrl(plan.productType);
            const isConfigured = !gumroadUrl.startsWith("#");

            return (
              <Card
                key={index}
                className={`relative ${
                  plan.popular
                    ? "border-primary shadow-lg ring-1 ring-primary"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1 px-3 py-1">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4 pt-8 text-center">
                  <CardTitle className="text-lg font-medium text-foreground">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">/one-time</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {isConfigured ? (
                    <a
                      href={gumroadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        plan.popular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {plan.cta}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <button
                      disabled
                      className={cn(
                        "inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium opacity-50 cursor-not-allowed",
                        plan.popular
                          ? "bg-primary text-primary-foreground"
                          : "border border-input bg-background"
                      )}
                      title="Gumroad not configured"
                    >
                      {plan.cta}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            30-day money back
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Secure checkout via Gumroad
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Instant download
          </div>
        </div>
      </div>
    </section>
  );
}
