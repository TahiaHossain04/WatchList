import { config, DEMO_ADMIN_TOKEN } from "../config.js";
import { supabaseAdmin } from "./supabase.js";

export interface AdminUser {
  id: string;
  email: string;
}

/**
 * Checks a bearer token and returns the admin user, or null if the token is
 * missing/invalid or belongs to anyone other than ADMIN_EMAIL.
 */
export async function verifyAdminToken(token: string | undefined): Promise<AdminUser | null> {
  if (!token) return null;

  if (!supabaseAdmin) {
    // Demo mode: a fixed token, and only outside production.
    return !config.isProduction && token === DEMO_ADMIN_TOKEN
      ? { id: "demo", email: "demo@local" }
      : null;
  }

  if (!config.adminEmail) {
    console.warn("[auth] ADMIN_EMAIL is not set — refusing all write requests.");
    return null;
  }

  // Supabase verifies the JWT signature + expiry for us.
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user?.email) return null;
  if (data.user.email.toLowerCase() !== config.adminEmail) return null;

  return { id: data.user.id, email: data.user.email };
}
