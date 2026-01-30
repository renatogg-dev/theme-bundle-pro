/**
 * Buyer Download API
 * Generates custom theme ZIP (dual mode: light + dark)
 * License verification is done at auth time via Gumroad API
 */

import { NextResponse } from "next/server";
import { verifyBuyerToken, extractTokenFromHeader } from "@/lib/jwt";
import { generateDualThemePackage } from "@/lib/zip-generator";
import type { ThemeColors, DualThemeConfig } from "@/lib/exporters/types";

interface DownloadRequest {
  name: string;
  displayName: string;
  lightColors: ThemeColors;
  darkColors: ThemeColors;
}

/**
 * POST /api/buyer/download
 * Generate theme package and return download URL
 */
export async function POST(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const payload = await verifyBuyerToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json() as DownloadRequest;
    const { name, displayName, lightColors, darkColors } = body;

    if (!name || !displayName || !lightColors || !darkColors) {
      return NextResponse.json(
        { error: "Invalid theme configuration. Both light and dark colors are required." },
        { status: 400 }
      );
    }

    // Create dual theme config
    const dualConfig: DualThemeConfig = {
      name,
      displayName,
      author: payload.email,
      light: lightColors,
      dark: darkColors,
    };

    console.log("Generating dual theme package for buyer:", {
      licenseKeyHash: payload.licenseKeyHash,
      email: payload.email,
      themeName: displayName,
      productType: payload.productType,
    });

    // Generate the dual theme package (light + dark)
    const { downloadUrl, expiresAt, size } = await generateDualThemePackage({
      dualConfig,
      purchaseId: payload.purchaseId || payload.licenseKeyHash,
    });

    console.log(`Dual package generated: ${(size / 1024).toFixed(2)} KB`);

    console.log("Buyer download completed:", {
      licenseKeyHash: payload.licenseKeyHash,
      email: payload.email,
      themeName: displayName,
      size,
    });

    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresAt: expiresAt.toISOString(),
      size,
    });
  } catch (error) {
    console.error("Buyer download error:", error);
    return NextResponse.json(
      { error: "Failed to generate download. Please try again." },
      { status: 500 }
    );
  }
}
