import { useEffect, useState } from "react";
import { ApiError } from "../services/apiClient";
import { getEntry } from "../services/entriesApi";
import type { Entry } from "../types/entry";

/** Loads a single entry by id (for the detail + edit pages). */
export function useEntry(id: string | undefined) {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    getEntry(id)
      .then((data) => !cancelled && setEntry(data))
      .catch((err: Error) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else setError(err.message);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { entry, setEntry, loading, error, notFound };
}
