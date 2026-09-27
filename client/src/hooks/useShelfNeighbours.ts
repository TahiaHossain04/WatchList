import { useEffect, useState } from "react";
import { listEntries } from "../services/entriesApi";
import type { Entry } from "../types/entry";
import { typeGroupOf } from "../utils/labels";

/**
 * Previous / next titles for the entry page, so you can flip through a shelf
 * without going back to it.
 *
 * The collection page remembers the exact order you were looking at (after the
 * Dramas/Movies toggle, search, sort and ♥ Favourites) in sessionStorage.
 * If you arrived some other way (a shared link), it falls back to the same
 * collection + kind, A–Z.
 */

const STORAGE_KEY = "twl-shelf-order";

interface SavedShelf {
  items: { id: string; title: string }[];
  path: string; // the shelf's full URL incl. filters, for the back link
}

/** Called by the collection page whenever the visible list changes. */
export function rememberShelfOrder(entries: Entry[], path: string) {
  try {
    const data: SavedShelf = { items: entries.map((e) => ({ id: e.id, title: e.title })), path };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable — the fallback order still works.
  }
}

function readShelfOrder(): SavedShelf | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedShelf) : null;
  } catch {
    return null;
  }
}

export interface Neighbours {
  prev: { id: string; title: string } | null;
  next: { id: string; title: string } | null;
  position: number; // 1-based
  total: number;
  backPath: string | null; // the shelf you came from, with its filters (null = unknown)
}

export function useShelfNeighbours(entry: Entry | null): Neighbours | null {
  const [items, setItems] = useState<{ id: string; title: string }[] | null>(null);
  const [backPath, setBackPath] = useState<string | null>(null);

  useEffect(() => {
    if (!entry) return;
    const saved = readShelfOrder();
    if (saved?.items.some((i) => i.id === entry.id)) {
      setItems(saved.items);
      setBackPath(saved.path);
      return;
    }
    // Fallback: same status + collection + kind, alphabetical.
    setBackPath(null);
    let cancelled = false;
    listEntries({ status: entry.status, collection: entry.collection })
      .then((list) => {
        if (cancelled) return;
        const group = typeGroupOf(entry.media_type);
        setItems(
          list
            .filter((e) => typeGroupOf(e.media_type) === group)
            .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }))
            .map((e) => ({ id: e.id, title: e.title })),
        );
      })
      .catch(() => !cancelled && setItems(null));
    return () => {
      cancelled = true;
    };
    // Only re-run when the entry itself (or where it lives) changes.
  }, [entry?.id, entry?.status, entry?.collection, entry?.media_type]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!entry || !items) return null;
  const index = items.findIndex((i) => i.id === entry.id);
  if (index === -1) return null;
  return {
    backPath,
    prev: items[index - 1] ?? null,
    next: items[index + 1] ?? null,
    position: index + 1,
    total: items.length,
  };
}
