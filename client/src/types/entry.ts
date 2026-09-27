/**
 * Types for a watch-list entry. These mirror server/src/types/entry.ts and the
 * `entries` table, so field names are snake_case exactly like the database.
 */

export type WatchStatus = "watched" | "watching" | "abandoned" | "want_to_watch";
export type MediaType = "show" | "movie" | "documentary" | "other";
/** Origin group — NOT a genre. Real genres can be added as their own field later. */
export type Collection = "korean" | "chinese" | "anime" | "thai" | "english" | "hindi" | "other";
/** Tahia's mark: a heart (favourite) or a cross (watched it, didn't love it). */
export type Reaction = "favorite" | "dislike";

export interface Entry {
  id: string;
  title: string;
  status: WatchStatus;
  media_type: MediaType;
  collection: Collection;

  director: string | null;
  actors: string[] | null;
  date_watched: string | null; // YYYY-MM-DD
  rating: number | null; // 0–10
  comment: string | null;
  poster_url: string | null;
  synopsis: string | null;
  release_year: number | null;
  total_episodes: number | null;

  /** Progress — "currently at" for watching, "stopped at" for abandoned. */
  last_watched_at: string | null;
  last_season: number | null;
  last_episode: number | null;
  last_timestamp: string | null; // "mm:ss" or "h:mm:ss"

  /** Heart / cross. Favourites can also have a number (#1 = most loved), unique per collection + kind. */
  reaction: Reaction | null;
  favorite_rank: number | null;

  tmdb_id: number | null;
  jikan_id: number | null;
  wikipedia_title: string | null;

  created_at: string;
  updated_at: string;
}

/** What the form sends when creating/updating (everything except server-managed fields). */
export type EntryInput = Omit<Entry, "id" | "created_at" | "updated_at">;

/** External ids are filled in by metadata integrations (TMDB, Jikan…), not typed by hand. */
export type ExternalIdKey = "tmdb_id" | "jikan_id" | "wikipedia_title";

/** What the entry form sends — external ids are optional so edits never wipe them. */
export type EntryPayload = Omit<EntryInput, ExternalIdKey> & Partial<Pick<EntryInput, ExternalIdKey>>;
