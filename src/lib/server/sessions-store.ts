/**
 * Sessions Store
 * Persistent session storage using Supabase Postgres
 * Falls back to in-memory storage for development without Supabase
 */

import { getSupabaseAdmin, isSupabaseConfigured, type ThemeSessionConfig } from "./supabase";
import type { ThemeConfig } from "@/lib/exporters/types";

export interface SessionData {
  themeConfig: ThemeConfig;
  productType: "single" | "bundle" | "team";
  createdAt: number;
  expiresAt: number;
}

// Database row type
interface ThemeSessionRow {
  id: string;
  theme_config: ThemeSessionConfig;
  product_type: "single" | "bundle" | "team";
  created_at: string;
  expires_at: string;
}

// In-memory fallback for development
const inMemorySessions = new Map<string, SessionData>();

// Cleanup interval for in-memory sessions
let cleanupInterval: NodeJS.Timeout | null = null;

function startInMemoryCleanup() {
  if (cleanupInterval) return;
  
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    const idsToDelete: string[] = [];
    
    inMemorySessions.forEach((session, id) => {
      if (session.expiresAt < now) {
        idsToDelete.push(id);
      }
    });
    
    idsToDelete.forEach((id) => inMemorySessions.delete(id));
  }, 5 * 60 * 1000); // Every 5 minutes
}

/**
 * Create a new session
 */
export async function createSession(params: {
  themeConfig: ThemeConfig;
  productType: "single" | "bundle" | "team";
  expiresInSeconds?: number;
}): Promise<{ sessionId: string; expiresAt: number }> {
  const { themeConfig, productType, expiresInSeconds = 86400 } = params; // Default 24h
  const now = Date.now();
  const expiresAt = now + expiresInSeconds * 1000;

  // Use Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const sessionId = crypto.randomUUID();

    // Convert ThemeConfig to storage format
    const themeSessionConfig: ThemeSessionConfig = {
      name: themeConfig.name,
      displayName: themeConfig.displayName,
      author: themeConfig.author,
      colors: themeConfig.colors,
    };

    const insertData = {
      id: sessionId,
      theme_config: themeSessionConfig,
      product_type: productType,
      expires_at: new Date(expiresAt).toISOString(),
    };

    // Use type assertion for untyped table operations
    const { error } = await (supabase.from("theme_sessions") as ReturnType<typeof supabase.from>).insert(insertData);

    if (error) {
      console.error("Failed to create session in Supabase:", error);
      throw new Error("Failed to create session");
    }

    return { sessionId, expiresAt };
  }

  // Fallback to in-memory storage
  console.log("[Dev] Using in-memory session storage");
  startInMemoryCleanup();

  const sessionId = crypto.randomUUID();
  inMemorySessions.set(sessionId, {
    themeConfig,
    productType,
    createdAt: now,
    expiresAt,
  });

  return { sessionId, expiresAt };
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string): Promise<SessionData | null> {
  // Use Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await (supabase.from("theme_sessions") as ReturnType<typeof supabase.from>)
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !data) {
      if (error?.code !== "PGRST116") {
        // PGRST116 = not found, which is normal
        console.error("Failed to get session from Supabase:", error);
      }
      return null;
    }

    // Cast to our row type
    const row = data as unknown as ThemeSessionRow;

    // Check if expired
    const sessionExpiresAt = new Date(row.expires_at).getTime();
    if (sessionExpiresAt < Date.now()) {
      // Session expired, delete it
      await deleteSession(sessionId);
      return null;
    }

    // Convert back to ThemeConfig format
    const storedConfig = row.theme_config;
    const themeConfig: ThemeConfig = {
      name: storedConfig.name,
      displayName: storedConfig.displayName,
      author: storedConfig.author,
      colors: storedConfig.colors,
    };

    return {
      themeConfig,
      productType: row.product_type,
      createdAt: new Date(row.created_at).getTime(),
      expiresAt: sessionExpiresAt,
    };
  }

  // Fallback to in-memory
  const session = inMemorySessions.get(sessionId);
  
  if (!session) {
    return null;
  }

  // Check if expired
  if (session.expiresAt < Date.now()) {
    inMemorySessions.delete(sessionId);
    return null;
  }

  return session;
}

/**
 * Delete session by ID
 */
export async function deleteSession(sessionId: string): Promise<void> {
  // Use Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();

    const { error } = await (supabase.from("theme_sessions") as ReturnType<typeof supabase.from>)
      .delete()
      .eq("id", sessionId);

    if (error) {
      console.error("Failed to delete session from Supabase:", error);
    }
    return;
  }

  // Fallback to in-memory
  inMemorySessions.delete(sessionId);
}

/**
 * Clean up expired sessions (for Supabase)
 * Can be called periodically via cron or on-demand
 */
export async function cleanExpiredSessions(): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await (supabase.from("theme_sessions") as ReturnType<typeof supabase.from>)
    .delete()
    .lt("expires_at", now)
    .select("id");

  if (error) {
    console.error("Failed to clean expired sessions:", error);
    return 0;
  }

  return (data as unknown[])?.length || 0;
}
