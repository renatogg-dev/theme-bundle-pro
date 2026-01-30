/**
 * JWT Utilities for Buyer Authentication
 * Uses jose for JWT operations (Edge-compatible)
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export interface BuyerTokenPayload extends JWTPayload {
  accessId: string;
  email: string;
  productType: "single" | "bundle";
  selectedTheme: string | null;
  used: boolean;
}

/**
 * Get JWT secret as Uint8Array (required by jose)
 */
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Create a JWT token for buyer authentication
 */
export async function createBuyerToken(payload: Omit<BuyerTokenPayload, "iat" | "exp">): Promise<string> {
  const secret = getJwtSecret();
  
  const token = await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") // Token expires in 24 hours
    .sign(secret);
  
  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyBuyerToken(token: string): Promise<BuyerTokenPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    
    // Validate required fields
    if (
      !payload.accessId ||
      !payload.email ||
      !payload.productType
    ) {
      return null;
    }
    
    return payload as BuyerTokenPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  // Support both "Bearer <token>" and just "<token>"
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  
  return authHeader;
}
