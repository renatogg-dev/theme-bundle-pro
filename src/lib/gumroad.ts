/**
 * Gumroad Integration Utilities
 * Webhook verification and URL builders
 * 
 * URLs are configured via environment variables:
 * - NEXT_PUBLIC_GUMROAD_SINGLE_URL
 * - NEXT_PUBLIC_GUMROAD_BUNDLE_URL
 * - NEXT_PUBLIC_GUMROAD_TEAM_URL
 */

import { createHmac } from "crypto";

/**
 * Verify Gumroad webhook signature
 * Gumroad signs webhooks with HMAC-SHA256
 */
export function verifyGumroadSignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  // Timing-safe comparison
  return timingSafeEqual(signature, expectedSignature);
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Parse Gumroad webhook payload
 */
export interface GumroadWebhookPayload {
  // Sale info
  saleId: string;
  saleTimestamp: string;
  productId: string;
  productName: string;
  permalink: string;

  // Buyer info
  email: string;
  fullName: string;
  purchaserEmail?: string;

  // Pricing
  price: number;
  currency: string;
  quantity: number;

  // Custom fields
  urlParams?: Record<string, string>;

  // License (if product has license keys)
  licenseKey?: string;

  // Other
  isGiftReceiverPurchase: boolean;
  refunded: boolean;
  test: boolean;
}

/**
 * Parse Gumroad webhook form data into typed object
 */
export function parseGumroadWebhook(formData: URLSearchParams): GumroadWebhookPayload {
  // Extract URL params (custom fields passed via Gumroad URL)
  const urlParams: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (key.startsWith("url_params[")) {
      const paramName = key.slice(11, -1); // Remove "url_params[" and "]"
      urlParams[paramName] = value;
    }
  });

  return {
    saleId: formData.get("sale_id") || "",
    saleTimestamp: formData.get("sale_timestamp") || "",
    productId: formData.get("product_id") || "",
    productName: formData.get("product_name") || "",
    permalink: formData.get("product_permalink") || "",
    email: formData.get("email") || "",
    fullName: formData.get("full_name") || "",
    purchaserEmail: formData.get("purchaser_email") || undefined,
    price: parseFloat(formData.get("price") || "0"),
    currency: formData.get("currency") || "usd",
    quantity: parseInt(formData.get("quantity") || "1", 10),
    urlParams,
    licenseKey: formData.get("license_key") || undefined,
    isGiftReceiverPurchase: formData.get("is_gift_receiver_purchase") === "true",
    refunded: formData.get("refunded") === "true",
    test: formData.get("test") === "true",
  };
}

/**
 * Product types available for purchase
 */
export type ProductType = "single" | "bundle" | "team";

/**
 * Product configuration with pricing info
 */
export interface ProductConfig {
  url: string;
  price: number;
  name: string;
  description: string;
}

/**
 * Get Gumroad product URLs from environment variables
 * Returns empty strings if not configured (for development)
 */
export function getGumroadProducts(): Record<ProductType, ProductConfig> {
  return {
    single: {
      url: process.env.NEXT_PUBLIC_GUMROAD_SINGLE_URL || "",
      price: 9,
      name: "Single Theme",
      description: "One customized theme for 19 platforms",
    },
    bundle: {
      url: process.env.NEXT_PUBLIC_GUMROAD_BUNDLE_URL || "",
      price: 49,
      name: "Full Bundle",
      description: "Unlimited themes + lifetime updates",
    },
    team: {
      url: process.env.NEXT_PUBLIC_GUMROAD_TEAM_URL || "",
      price: 149,
      name: "Team License",
      description: "Full bundle for up to 10 team members",
    },
  };
}

/**
 * Check if Gumroad URLs are configured
 */
export function isGumroadConfigured(): boolean {
  const products = getGumroadProducts();
  return !!(products.single.url || products.bundle.url || products.team.url);
}

/**
 * Build Gumroad checkout URL with session parameter
 */
export function buildGumroadUrl(
  productType: ProductType,
  sessionId?: string
): string {
  const products = getGumroadProducts();
  const product = products[productType];

  if (!product.url) {
    console.warn(`Gumroad URL not configured for product type: ${productType}`);
    // Return a placeholder for development
    return `#gumroad-${productType}-not-configured`;
  }

  const url = new URL(product.url);
  
  if (sessionId) {
    url.searchParams.set("session", sessionId);
  }
  
  return url.toString();
}

/**
 * Get product info by type
 */
export function getProductInfo(productType: ProductType): ProductConfig {
  const products = getGumroadProducts();
  return products[productType];
}

// Legacy export for backward compatibility
// @deprecated Use getGumroadProducts() instead
export const GUMROAD_PRODUCTS = {
  get singleTheme() {
    const products = getGumroadProducts();
    return { url: products.single.url, price: products.single.price };
  },
  get fullBundle() {
    const products = getGumroadProducts();
    return { url: products.bundle.url, price: products.bundle.price };
  },
  get teamLicense() {
    const products = getGumroadProducts();
    return { url: products.team.url, price: products.team.price };
  },
};
