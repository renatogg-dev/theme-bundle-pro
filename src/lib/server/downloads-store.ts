/**
 * Downloads Store
 * Manages download tokens and file storage using Supabase
 */

import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

export interface DownloadToken {
  token: string;
  storagePath: string;
  purchaseId: string;
  themeName: string;
  createdAt: number;
  expiresAt: number;
}

// Database row type
interface DownloadTokenRow {
  token: string;
  storage_path: string;
  purchase_id: string;
  theme_name: string;
  created_at: string;
  expires_at: string;
}

// In-memory fallback for development
const inMemoryTokens = new Map<string, DownloadToken>();
const inMemoryFiles = new Map<string, Buffer>();

// Bucket name for Supabase Storage
const STORAGE_BUCKET = "downloads";

/**
 * Upload a ZIP file to storage
 */
export async function uploadZipFile(params: {
  purchaseId: string;
  themeName: string;
  zipBuffer: Buffer;
}): Promise<{ storagePath: string }> {
  const { purchaseId, themeName, zipBuffer } = params;
  const storagePath = `${purchaseId}/${themeName}-bundle.zip`;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, zipBuffer, {
        contentType: "application/zip",
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error("Failed to upload ZIP to Supabase Storage:", error);
      throw new Error("Failed to upload theme package");
    }

    console.log(`[Supabase] Uploaded ZIP to ${STORAGE_BUCKET}/${storagePath}`);
    return { storagePath };
  }

  // Fallback to in-memory storage
  console.log(`[Dev] Storing ZIP in memory: ${storagePath} (${(zipBuffer.length / 1024).toFixed(2)} KB)`);
  inMemoryFiles.set(storagePath, zipBuffer);
  return { storagePath };
}

/**
 * Create a download token for a file
 */
export async function createDownloadToken(params: {
  storagePath: string;
  purchaseId: string;
  themeName: string;
  expiresInDays?: number;
}): Promise<DownloadToken> {
  const { storagePath, purchaseId, themeName, expiresInDays = 7 } = params;
  const token = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + expiresInDays * 24 * 60 * 60 * 1000;

  const downloadToken: DownloadToken = {
    token,
    storagePath,
    purchaseId,
    themeName,
    createdAt: now,
    expiresAt,
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();

    const insertData = {
      token,
      storage_path: storagePath,
      purchase_id: purchaseId,
      theme_name: themeName,
      expires_at: new Date(expiresAt).toISOString(),
    };

    // Use type assertion for untyped table operations
    const { error } = await (supabase.from("download_tokens") as ReturnType<typeof supabase.from>).insert(insertData);

    if (error) {
      console.error("Failed to create download token in Supabase:", error);
      throw new Error("Failed to create download token");
    }

    return downloadToken;
  }

  // Fallback to in-memory
  inMemoryTokens.set(token, downloadToken);
  return downloadToken;
}

/**
 * Validate and get download token
 */
export async function getDownloadToken(token: string): Promise<DownloadToken | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await (supabase.from("download_tokens") as ReturnType<typeof supabase.from>)
      .select("*")
      .eq("token", token)
      .single();

    if (error || !data) {
      return null;
    }

    // Cast to our row type
    const row = data as unknown as DownloadTokenRow;
    const tokenExpiresAt = new Date(row.expires_at).getTime();
    
    // Check if expired
    if (tokenExpiresAt < Date.now()) {
      // Delete expired token
      await (supabase.from("download_tokens") as ReturnType<typeof supabase.from>)
        .delete()
        .eq("token", token);
      return null;
    }

    return {
      token: row.token,
      storagePath: row.storage_path,
      purchaseId: row.purchase_id,
      themeName: row.theme_name,
      createdAt: new Date(row.created_at).getTime(),
      expiresAt: tokenExpiresAt,
    };
  }

  // Fallback to in-memory
  const downloadToken = inMemoryTokens.get(token);
  
  if (!downloadToken) {
    return null;
  }

  if (downloadToken.expiresAt < Date.now()) {
    inMemoryTokens.delete(token);
    return null;
  }

  return downloadToken;
}

/**
 * Download file from storage
 */
export async function downloadFile(storagePath: string): Promise<Buffer | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(storagePath);

    if (error || !data) {
      console.error("Failed to download file from Supabase Storage:", error);
      return null;
    }

    // Convert Blob to Buffer
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // Fallback to in-memory
  return inMemoryFiles.get(storagePath) || null;
}

/**
 * Build download URL with token
 */
export function buildDownloadUrl(token: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "";
  return `${base}/api/download?token=${token}`;
}

/**
 * Clean up expired tokens (for maintenance)
 */
export async function cleanExpiredTokens(): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await (supabase.from("download_tokens") as ReturnType<typeof supabase.from>)
    .delete()
    .lt("expires_at", now)
    .select("token");

  if (error) {
    console.error("Failed to clean expired tokens:", error);
    return 0;
  }

  return (data as unknown[])?.length || 0;
}
