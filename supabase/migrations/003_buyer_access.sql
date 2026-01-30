-- Theme Bundle - Buyer Access Schema
-- Stores buyer access credentials for the customization portal

-- =============================================
-- Table: buyer_access
-- Stores access credentials for theme customization portal
-- =============================================
CREATE TABLE IF NOT EXISTS buyer_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  verification_code TEXT NOT NULL,  -- 6 digit code
  purchase_id TEXT NOT NULL UNIQUE,
  product_type TEXT NOT NULL CHECK (product_type IN ('single', 'bundle')),
  selected_theme TEXT,              -- theme id for single, NULL for bundle
  theme_config JSONB,               -- pre-customized config from session (if any)
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

-- Index for login lookups (email + code combination)
CREATE INDEX IF NOT EXISTS idx_buyer_access_email_code 
  ON buyer_access (email, verification_code);

-- Index for looking up by purchase
CREATE INDEX IF NOT EXISTS idx_buyer_access_purchase_id 
  ON buyer_access (purchase_id);

-- Index for cleaning up expired access
CREATE INDEX IF NOT EXISTS idx_buyer_access_expires_at 
  ON buyer_access (expires_at);

-- Comments for documentation
COMMENT ON TABLE buyer_access IS 'Buyer access credentials for theme customization portal';
COMMENT ON COLUMN buyer_access.email IS 'Buyer email from Gumroad purchase';
COMMENT ON COLUMN buyer_access.verification_code IS '6-digit verification code sent via email';
COMMENT ON COLUMN buyer_access.purchase_id IS 'Gumroad sale_id for the purchase';
COMMENT ON COLUMN buyer_access.product_type IS 'Product tier: single (1 theme) or bundle (all themes + 1 custom)';
COMMENT ON COLUMN buyer_access.selected_theme IS 'Theme ID selected before purchase (single only)';
COMMENT ON COLUMN buyer_access.theme_config IS 'Pre-customized theme config from session (if customer customized before purchase)';
COMMENT ON COLUMN buyer_access.used IS 'Whether the buyer has already downloaded their custom theme';
COMMENT ON COLUMN buyer_access.expires_at IS 'Access expiration time (default 30 days)';

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS (service role bypasses by default)
ALTER TABLE buyer_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to buyer_access"
  ON buyer_access
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- Cleanup Function
-- =============================================

-- Function to clean expired buyer access records
CREATE OR REPLACE FUNCTION clean_expired_buyer_access()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM buyer_access
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION clean_expired_buyer_access IS 'Call periodically to clean up expired buyer access records';

-- Update combined cleanup function to include buyer_access
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS TABLE(sessions_deleted INTEGER, tokens_deleted INTEGER, access_deleted INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  sessions_deleted := clean_expired_sessions();
  tokens_deleted := clean_expired_download_tokens();
  access_deleted := clean_expired_buyer_access();
  RETURN NEXT;
END;
$$;
