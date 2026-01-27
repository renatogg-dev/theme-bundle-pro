/**
 * Purchase Flow Hook
 * Manages theme purchase workflow with Gumroad integration
 * Uses centralized Gumroad configuration from lib/gumroad.ts
 */

import { useState, useCallback } from "react";
import type { ThemeGeneratorState } from "./use-theme-generator";
import type { ThemeConfig } from "@/lib/exporters/types";
import type { ThemeId } from "@/lib/themes/types";
import { 
  buildGumroadUrl, 
  getGumroadProducts, 
  isGumroadConfigured,
  type ProductType 
} from "@/lib/gumroad";

interface UsePurchaseFlowOptions {
  /** Current theme colors from generator */
  colors: ThemeGeneratorState;
  /** Base preset ID if using a preset */
  basePresetId: ThemeId | null;
  /** Whether user has made custom changes */
  hasCustomChanges: boolean;
}

interface PurchaseSession {
  sessionId: string;
  expiresIn: number;
}

// Re-export ProductType for consumers
export type { ProductType };

/**
 * Hook for managing theme purchase workflow
 */
export function usePurchaseFlow(options: UsePurchaseFlowOptions) {
  const { colors, basePresetId, hasCustomChanges } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create theme config from current colors
   */
  const createThemeConfig = useCallback((): ThemeConfig => {
    // Generate a name for the theme
    const baseName = basePresetId || "custom";
    const displayName = hasCustomChanges
      ? `Custom ${basePresetId ? basePresetId.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Theme"}`
      : basePresetId?.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Custom Theme";

    return {
      name: `${baseName}${hasCustomChanges ? "-custom" : ""}`,
      displayName,
      author: "Theme Bundle User",
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        background: colors.background,
        foreground: colors.foreground,
        muted: colors.muted,
        // Derive additional colors
        mutedForeground: {
          h: colors.muted.h,
          s: Math.min(colors.muted.s, 15),
          l: colors.muted.l < 50 ? 65 : 45,
        },
        card: colors.background,
        cardForeground: colors.foreground,
        popover: colors.background,
        popoverForeground: colors.foreground,
        border: {
          h: colors.muted.h,
          s: colors.muted.s,
          l: colors.muted.l < 50 ? colors.muted.l + 10 : colors.muted.l - 10,
        },
        input: colors.muted,
        ring: colors.primary,
        destructive: { h: 0, s: 100, l: 67 },
        destructiveForeground: colors.foreground,
      },
    };
  }, [colors, basePresetId, hasCustomChanges]);

  /**
   * Create a session and get redirect URL
   */
  const createSession = useCallback(
    async (productType: ProductType = "bundle"): Promise<string> => {
      setIsLoading(true);
      setError(null);

      try {
        // Create theme config
        const themeConfig = createThemeConfig();

        // Call sessions API
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            themeConfig,
            productType,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create session");
        }

        const { sessionId }: PurchaseSession = await response.json();

        // Build Gumroad URL with session parameter using centralized function
        const gumroadUrl = buildGumroadUrl(productType, sessionId);

        return gumroadUrl;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Purchase failed";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [createThemeConfig]
  );

  /**
   * Start purchase flow - creates session and redirects to Gumroad
   */
  const startPurchase = useCallback(
    async (productType: ProductType = "bundle") => {
      try {
        const url = await createSession(productType);
        
        // Check if URL is valid (not a placeholder)
        if (url.startsWith("#")) {
          setError("Gumroad is not configured. Please set up your Gumroad product URLs.");
          return;
        }
        
        // Redirect to Gumroad
        window.location.href = url;
      } catch {
        // Error already set by createSession
      }
    },
    [createSession]
  );

  /**
   * Open Gumroad in new tab (without saving session - for presets only)
   */
  const openGumroadDirect = useCallback(
    (productType: ProductType = "bundle") => {
      const url = buildGumroadUrl(productType);
      
      if (url.startsWith("#")) {
        console.warn("Gumroad is not configured for product type:", productType);
        return;
      }
      
      window.open(url, "_blank", "noopener,noreferrer");
    },
    []
  );

  /**
   * Get product information
   */
  const getProducts = useCallback(() => {
    return getGumroadProducts();
  }, []);

  /**
   * Check if Gumroad is configured
   */
  const checkGumroadConfigured = useCallback(() => {
    return isGumroadConfigured();
  }, []);

  return {
    // State
    isLoading,
    error,

    // Actions
    createSession,
    startPurchase,
    openGumroadDirect,
    createThemeConfig,

    // Info
    getProducts,
    isGumroadConfigured: checkGumroadConfigured,
  };
}

export type UsePurchaseFlowReturn = ReturnType<typeof usePurchaseFlow>;
