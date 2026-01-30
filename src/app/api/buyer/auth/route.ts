/**
 * Buyer Authentication API
 * Validates email + verification code and returns a JWT token
 */

import { NextResponse } from "next/server";
import { validateBuyerAccess } from "@/lib/server";
import { createBuyerToken } from "@/lib/jwt";

interface AuthRequest {
  email: string;
  code: string;
}

/**
 * POST /api/buyer/auth
 * Authenticate buyer with email and verification code
 */
export async function POST(request: Request) {
  try {
    const body = await request.json() as AuthRequest;
    const { email, code } = body;

    // Validate input
    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Verification code must be 6 digits" },
        { status: 400 }
      );
    }

    // Validate credentials
    const access = await validateBuyerAccess(email, code);

    if (!access) {
      return NextResponse.json(
        { error: "Invalid email or verification code" },
        { status: 401 }
      );
    }

    // Check if access has already been used
    if (access.used) {
      return NextResponse.json(
        { error: "This access code has already been used. Each code can only be used once." },
        { status: 403 }
      );
    }

    // Create JWT token
    const token = await createBuyerToken({
      accessId: access.id,
      email: access.email,
      productType: access.productType,
      selectedTheme: access.selectedTheme,
      used: access.used,
    });

    console.log("Buyer authenticated:", {
      accessId: access.id,
      email: access.email,
      productType: access.productType,
      selectedTheme: access.selectedTheme,
    });

    return NextResponse.json({
      success: true,
      token,
      productType: access.productType,
      selectedTheme: access.selectedTheme,
      // Include theme config if pre-customized
      themeConfig: access.themeConfig,
    });
  } catch (error) {
    console.error("Buyer auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/buyer/auth
 * Verify existing token and return buyer info
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    // Import dynamically to avoid circular dependencies
    const { verifyBuyerToken, extractTokenFromHeader } = await import("@/lib/jwt");
    const { getBuyerAccessById } = await import("@/lib/server");

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      return NextResponse.json(
        { error: "Invalid authorization header" },
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

    return NextResponse.json({
      success: true,
      accessId: access.id,
      email: access.email,
      productType: access.productType,
      selectedTheme: access.selectedTheme,
      themeConfig: access.themeConfig,
      used: access.used,
      expiresAt: access.expiresAt,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Token verification failed" },
      { status: 500 }
    );
  }
}
