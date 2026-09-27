import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as auth from "../services/authService";
import { fetchAdminStatus } from "../services/entriesApi";

/**
 * Knows whether the visitor is the logged-in admin.
 * `isAdmin` is confirmed by the server (/api/auth/me), not just by "has a session".
 * Note: this only decides what the UI shows — the API enforces the real rules.
 */

interface AuthContextValue {
  isAdmin: boolean;
  email: string | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const signedInEmail = await auth.getSignedInEmail();
    if (!signedInEmail) {
      setIsAdmin(false);
      setEmail(null);
      setLoading(false);
      return;
    }
    try {
      const status = await fetchAdminStatus();
      setIsAdmin(status.isAdmin);
    } catch {
      setIsAdmin(false);
    }
    setEmail(signedInEmail);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    return auth.onAuthChange(() => {
      // Supabase warns against awaiting inside its callback — defer the work.
      setTimeout(refresh, 0);
    });
  }, [refresh]);

  const signIn = useCallback(
    async (userEmail: string, password: string) => {
      await auth.signIn(userEmail, password);
      await refresh();
    },
    [refresh],
  );

  const signOut = useCallback(async () => {
    await auth.signOut();
    await refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ isAdmin, email, loading, isDemo: auth.isDemoAuth, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
