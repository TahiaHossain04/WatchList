import { z } from "zod";

/**
 * The shape of a watch-list entry, shared by validation, services and controllers.
 * Field names match the database columns (snake_case) so no mapping layer is needed.
 */

export const WATCH_STATUSES = ["watched", "watching", "abandoned", "want_to_watch"] as const;
export const MEDIA_TYPES = ["show", "movie", "documentary", "other"] as const;
// "Collection" = origin group. Labels shown on the site: korean → K-Drama, chinese → C-Drama,
// english → North American, hindi → Indian. Real genres can be added later separately.
export const COLLECTIONS = ["korean", "chinese", "anime", "thai", "english", "hindi", "other"] as const;

// Tahia's mark on a title: a heart (one of her favourites) or a cross (watched it, didn't love it).
export const REACTIONS = ["favorite", "dislike"] as const;

export type WatchStatus = (typeof WATCH_STATUSES)[number];
export type Reaction = (typeof REACTIONS)[number];
export type MediaType = (typeof MEDIA_TYPES)[number];
export type Collection = (typeof COLLECTIONS)[number];

/**
 * Favourite numbers are unique within one collection AND one kind of title,
 * e.g. K-Drama dramas have their own #1, #2… and K-Drama movies have theirs.
 */
export type TypeGroup = "series" | "movies" | "more";
export function typeGroup(mediaType: MediaType): TypeGroup {
  return mediaType === "show" ? "series" : mediaType === "movie" ? "movies" : "more";
}

/** Turns "" / whitespace into null so optional text fields are stored as NULL. */
const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().max(max).nullable().optional(),
  );

const optionalInt = (min: number, max: number) =>
  z.number().int().min(min).max(max).nullable().optional();

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD")
  .nullable()
  .optional();

const entryFields = {
  title: z.string().trim().min(1, "Title is required").max(200),
  status: z.enum(WATCH_STATUSES),
  media_type: z.enum(MEDIA_TYPES),
  collection: z.enum(COLLECTIONS),

  director: optionalText(200),
  actors: z.array(z.string().trim().min(1).max(120)).max(50).nullable().optional(),
  date_watched: optionalDate,
  rating: z.number().min(0).max(10).multipleOf(0.5).nullable().optional(),
  comment: optionalText(5000),
  poster_url: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.url({ protocol: /^https?$/, message: "Poster must be an http(s) link" }).max(1000).nullable().optional(),
  ),
  synopsis: optionalText(5000),
  release_year: optionalInt(1870, 2100),
  total_episodes: optionalInt(1, 10000),

  // Progress: "currently at" for watching, "stopped at" for abandoned.
  last_watched_at: optionalDate,
  last_season: optionalInt(0, 1000),
  last_episode: optionalInt(0, 10000),
  last_timestamp: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z
      .string()
      .regex(/^\d{1,3}:[0-5]\d(:[0-5]\d)?$/, "Use mm:ss or h:mm:ss")
      .nullable()
      .optional(),
  ),

  // Favourite (heart, optionally ranked #1, #2…) or dislike (cross, shown greyed out).
  reaction: z.enum(REACTIONS).nullable().optional(),
  favorite_rank: optionalInt(1, 9999),

  // External ids — reserved for TMDB / Jikan / Wikipedia integration later.
  tmdb_id: optionalInt(1, Number.MAX_SAFE_INTEGER),
  jikan_id: optionalInt(1, Number.MAX_SAFE_INTEGER),
  wikipedia_title: optionalText(300),
};

export const createEntrySchema = z.object(entryFields).strict();
export const updateEntrySchema = z.object(entryFields).partial().strict();

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;

export interface Entry {
  id: string;
  title: string;
  status: WatchStatus;
  media_type: MediaType;
  collection: Collection;
  director: string | null;
  actors: string[] | null;
  date_watched: string | null;
  rating: number | null;
  comment: string | null;
  poster_url: string | null;
  synopsis: string | null;
  release_year: number | null;
  total_episodes: number | null;
  last_watched_at: string | null;
  last_season: number | null;
  last_episode: number | null;
  last_timestamp: string | null;
  reaction: Reaction | null;
  favorite_rank: number | null;
  tmdb_id: number | null;
  jikan_id: number | null;
  wikipedia_title: string | null;
  created_at: string;
  updated_at: string;
}

/** Query-string filters accepted by GET /api/entries. */
export const entryFiltersSchema = z.object({
  status: z.enum(WATCH_STATUSES).optional(),
  collection: z.enum(COLLECTIONS).optional(),
  type: z.enum(MEDIA_TYPES).optional(),
  search: z.string().trim().max(200).optional(),
});

export type EntryFilters = z.infer<typeof entryFiltersSchema>;
