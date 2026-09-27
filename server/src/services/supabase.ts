import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config.js";

/**
 * Server-side Supabase client using the SECRET service-role key.
 * It bypasses Row Level Security, which is why every write route is guarded by requireAdmin.
 * `null` in demo mode.
 */
export const supabaseAdmin: SupabaseClient | null = config.demoMode
  ? null
  : createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
