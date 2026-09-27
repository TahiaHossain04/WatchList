import { useCallback, useEffect, useState } from "react";
import { listEntries } from "../services/entriesApi";
import type { Collection, Entry, WatchStatus } from "../types/entry";

/**
 * Loads every entry with a given status (and optionally one collection).
 * Filtering/sorting then happens in the browser (useLibraryFilters) — instant,
 * and plenty fast for a personal library.
 */
export function useEntries(status: WatchStatus, collection?: Collection) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listEntries({ status, collection })
      .then((data) => !cancelled && setEntries(data))
      .catch((err: Error) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status, collection, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { entries, loading, error, reload };
}
