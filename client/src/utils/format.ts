import type { Entry } from "../types/entry";

/** "2024-06-02" → "June 2, 2024". Parsed as a local date so it never shifts a day. */
export function formatDate(value: string | null): string | null {
  if (!value) return null;
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** 9 → "9", 9.5 → "9.5" */
export function formatRating(rating: number | null): string | null {
  if (rating == null) return null;
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

/** "Season 2 • Episode 7 • 32:14" — only the parts that exist. Null if nothing exists. */
export function formatProgress(entry: Pick<Entry, "last_season" | "last_episode" | "last_timestamp">) {
  const parts: string[] = [];
  if (entry.last_season != null) parts.push(`Season ${entry.last_season}`);
  if (entry.last_episode != null) parts.push(`Episode ${entry.last_episode}`);
  if (entry.last_timestamp) parts.push(entry.last_timestamp);
  return parts.length ? parts.join(" • ") : null;
}

/** 0–1 progress through a show when both the episode and total are known. */
export function progressFraction(entry: Pick<Entry, "last_episode" | "total_episodes">): number | null {
  if (entry.last_episode == null || !entry.total_episodes) return null;
  return Math.min(1, Math.max(0, entry.last_episode / entry.total_episodes));
}

/** Small deterministic hash so each book gets the same height/tilt on every visit. */
export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
