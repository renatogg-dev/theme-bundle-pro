/**
 * Buyer Download API
 * Generates custom theme ZIP (dual mode: light + dark) and marks access as used
 */

import { NextResponse } from "next/server";
import { verifyBuyerToken, extractTokenFromHeader } from "@/lib/jwt";
import { getBuyerAccessById, markAccessAsUsed } from "@/lib/server";
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
 * Marks the buyer access as used (one-time use)
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

    // Get fresh access data from database
    const access = await getBuyerAccessById(payload.accessId);
    if (!access) {
      return NextResponse.json(
        { error: "Access not found or expired" },
        { status: 404 }
      );
    }

    // Check if already used
    if (access.used) {
      return NextResponse.json(
        { error: "This access has already been used. Each purchase allows one download." },
        { status: 403 }
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
      author: access.email,
      light: lightColors,
      dark: darkColors,
    };

    console.log("Generating dual theme package for buyer:", {
      accessId: access.id,
      email: access.email,
      themeName: displayName,
    });

    // Generate the dual theme package (light + dark)
    const { downloadUrl, expiresAt, size } = await generateDualThemePackage({
      dualConfig,
      purchaseId: access.purchaseId,
    });

    console.log(`Dual package generated: ${(size / 1024).toFixed(2)} KB`);

    // Mark access as used AFTER successful generation
    const marked = await markAccessAsUsed(access.id);
    if (!marked) {
      console.warn("Failed to mark access as used:", access.id);
      // Don't fail the request, just log the warning
    }

    console.log("Buyer download completed:", {
      accessId: access.id,
      email: access.email,
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
