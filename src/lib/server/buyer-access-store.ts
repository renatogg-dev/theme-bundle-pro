/**
 * Buyer Access Store
 * Manages buyer access credentials for the customization portal
 * Uses Supabase Postgres with in-memory fallback for development
 */

import { getSupabaseAdmin, isSupabaseConfigured, type ThemeSessionConfig } from "./supabase";
import type { ThemeConfig } from "@/lib/exporters/types";

export interface BuyerAccess {
  id: string;
  email: string;
  verificationCode: string;
  purchaseId: string;
  productType: "single" | "bundle";
  selectedTheme: string | null;
  themeConfig: ThemeConfig | null;
  used: boolean;
  createdAt: number;
  expiresAt: number;
}

// Database row type
interface BuyerAccessRow {
  id: string;
  email: string;
  verification_code: string;
  purchase_id: string;
  product_type: "single" | "bundle";
  selected_theme: string | null;
  theme_config: ThemeSessionConfig | null;
  used: boolean;
  created_at: string;
  expires_at: string;
}

// In-memory fallback for development
const inMemoryAccess = new Map<string, BuyerAccess>();

// Cleanup interval for in-memory storage
let cleanupInterval: NodeJS.Timeout | null = null;

function startInMemoryCleanup() {
  if (cleanupInterval) return;

  cleanupInterval = setInterval(() => {
    const now = Date.now();
    const idsToDelete: string[] = [];

    inMemoryAccess.forEach((access, id) => {
      if (access.expiresAt < now) {
        idsToDelete.push(id);
      }
    });

    idsToDelete.forEach((id) => inMemoryAccess.delete(id));
  }, 5 * 60 * 1000); // Every 5 minutes
}

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create buyer access record
 */
export async function createBuyerAccess(params: {
  email: string;
  purchaseId: string;
  productType: "single" | "bundle";
  selectedTheme?: string;
  themeConfig?: ThemeConfig;
  expiresInDays?: number;
}): Promise<{ accessId: string; verificationCode: string; expiresAt: number }> {
  const {
    email,
    purchaseId,
    productType,
    selectedTheme,
    themeConfig,
    expiresInDays = 30,
  } = params;

  const now = Date.now();
  const expiresAt = now + expiresInDays * 24 * 60 * 60 * 1000;
  const verificationCode = generateVerificationCode();
  const accessId = crypto.randomUUID();

  // Use Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();

    // Convert ThemeConfig to storage format if provided
    let storedConfig: ThemeSessionConfig | null = null;
    if (themeConfig) {
      storedConfig = {
        name: themeConfig.name,
        displayName: themeConfig.displayName,
        author: themeConfig.author,
        colors: themeConfig.colors,
      };
    }

    const insertData = {
      id: accessId,
      email: email.toLowerCase().trim(),
      verification_code: verificationCode,
      purchase_id: purchaseId,
      product_type: productType,
      selected_theme: selectedTheme || null,
      theme_config: storedConfig,
      used: false,
      expires_at: new Date(expiresAt).toISOString(),
    };

    const { error } = await (supabase.from("buyer_access") as ReturnType<typeof supabase.from>).insert(insertData);

    if (error) {
      console.error("Failed to create buyer access in Supabase:", error);
      throw new Error("Failed to create buyer access");
    }

    return { accessId, verificationCode, expiresAt };
  }

  // Fallback to in-memory storage
  console.log("[Dev] Using in-memory buyer access storage");
  startInMemoryCleanup();

  const access: BuyerAccess = {
    id: accessId,
    email: email.toLowerCase().trim(),
    verificationCode,
    purchaseId,
    productType,
    selectedTheme: selectedTheme || null,
    themeConfig: themeConfig || null,
    used: false,
    createdAt: now,
    expiresAt,
  };

  inMemoryAccess.set(accessId, access);

  return { accessId, verificationCode, expiresAt };
}

/**
 * Validate buyer access credentials (email + code)
 */
