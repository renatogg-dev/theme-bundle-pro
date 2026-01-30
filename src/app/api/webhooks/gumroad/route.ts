/**
 * Gumroad Webhook Handler
 * Processes purchase notifications and creates buyer access for customization portal
 * 
 * Two product types:
 * - Single Theme ($9): Customer chooses theme before checkout, gets access to customize that theme
 * - Full Bundle ($49): Gumroad delivers 13 themes, customer gets access to customize 1 bonus theme
 */

import { NextResponse } from "next/server";
import { verifyGumroadSignature, parseGumroadWebhook } from "@/lib/gumroad";
import { sendBuyerAccessEmail } from "@/lib/email";
import { getSession, deleteSession, createBuyerAccess, getAccessByPurchaseId } from "@/lib/server";
import type { ThemeConfig } from "@/lib/exporters/types";

/**
 * POST /api/webhooks/gumroad
 * Handle Gumroad purchase webhook
 * Creates buyer access for customization portal instead of generating ZIP immediately
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
      productId: webhookData.productId,
      productName: webhookData.productName,
      urlParams: webhookData.urlParams,
      test: webhookData.test,
    });

    // Skip if refunded
    if (webhookData.refunded) {
      console.log("Skipping refunded purchase");
      return NextResponse.json({ status: "skipped", reason: "refunded" });
    }

    // Check if access already exists for this purchase (duplicate webhook protection)
    const existingAccess = await getAccessByPurchaseId(webhookData.saleId);
    if (existingAccess) {
      console.log("Access already exists for this purchase:", webhookData.saleId);
      return NextResponse.json({ 
        status: "skipped", 
        reason: "access_already_exists",
        accessId: existingAccess.id 
      });
    }

    // Determine product type based on productId or productName
    const productType = determineProductType(webhookData.productId, webhookData.productName);
    console.log("Product type determined:", productType);

    // Get session data for Single Theme (contains selected theme and pre-customization)
    let selectedTheme: string | undefined;
    let themeConfig: ThemeConfig | undefined;
    let themeName: string | undefined;

    const sessionId = webhookData.urlParams?.session;
    if (sessionId) {
      const session = await getSession(sessionId);
      if (session) {
        themeConfig = session.themeConfig;
        selectedTheme = themeConfig.name;
        themeName = themeConfig.displayName;
        console.log("Using theme from session:", selectedTheme);
      } else {
        console.log("Session not found or expired");
      }
    }

    // For single theme without session, use a default
    if (productType === "single" && !selectedTheme) {
      selectedTheme = "deep-space";
      themeName = "Deep Space";
      console.log("No session found for single theme, using default:", selectedTheme);
    }

    // Create buyer access
    const { accessId, verificationCode, expiresAt } = await createBuyerAccess({
      email: webhookData.email,
      purchaseId: webhookData.saleId,
      productType,
      selectedTheme,
      themeConfig,
    });

    console.log("Buyer access created:", {
      accessId,
      productType,
      selectedTheme,
      expiresAt: new Date(expiresAt).toISOString(),
    });

    // Send buyer access email with verification code
    const emailSent = await sendBuyerAccessEmail({
      to: webhookData.email,
      verificationCode,
      productType,
      themeName,
    });

    console.log("Buyer access email sent:", emailSent);

    // Clean up session after use
    if (sessionId) {
      await deleteSession(sessionId);
      console.log("Session cleaned up:", sessionId);
    }

    return NextResponse.json({
      status: "success",
      saleId: webhookData.saleId,
      productType,
      accessId,
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
 * Determine product type based on Gumroad product ID or product name
 * 
 * Configuration via environment variables:
 * - GUMROAD_SINGLE_PRODUCT_ID: Product ID for Single Theme ($9)
 * - GUMROAD_BUNDLE_PRODUCT_ID: Product ID for Full Bundle ($49)
 */
function determineProductType(productId: string, productName: string): "single" | "bundle" {
  const singleProductId = process.env.GUMROAD_SINGLE_PRODUCT_ID;
  const bundleProductId = process.env.GUMROAD_BUNDLE_PRODUCT_ID;

  // Match by product ID first (most reliable)
  if (singleProductId && productId === singleProductId) {
    return "single";
  }
  if (bundleProductId && productId === bundleProductId) {
    return "bundle";
  }

  // Fallback to product name matching
  const nameLower = productName.toLowerCase();
  if (nameLower.includes("bundle") || nameLower.includes("full") || nameLower.includes("all")) {
    return "bundle";
  }
  if (nameLower.includes("single") || nameLower.includes("theme")) {
    return "single";
  }

  // Default to single if can't determine
  console.warn("Could not determine product type, defaulting to single:", { productId, productName });
  return "single";
}
