/**
 * Download API Endpoint
 * Validates download tokens and streams ZIP files from Supabase Storage
 */

import { NextResponse } from "next/server";
import { getDownloadToken, downloadFile } from "@/lib/server";

/**
 * GET /api/download?token=xxx
 * Download a theme package using a valid token
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // Validate token parameter
    if (!token) {
      return NextResponse.json(
        { error: "Download token is required" },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }

    // Get and validate download token
    const downloadToken = await getDownloadToken(token);

    if (!downloadToken) {
      return NextResponse.json(
        { 
          error: "Invalid or expired download link",
          message: "This download link has expired or is invalid. Please contact support if you need a new link."
        },
        { status: 404 }
      );
    }

    // Download file from storage
    console.log(`[Download] Fetching file: ${downloadToken.storagePath}`);
    const fileBuffer = await downloadFile(downloadToken.storagePath);

    if (!fileBuffer) {
      console.error(`[Download] File not found in storage: ${downloadToken.storagePath}`);
      return NextResponse.json(
        { 
          error: "File not found",
          message: "The theme package could not be found. Please contact support."
        },
        { status: 404 }
      );
    }

    // Generate filename for download
    const filename = `${downloadToken.themeName.toLowerCase().replace(/\s+/g, "-")}-bundle.zip`;

    console.log(`[Download] Serving file: ${filename} (${(fileBuffer.length / 1024).toFixed(2)} KB)`);

    // Convert Buffer to Uint8Array for Response compatibility
    const uint8Array = new Uint8Array(fileBuffer);

    // Return the file as a download
    return new Response(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Theme-Name": downloadToken.themeName,
        "X-Purchase-Id": downloadToken.purchaseId,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Download failed. Please try again or contact support." },
      { status: 500 }
    );
  }
}

/**
 * HEAD /api/download?token=xxx
 * Check if a download token is valid without downloading
 */
export async function HEAD(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return new Response(null, { status: 400 });
    }

    const downloadToken = await getDownloadToken(token);

    if (!downloadToken) {
      return new Response(null, { status: 404 });
    }

    return new Response(null, {
      status: 200,
      headers: {
        "X-Token-Valid": "true",
        "X-Expires-At": new Date(downloadToken.expiresAt).toISOString(),
        "X-Theme-Name": downloadToken.themeName,
      },
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}