export async function validateBuyerAccess(
  email: string,
  code: string
): Promise<BuyerAccess | null> {
  const normalizedEmail = email.toLowerCase().trim();

  // Use Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await (supabase.from("buyer_access") as ReturnType<typeof supabase.from>)
      .select("*")
      .eq("email", normalizedEmail)
      .eq("verification_code", code)
      .single();

    if (error || !data) {
      if (error?.code !== "PGRST116") {
        console.error("Failed to validate buyer access:", error);
      }
      return null;
    }

    const row = data as unknown as BuyerAccessRow;

    // Check if expired
    const accessExpiresAt = new Date(row.expires_at).getTime();
    if (accessExpiresAt < Date.now()) {
      return null;
    }

    // Convert back to BuyerAccess format
    let themeConfig: ThemeConfig | null = null;
    if (row.theme_config) {
      themeConfig = {
        name: row.theme_config.name,
        displayName: row.theme_config.displayName,
        author: row.theme_config.author,
        colors: row.theme_config.colors,
      };
    }

    return {
      id: row.id,
      email: row.email,
      verificationCode: row.verification_code,
      purchaseId: row.purchase_id,
      productType: row.product_type,
      selectedTheme: row.selected_theme,
      themeConfig,
      used: row.used,
      createdAt: new Date(row.created_at).getTime(),
      expiresAt: accessExpiresAt,
    };
  }

  // Fallback to in-memory
  for (const access of inMemoryAccess.values()) {
    if (
      access.email === normalizedEmail &&
      access.verificationCode === code &&
      access.expiresAt > Date.now()
    ) {
      return access;
    }
  }

  return null;
}

/**
 * Get buyer access by ID
 */
export async function getBuyerAccessById(accessId: string): Promise<BuyerAccess | null> {
  // Use Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await (supabase.from("buyer_access") as ReturnType<typeof supabase.from>)
      .select("*")
      .eq("id", accessId)
      .single();

    if (error || !data) {
      if (error?.code !== "PGRST116") {
        console.error("Failed to get buyer access:", error);
      }
      return null;
    }

    const row = data as unknown as BuyerAccessRow;

    // Check if expired
    const accessExpiresAt = new Date(row.expires_at).getTime();
    if (accessExpiresAt < Date.now()) {
      return null;
    }

    // Convert back to BuyerAccess format
    let themeConfig: ThemeConfig | null = null;
    if (row.theme_config) {
      themeConfig = {
        name: row.theme_config.name,
        displayName: row.theme_config.displayName,
        author: row.theme_config.author,
        colors: row.theme_config.colors,
      };
    }

    return {
      id: row.id,
      email: row.email,
      verificationCode: row.verification_code,
      purchaseId: row.purchase_id,
      productType: row.product_type,
      selectedTheme: row.selected_theme,
      themeConfig,
      used: row.used,
      createdAt: new Date(row.created_at).getTime(),
      expiresAt: accessExpiresAt,
    };
  }

  // Fallback to in-memory
  const access = inMemoryAccess.get(accessId);
  if (!access || access.expiresAt < Date.now()) {
    return null;
  }

  return access;
}

/**
 * Mark buyer access as used (after download)
 */
export async function markAccessAsUsed(accessId: string): Promise<boolean> {
  // Use Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();

    const { error } = await (supabase.from("buyer_access") as ReturnType<typeof supabase.from>)
      .update({ used: true })
      .eq("id", accessId);

    if (error) {
      console.error("Failed to mark access as used:", error);
      return false;
    }

    return true;
  }

  // Fallback to in-memory
  const access = inMemoryAccess.get(accessId);
  if (access) {
    access.used = true;
    return true;
  }

  return false;
}

/**
 * Check if a purchase already has access created
 */
export async function getAccessByPurchaseId(purchaseId: string): Promise<BuyerAccess | null> {
  // Use Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await (supabase.from("buyer_access") as ReturnType<typeof supabase.from>)
      .select("*")
      .eq("purchase_id", purchaseId)
      .single();

    if (error || !data) {
      return null;
    }

    const row = data as unknown as BuyerAccessRow;

    let themeConfig: ThemeConfig | null = null;
    if (row.theme_config) {
      themeConfig = {
        name: row.theme_config.name,
        displayName: row.theme_config.displayName,
        author: row.theme_config.author,
        colors: row.theme_config.colors,
      };
    }

    return {
      id: row.id,
      email: row.email,
      verificationCode: row.verification_code,
      purchaseId: row.purchase_id,
      productType: row.product_type,
      selectedTheme: row.selected_theme,
      themeConfig,
      used: row.used,
      createdAt: new Date(row.created_at).getTime(),
      expiresAt: new Date(row.expires_at).getTime(),
    };
  }

  // Fallback to in-memory
  for (const access of inMemoryAccess.values()) {
    if (access.purchaseId === purchaseId) {
      return access;
    }
  }

  return null;
}

/**
 * Clean up expired buyer access records
 */
export async function cleanExpiredBuyerAccess(): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await (supabase.from("buyer_access") as ReturnType<typeof supabase.from>)
    .delete()
    .lt("expires_at", now)
    .select("id");

  if (error) {
    console.error("Failed to clean expired buyer access:", error);
    return 0;
  }

  return (data as unknown[])?.length || 0;
}
