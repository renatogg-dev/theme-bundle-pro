"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BuyerLoginPage() {
  const router = useRouter();
  const [licenseKey, setLicenseKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Format license key as user types (add dashes)
  const formatLicenseKey = (value: string): string => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    
    // Split into groups of 8 and join with dashes
    const groups = cleaned.match(/.{1,8}/g) || [];
    return groups.slice(0, 4).join("-");
  };

  const handleLicenseKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value);
    setLicenseKey(formatted);
  };

  // Check if license key is complete (35 chars = 32 alphanumeric + 3 dashes)
  const isValidLicenseKey = licenseKey.replace(/-/g, "").length === 32;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/buyer/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid license key. Please try again.");
        return;
      }

      // Store token in localStorage
      localStorage.setItem("buyerToken", data.token);
      
      // Redirect to customization page
      router.push("/buyer/customize");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Theme Bundle
          </h1>
          <p className="text-muted-foreground mt-2">
            Customization Portal
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Access Your Theme</CardTitle>
            <CardDescription>
              Enter the license key you received after your purchase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* License Key */}
              <div className="space-y-2">
                <label htmlFor="licenseKey" className="text-sm font-medium text-foreground">
                  License Key
                </label>
                <Input
                  id="licenseKey"
                  type="text"
                  placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
                  value={licenseKey}
                  onChange={handleLicenseKeyChange}
                  required
                  disabled={loading}
                  className="h-12 text-center font-mono text-sm tracking-wider"
                  maxLength={35}
                  autoComplete="off"
                  spellCheck={false}
                />
                <p className="text-xs text-muted-foreground">
                  You can find your license key in your Gumroad purchase confirmation
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11"
                disabled={loading || !isValidLicenseKey}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Access Theme Customization"
                )}
              </Button>
            </form>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Don&apos;t have a license key?{" "}
                <a href="/" className="text-primary hover:underline">
                  Purchase a theme
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Need help?{" "}
          <a href="mailto:support@theme-bundle-pro.xyz" className="text-primary hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </main>
  );
}
