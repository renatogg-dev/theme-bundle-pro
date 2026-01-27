/**
 * Supabase Server Client
 * Uses Service Role key for server-side operations
 * 
 * IMPORTANT: This module should only be imported in server-side code (API routes, etc.)
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ThemeColors } from "@/lib/exporters/types";

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      theme_sessions: {
        Row: {
          id: string;
          theme_config: ThemeSessionConfig;
          product_type: "single" | "bundle" | "team";
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          theme_config: ThemeSessionConfig;
          product_type: "single" | "bundle" | "team";
          created_at?: string;
          expires_at: string;
        };
        Update: {
          id?: string;
          theme_config?: ThemeSessionConfig;
          product_type?: "single" | "bundle" | "team";
          created_at?: string;
          expires_at?: string;
        };
      };
      download_tokens: {
        Row: {
          token: string;
          storage_path: string;
          purchase_id: string;
          theme_name: string;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          token?: string;
          storage_path: string;
          purchase_id: string;
          theme_name: string;
          created_at?: string;
          expires_at: string;
        };
        Update: {
          token?: string;
          storage_path?: string;
          purchase_id?: string;
          theme_name?: string;
          created_at?: string;
          expires_at?: string;
        };
      };
    };
  };
}

// Theme config stored in database (JSON-serializable)
export interface ThemeSessionConfig {
  name: string;
  displayName: string;
  author?: string;
  colors: ThemeColors;
}

// Singleton instance
let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Get Supabase client with Service Role (server-side only)
 * Creates a singleton instance to reuse connections
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
      "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseInstance;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
