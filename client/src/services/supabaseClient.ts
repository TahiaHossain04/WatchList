import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client — used ONLY for logging in/out.
 * It uses the public "anon" key, which is safe to ship to the browser.
 * All data goes through our Express API (services/entriesApi.ts).
 *
 * `null` when the env vars are missing → the site runs in demo mode.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
