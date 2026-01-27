/**
 * Theme Sessions API
 * Stores theme configurations for purchase flow
 * Uses Supabase Postgres in production, in-memory for development
 */

import { NextResponse } from "next/server";
import { createSession, getSession, deleteSession } from "@/lib/server";

/**
 * POST /api/sessions
 * Create a new session with theme configuration
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { themeConfig, productType = "bundle" } = body;

    if (!themeConfig) {
      return NextResponse.json(
        { error: "themeConfig is required" },
        { status: 400 }
      );
    }

    // Validate productType
    const validProductTypes = ["single", "bundle", "team"];
    const normalizedProductType = validProductTypes.includes(productType)
      ? productType
      : "bundle";

    // Create session using the store
    const { sessionId, expiresAt } = await createSession({
      themeConfig,
      productType: normalizedProductType,
      expiresInSeconds: 86400, // 24 hours
    });

    return NextResponse.json({
      sessionId,
      expiresIn: 86400, // seconds
      expiresAt,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sessions?id=xxx
 * Retrieve a session by ID
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get session from the store
    const session = await getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found or expired" },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error retrieving session:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sessions?id=xxx
 * Delete a session after use
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Delete session from the store
    await deleteSession(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
