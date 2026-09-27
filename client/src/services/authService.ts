import { supabase } from "./supabaseClient";

/**
 * Login/logout helpers. Two modes:
 *  - Supabase mode: real email + password via Supabase Auth.
 *  - Demo mode (no Supabase env vars): password "demo" gives a local-only admin token
 *    that the server accepts only when it's also in demo mode.
 */

export const isDemoAuth = !supabase;

const DEMO_TOKEN = "demo-admin-token";
const DEMO_STORAGE_KEY = "twl-demo-session";
const listeners = new Set<() => void>();

function readDemoSession(): { email: string } | null {
  try {
    const raw = sessionStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as { email: string }) : null;
  } catch {
    return null;
  }
}

export class LoginError extends Error {}

export async function signIn(email: string, password: string): Promise<void> {
  if (supabase) {
    let result;
    try {
      result = await supabase.auth.signInWithPassword({ email, password });
    } catch {
      throw new LoginError("Couldn't reach the login server. Check your connection and try again.");
    }
    if (result.error) {
      const status = result.error.status ?? 0;
      if (status === 0 || status >= 500) {
        throw new LoginError("Couldn't reach the login server. Check your connection and try again.");
      }
      throw new LoginError("That email and password don't match. Try again?");
    }
    return;
  }

  if (password !== "demo") throw new LoginError("In demo mode the password is “demo”.");
  sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ email }));
  listeners.forEach((fn) => fn());
}

export async function signOut(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
    return;
  }
  sessionStorage.removeItem(DEMO_STORAGE_KEY);
  listeners.forEach((fn) => fn());
}

/** The token sent to our API in the Authorization header (null when logged out). */
export async function getAccessToken(): Promise<string | null> {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }
  return readDemoSession() ? DEMO_TOKEN : null;
}

export async function getSignedInEmail(): Promise<string | null> {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.email ?? null;
  }
  return readDemoSession()?.email ?? null;
}

/** Calls `callback` whenever the user logs in or out. Returns an unsubscribe function. */
export function onAuthChange(callback: () => void): () => void {
  if (supabase) {
    const { data } = supabase.auth.onAuthStateChange(() => callback());
    return () => data.subscription.unsubscribe();
  }
  listeners.add(callback);
  return () => listeners.delete(callback);
}
