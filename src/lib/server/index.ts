/**
 * Server-side utilities
 * Re-exports all server-only modules
 */

export { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";
export type { Database, ThemeSessionConfig } from "./supabase";

export {
  createSession,
  getSession,
  deleteSession,
  cleanExpiredSessions,
} from "./sessions-store";
export type { SessionData } from "./sessions-store";

export {
  uploadZipFile,
  createDownloadToken,
  getDownloadToken,
  downloadFile,
  buildDownloadUrl,
  cleanExpiredTokens,
} from "./downloads-store";
export type { DownloadToken } from "./downloads-store";

export {
  createBuyerAccess,
  validateBuyerAccess,
  getBuyerAccessById,
  markAccessAsUsed,
  getAccessByPurchaseId,
  cleanExpiredBuyerAccess,
  generateVerificationCode,
} from "./buyer-access-store";
export type { BuyerAccess } from "./buyer-access-store";
