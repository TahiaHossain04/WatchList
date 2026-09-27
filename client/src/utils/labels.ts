import type { Collection, MediaType, WatchStatus } from "../types/entry";

/**
 * Human-readable labels, page routes and colors for statuses, types and collections.
 * Add / rename / reorder things here and the whole site follows.
 */

export interface StatusInfo {
  value: WatchStatus;
  label: string; // shown on buttons + page titles
  shortLabel: string; // shown in the navbar
  path: string; // page route
  emptyTitle: string;
  emptyMessage: string;
}

export const STATUSES: StatusInfo[] = [
  {
    value: "watched",
    label: "Watched",
    shortLabel: "Watched",
    path: "/watched",
    emptyTitle: "The shelves are bare.",
    emptyMessage: "Nothing watched yet — or at least nothing written down.",
  },
  {
    value: "watching",
    label: "Currently Watching",
    shortLabel: "Watching",
    path: "/watching",
    emptyTitle: "Nothing on the go.",
    emptyMessage: "A rare moment of peace between shows.",
  },
  {
    value: "want_to_watch",
    label: "Want to Watch",
    shortLabel: "Want to Watch",
    path: "/want-to-watch",
    emptyTitle: "Nothing here yet.",
    emptyMessage: "Apparently Tahia has finally run out of things to watch.",
  },
  {
    value: "abandoned",
    label: "Abandoned",
    shortLabel: "Abandoned",
    path: "/abandoned",
    emptyTitle: "No abandoned shows.",
    emptyMessage: "Every single one got finished. Impressive, honestly.",
  },
];

export const STATUS_BY_VALUE = Object.fromEntries(STATUSES.map((s) => [s.value, s])) as Record<
  WatchStatus,
  StatusInfo
>;

export const MEDIA_TYPES: { value: MediaType; label: string; plural: string }[] = [
  { value: "show", label: "Show", plural: "Shows" },
  { value: "movie", label: "Movie", plural: "Movies" },
  { value: "documentary", label: "Documentary", plural: "Documentaries" },
  { value: "other", label: "Other", plural: "Other" },
];

export const MEDIA_TYPE_LABEL = Object.fromEntries(MEDIA_TYPES.map((t) => [t.value, t.label])) as Record<
  MediaType,
  string
>;

/**
 * Collections, in the order their TV "channels" appear.
 *   value       – what's stored in the database (never change these)
 *   label       – what the site shows (rename freely)
 *   slug        – the URL piece, e.g. /watched/k-drama
 *   seriesLabel – what the "shows" side of the Dramas/Movies toggle is called
 */
export interface CollectionInfo {
  value: Collection;
  label: string;
  slug: string;
  seriesLabel: string;
}

export const COLLECTIONS: CollectionInfo[] = [
  { value: "korean", label: "K-Drama", slug: "k-drama", seriesLabel: "Dramas" },
  { value: "chinese", label: "C-Drama", slug: "c-drama", seriesLabel: "Dramas" },
  { value: "anime", label: "Anime", slug: "anime", seriesLabel: "Series" },
  { value: "thai", label: "Thai", slug: "thai", seriesLabel: "Dramas" },
  { value: "english", label: "North American", slug: "north-american", seriesLabel: "Shows" },
  { value: "hindi", label: "Indian", slug: "indian", seriesLabel: "Shows" },
  { value: "other", label: "Other", slug: "other", seriesLabel: "Shows" },
];

export const COLLECTION_BY_SLUG: Record<string, CollectionInfo | undefined> = Object.fromEntries(
  COLLECTIONS.map((c) => [c.slug, c]),
);
export const COLLECTION_INFO = Object.fromEntries(COLLECTIONS.map((c) => [c.value, c])) as Record<
  Collection,
  CollectionInfo
>;

/** URL of one collection's shelf, e.g. collectionPath("watched", "korean") → "/watched/k-drama". */
export function collectionPath(status: WatchStatus, collection: Collection): string {
  return `${STATUS_BY_VALUE[status].path}/${COLLECTION_INFO[collection].slug}`;
}

/**
 * The toggle on a collection page, so dramas and movies don't pile up together.
 * "more" (documentaries + other) only appears when there's something in it.
 */
export type TypeGroup = "series" | "movies" | "more";
export const TYPE_GROUPS: { value: TypeGroup; types: MediaType[]; label: (c: CollectionInfo) => string }[] = [
  { value: "series", types: ["show"], label: (c) => c.seriesLabel },
  { value: "movies", types: ["movie"], label: () => "Movies" },
  { value: "more", types: ["documentary", "other"], label: () => "Docs & more" },
];

/** Which Dramas/Movies/Docs group a media type belongs to (favourite numbers are counted per group). */
export function typeGroupOf(mediaType: MediaType): TypeGroup {
  return mediaType === "show" ? "series" : mediaType === "movie" ? "movies" : "more";
}

export const COLLECTION_LABEL = Object.fromEntries(COLLECTIONS.map((c) => [c.value, c.label])) as Record<
  Collection,
  string
>;

/** Spine / placeholder color for each collection — values live in styles/theme.css. */
export const COLLECTION_COLOR: Record<Collection, string> = {
  korean: "var(--spine-korean)",
  chinese: "var(--spine-chinese)",
  anime: "var(--spine-anime)",
  english: "var(--spine-english)",
  hindi: "var(--spine-hindi)",
  thai: "var(--spine-thai)",
  other: "var(--spine-other)",
};
