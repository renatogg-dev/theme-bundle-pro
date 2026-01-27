"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import type { ThemeId } from "@/lib/themes/types";
import { DEFAULT_THEME_ID } from "@/lib/themes/registry";

// Debounce delay for rapid theme changes (ms)
const THEME_CHANGE_DEBOUNCE = 50;

// ============================================
// Types
// ============================================
export type CSSVariableOverrides = Record<string, string>;

// ============================================
// Theme ID Context (controls data-theme attribute)
// ============================================
interface ThemeIdContextValue {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

const ThemeIdContext = createContext<ThemeIdContextValue | null>(null);

// ============================================
// CSS Overrides Context (for Theme Studio)
// ============================================
interface CSSOverridesContextValue {
  overrides: CSSVariableOverrides;
  setOverrides: (overrides: CSSVariableOverrides) => void;
  clearOverrides: () => void;
  hasOverrides: boolean;
}

const CSSOverridesContext = createContext<CSSOverridesContextValue | null>(null);

// ============================================
// Custom hook for theme ID
// ============================================
export function useThemeId() {
  const context = useContext(ThemeIdContext);
  if (!context) {
    throw new Error("useThemeId must be used within ThemeProvider");
  }
  return context;
}

// ============================================
// Custom hook for CSS overrides
// ============================================
export function useCSSOverrides() {
  const context = useContext(CSSOverridesContext);
  if (!context) {
    throw new Error("useCSSOverrides must be used within ThemeProvider");
  }
  return context;
}

// ============================================
// Re-export next-themes hook for mode (light/dark)
// ============================================
export { useTheme as useThemeMode } from "next-themes";

// ============================================
// Combined Theme Provider
// ============================================
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultThemeId?: ThemeId;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultThemeId = DEFAULT_THEME_ID,
  storageKey = "theme-bundle-theme-id",
}: ThemeProviderProps) {
  const [themeId, setThemeIdState] = useState<ThemeId>(defaultThemeId);
  const [mounted, setMounted] = useState(false);
  const [cssOverrides, setCSSOverrides] = useState<CSSVariableOverrides>({});
  
  // Ref for debounce timer
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set theme ID with debounce and persist to localStorage
  const setThemeId = useCallback(
    (newThemeId: ThemeId) => {
      // Clear any pending theme change
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Immediately update React state for UI responsiveness
      setThemeIdState(newThemeId);
      
      // Debounce the DOM update to batch rapid changes
      debounceTimerRef.current = setTimeout(() => {
        // Update DOM (this triggers style recalculation)
        document.documentElement.setAttribute("data-theme", newThemeId);
        
        // Persist to localStorage
        try {
          localStorage.setItem(storageKey, newThemeId);
        } catch {
          // Ignore localStorage errors
        }
      }, THEME_CHANGE_DEBOUNCE);
    },
    [storageKey]
  );
  
  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Initialize from localStorage on mount
  useEffect(() => {
    setMounted(true);

    // Try to restore from localStorage
    try {
      const stored = localStorage.getItem(storageKey) as ThemeId | null;
      if (stored) {
        setThemeIdState(stored);
        document.documentElement.setAttribute("data-theme", stored);
      } else {
        // Set default theme
        document.documentElement.setAttribute("data-theme", defaultThemeId);
      }
    } catch {
      // Use default if localStorage fails
      document.documentElement.setAttribute("data-theme", defaultThemeId);
    }
  }, [defaultThemeId, storageKey]);

  // Prevent hydration mismatch
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", themeId);
    }
  }, [mounted, themeId]);

  // CSS Overrides handlers
  const setOverrides = useCallback((overrides: CSSVariableOverrides) => {
    setCSSOverrides(overrides);
  }, []);

  const clearOverrides = useCallback(() => {
    setCSSOverrides({});
  }, []);

  const hasOverrides = useMemo(
    () => Object.keys(cssOverrides).length > 0,
    [cssOverrides]
  );

  // Convert overrides to inline style object
  const overrideStyle = useMemo(() => {
    if (!hasOverrides) return undefined;
    return cssOverrides as React.CSSProperties;
  }, [cssOverrides, hasOverrides]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="theme-bundle-mode"
    >
      <ThemeIdContext.Provider value={{ themeId, setThemeId }}>
        <CSSOverridesContext.Provider
          value={{ overrides: cssOverrides, setOverrides, clearOverrides, hasOverrides }}
        >
          {/* Wrapper div applies CSS variable overrides */}
          <div
            style={overrideStyle}
            className="contents"
          >
            {children}
          </div>
        </CSSOverridesContext.Provider>
      </ThemeIdContext.Provider>
    </NextThemesProvider>
  );
}
