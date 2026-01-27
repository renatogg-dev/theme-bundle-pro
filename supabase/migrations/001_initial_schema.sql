-- Theme Bundle - Initial Database Schema
-- Run this migration to set up the required tables for the theme store

-- =============================================
-- Table: theme_sessions
-- Stores temporary purchase session data
-- =============================================
CREATE TABLE IF NOT EXISTS theme_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_config JSONB NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('single', 'bundle', 'team')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Index for cleaning up expired sessions
CREATE INDEX IF NOT EXISTS idx_theme_sessions_expires_at 
  ON theme_sessions (expires_at);

-- Comment for documentation
COMMENT ON TABLE theme_sessions IS 'Temporary storage for theme configurations during purchase flow';
COMMENT ON COLUMN theme_sessions.theme_config IS 'JSON object containing theme name, displayName, author, and colors';
COMMENT ON COLUMN theme_sessions.product_type IS 'Purchase tier: single, bundle, or team';
COMMENT ON COLUMN theme_sessions.expires_at IS 'Session expiration time (default 24h after creation)';

-- =============================================
-- Table: download_tokens
-- Stores download access tokens for purchased themes
-- =============================================
CREATE TABLE IF NOT EXISTS download_tokens (
  token UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  purchase_id TEXT NOT NULL,
  theme_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Index for cleaning up expired tokens
CREATE INDEX IF NOT EXISTS idx_download_tokens_expires_at 
  ON download_tokens (expires_at);

-- Index for looking up by purchase
CREATE INDEX IF NOT EXISTS idx_download_tokens_purchase_id 
  ON download_tokens (purchase_id);

-- Comment for documentation
COMMENT ON TABLE download_tokens IS 'Download access tokens for purchased theme packages';
COMMENT ON COLUMN download_tokens.storage_path IS 'Path to ZIP file in Supabase Storage (downloads bucket)';
COMMENT ON COLUMN download_tokens.purchase_id IS 'Gumroad sale_id or internal purchase identifier';
COMMENT ON COLUMN download_tokens.expires_at IS 'Token expiration time (default 7 days after creation)';

-- =============================================
-- Row Level Security (RLS) Policies
-- These tables are only accessed server-side with service role
-- =============================================

-- Enable RLS (but allow service role to bypass)
ALTER TABLE theme_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_tokens ENABLE ROW LEVEL SECURITY;

-- Service role has full access (these policies are for documentation,
-- service role bypasses RLS by default)
CREATE POLICY "Service role full access to theme_sessions"
  ON theme_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to download_tokens"
  ON download_tokens
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- Cleanup Functions (optional, for scheduled cleanup)
-- =============================================

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM theme_sessions
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Function to clean expired download tokens
CREATE OR REPLACE FUNCTION clean_expired_download_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM download_tokens
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Combined cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS TABLE(sessions_deleted INTEGER, tokens_deleted INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  sessions_deleted := clean_expired_sessions();
  tokens_deleted := clean_expired_download_tokens();
  RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION cleanup_expired_data IS 'Call periodically to clean up expired sessions and download tokens';
