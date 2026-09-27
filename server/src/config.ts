import "dotenv/config";

/**
 * Central place for reading environment variables.
 * Everything else in the server imports from here instead of touching process.env.
 */
// Accept the URL with or without a copied "/rest/v1" suffix.
const supabaseUrl = (process.env.SUPABASE_URL?.trim() || "").replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";

export const config = {
  port: Number(process.env.PORT) || 4000,
  isProduction: process.env.NODE_ENV === "production",
  clientOrigins: (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  supabaseUrl,
  supabaseServiceRoleKey,
  adminEmail: process.env.ADMIN_EMAIL?.trim().toLowerCase() || "",
  tmdbApiKey: process.env.TMDB_API_KEY?.trim() || "",
  /** Demo mode = no Supabase credentials. Data lives in memory and resets on restart. */
  demoMode: !supabaseUrl || !supabaseServiceRoleKey,
};

/** Token the client uses in demo mode. Never accepted in production. */
export const DEMO_ADMIN_TOKEN = "demo-admin-token";
