/**
 * Gumroad Webhook Handler
 * Processes purchase notifications and creates buyer access for customization portal
 * 
 * Two product types:
 * - Single Theme ($9): Customer chooses theme before checkout, gets access to customize that theme
 * - Full Bundle ($49): Gumroad delivers 13 themes, customer gets access to customize 1 bonus theme
 */

import { NextResponse } from "next/server";
import { parseGumroadWebhook } from "@/lib/gumroad";
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
    // Get raw body
    const body = await request.text();
    
    // Parse webhook data
    const formData = new URLSearchParams(body);
    
    // Verify seller_id (Gumroad's way of validating webhooks)
    const sellerId = formData.get("seller_id");
    const expectedSellerId = process.env.GUMROAD_WEBHOOK_SECRET;
    
    if (expectedSellerId && sellerId !== expectedSellerId) {
      console.error("Invalid seller_id in webhook:", { received: sellerId, expected: expectedSellerId });
      return NextResponse.json(
        { error: "Invalid seller_id" },
        { status: 401 }
      );
    }
    
    const webhookData = parseGumroadWebhook(formData);
    
    // Log ALL received data for debugging
    console.log("📦 Gumroad webhook RAW data:", Object.fromEntries(formData.entries()));

    // Log for debugging
    console.log("📦 Gumroad webhook parsed:", {
      saleId: webhookData.saleId,
      email: webhookData.email,
      permalink: webhookData.permalink,
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

    // Determine product type based on permalink, productId or productName
    const productType = determineProductType(webhookData.permalink, webhookData.productId, webhookData.productName);
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
 * Determine product type based on Gumroad permalink, product ID, or product name
 * 
 * Configuration via environment variables:
 * - GUMROAD_SINGLE_PRODUCT_ID: Permalink or Product ID for Single Theme ($19.99)
 * - GUMROAD_BUNDLE_PRODUCT_ID: Permalink or Product ID for Full Bundle ($49.99)
 */
function determineProductType(permalink: string, productId: string, productName: string): "single" | "bundle" {
  const singleProductId = process.env.GUMROAD_SINGLE_PRODUCT_ID;
  const bundleProductId = process.env.GUMROAD_BUNDLE_PRODUCT_ID;

  console.log("Determining product type:", { permalink, productId, productName, singleProductId, bundleProductId });

  // Match by permalink first (user's custom URL like "theme-package-pro")
  if (singleProductId && permalink === singleProductId) {
    return "single";
  }
  if (bundleProductId && permalink === bundleProductId) {
    return "bundle";
  }

  // Match by product ID
  if (singleProductId && productId === singleProductId) {
    return "single";
  }
  if (bundleProductId && productId === bundleProductId) {
    return "bundle";
  }

  // Fallback to product name matching
  const nameLower = productName.toLowerCase();
  if (nameLower.includes("package") || nameLower.includes("bundle") || nameLower.includes("full") || nameLower.includes("all")) {
    return "bundle";
  }
  if (nameLower.includes("single") || nameLower.includes("studio")) {
    return "single";
  }

  // Default to bundle if can't determine (safer for customer)
  console.warn("Could not determine product type, defaulting to bundle:", { permalink, productId, productName });
  return "bundle";
}
