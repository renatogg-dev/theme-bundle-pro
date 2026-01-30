/**
 * Buyer Authentication API
 * Validates license key via Gumroad API and returns a JWT token
 */

import { NextResponse } from "next/server";
import { verifyLicenseKey } from "@/lib/gumroad";
import { createBuyerToken, hashLicenseKey, verifyBuyerToken, extractTokenFromHeader } from "@/lib/jwt";

interface AuthRequest {
  licenseKey: string;
}

/**
 * POST /api/buyer/auth
 * Authenticate buyer with Gumroad license key
 */
export async function POST(request: Request) {
  try {
    const body = await request.json() as AuthRequest;
    const { licenseKey } = body;

    // Validate input
    if (!licenseKey) {
      return NextResponse.json(
        { error: "License key is required" },
        { status: 400 }
      );
    }

    // Clean and validate license key format (32 alphanumeric chars, with or without dashes)
    const cleanedKey = licenseKey.replace(/-/g, "").toUpperCase();
    if (cleanedKey.length !== 32 || !/^[A-Z0-9]+$/.test(cleanedKey)) {
      return NextResponse.json(
        { error: "Invalid license key format" },
        { status: 400 }
      );
    }

    // Format the key with dashes for Gumroad API
    const formattedKey = cleanedKey.match(/.{8}/g)?.join("-") || licenseKey;

    // Verify license key with Gumroad API
    const verification = await verifyLicenseKey(formattedKey, true);

    if (!verification.valid) {
      if (verification.refunded) {
        return NextResponse.json(
          { error: "This license has been refunded and is no longer valid." },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Invalid license key. Please check and try again." },
        { status: 401 }
      );
    }

    // Create JWT token with license info
    const token = await createBuyerToken({
      licenseKeyHash: hashLicenseKey(formattedKey),
      email: verification.email || "",
      productType: verification.productType!,
      uses: verification.uses || 1,
      test: verification.test || false,
      purchaseId: verification.purchaseId,
    });

    console.log("Buyer authenticated via license key:", {
      licenseKeyHash: hashLicenseKey(formattedKey),
      email: verification.email,
      productType: verification.productType,
      uses: verification.uses,
      test: verification.test,
    });

    return NextResponse.json({
      success: true,
      token,
      productType: verification.productType,
      email: verification.email,
      uses: verification.uses,
      test: verification.test,
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

    return NextResponse.json({
      success: true,
      licenseKeyHash: payload.licenseKeyHash,
      email: payload.email,
      productType: payload.productType,
      uses: payload.uses,
      test: payload.test,
      purchaseId: payload.purchaseId,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Token verification failed" },
      { status: 500 }
    );
  }
}
