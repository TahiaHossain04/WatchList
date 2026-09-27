import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingBubbles } from "../ui/LoadingBubbles";

/**
 * Wrap admin-only pages in this. Visitors get sent to /login (and come back afterwards).
 * The server checks again on every write — this just keeps the UI tidy.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingBubbles label="Checking who you are…" />;
  if (!isAdmin) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <>{children}</>;
}
