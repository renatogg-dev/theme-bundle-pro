/**
 * Gumroad Webhook Handler
 * Processes purchase notifications and generates theme packages
 * Uses shared Supabase storage for sessions and downloads
 */

import { NextResponse } from "next/server";
import { verifyGumroadSignature, parseGumroadWebhook } from "@/lib/gumroad";
import { generateThemePackage } from "@/lib/zip-generator";
import { sendDownloadEmail } from "@/lib/email";
import { getSession, deleteSession } from "@/lib/server";
import type { ThemeConfig } from "@/lib/exporters/types";

/**
 * POST /api/webhooks/gumroad
 * Handle Gumroad purchase webhook
 */
export async function POST(request: Request) {
  try {
    // Get raw body for signature verification
    const body = await request.text();

    // Verify webhook signature (in production)
    const signature = request.headers.get("x-gumroad-signature");
    const secret = process.env.GUMROAD_WEBHOOK_SECRET;

    if (secret && signature) {
      const isValid = verifyGumroadSignature(body, signature, secret);
      if (!isValid) {
        console.error("Invalid Gumroad webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    } else if (process.env.NODE_ENV === "production") {
      console.warn("Gumroad webhook secret not configured");
    }

    // Parse webhook data
    const formData = new URLSearchParams(body);
    const webhookData = parseGumroadWebhook(formData);

    // Log for debugging
    console.log("📦 Gumroad webhook received:", {
      saleId: webhookData.saleId,
      email: webhookData.email,
      productName: webhookData.productName,
      urlParams: webhookData.urlParams,
      test: webhookData.test,
    });

    // Skip if refunded
    if (webhookData.refunded) {
      console.log("Skipping refunded purchase");
      return NextResponse.json({ status: "skipped", reason: "refunded" });
    }

    // Get session ID from URL params
    const sessionId = webhookData.urlParams?.session;
    let themeConfig: ThemeConfig | null = null;

    if (sessionId) {
      // Retrieve session from the shared store
      const session = await getSession(sessionId);

      if (session) {
        themeConfig = session.themeConfig;
        console.log("Using custom theme config from session:", themeConfig.name);
      } else {
        console.log("Session not found or expired, using default preset");
      }
    }

    // If no session, use a default preset based on product
    if (!themeConfig) {
      themeConfig = getDefaultThemeConfig(webhookData.productName);
    }

    // Generate the theme package (now uploads to Supabase Storage)
    console.log("Generating theme package for:", themeConfig.displayName);
    const { downloadUrl, size } = await generateThemePackage({
      themeConfig,
      purchaseId: webhookData.saleId,
    });

    console.log(`Package generated: ${downloadUrl} (${(size / 1024).toFixed(2)} KB)`);

    // Send download email
    const emailSent = await sendDownloadEmail({
      to: webhookData.email,
      themeName: themeConfig.displayName,
      downloadUrl,
    });

    console.log("Email sent:", emailSent);

    // Clean up session after use
    if (sessionId) {
      await deleteSession(sessionId);
      console.log("Session cleaned up:", sessionId);
    }

    return NextResponse.json({
      status: "success",
      saleId: webhookData.saleId,
      themeName: themeConfig.displayName,
      emailSent,
    });
  } catch (error) {
    console.error("Gumroad webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/gumroad
 * Health check / ping endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "Gumroad webhook",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get default theme config based on product name
 */
function getDefaultThemeConfig(productName: string): ThemeConfig {
  // Default Dracula-like theme
  return {
    name: "custom-theme",
    displayName: productName || "Custom Theme",
    author: "Theme Bundle",
    colors: {
      primary: { h: 265, s: 89, l: 78 },
      secondary: { h: 232, s: 14, l: 31 },
      accent: { h: 191, s: 97, l: 77 },
      background: { h: 231, s: 15, l: 18 },
      foreground: { h: 60, s: 30, l: 96 },
      muted: { h: 232, s: 14, l: 31 },
      mutedForeground: { h: 215, s: 20, l: 65 },
      card: { h: 231, s: 15, l: 22 },
      cardForeground: { h: 60, s: 30, l: 96 },
      popover: { h: 231, s: 15, l: 22 },
      popoverForeground: { h: 60, s: 30, l: 96 },
      border: { h: 232, s: 14, l: 31 },
      input: { h: 232, s: 14, l: 31 },
      ring: { h: 265, s: 89, l: 78 },
      destructive: { h: 0, s: 100, l: 67 },
      destructiveForeground: { h: 60, s: 30, l: 96 },
    },
  };
}
