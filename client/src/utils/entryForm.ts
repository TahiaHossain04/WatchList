import type { Collection, Entry, EntryPayload, MediaType, Reaction, WatchStatus } from "../types/entry";

/**
 * Form helpers for EntryForm. Inputs always hold strings, so we convert:
 *   entry  → form values   (toFormValues)
 *   values → API payload   (toEntryInput)   "" becomes null, numbers get parsed
 * and check the values before sending (validateEntryForm).
 */

export interface EntryFormValues {
  title: string;
  status: WatchStatus;
  media_type: MediaType;
  collection: Collection;
  director: string;
  actors: string; // comma separated in the form, an array in the database
  date_watched: string;
  rating: string;
  comment: string;
  poster_url: string;
  synopsis: string;
  release_year: string;
  total_episodes: string;
  last_watched_at: string;
  last_season: string;
  last_episode: string;
  last_timestamp: string;
  reaction: Reaction | "";
  favorite_rank: string;
}

export type EntryFormErrors = Partial<Record<keyof EntryFormValues, string>>;

/** Which optional sections the form shows for each status. */
export const STATUS_SECTIONS: Record<WatchStatus, { verdict: boolean; progress: boolean; rating: boolean }> = {
  watched: { verdict: true, progress: false, rating: true },
  watching: { verdict: false, progress: true, rating: false },
  abandoned: { verdict: false, progress: true, rating: true },
  want_to_watch: { verdict: false, progress: false, rating: false },
};

const str = (value: string | number | null | undefined) => (value == null ? "" : String(value));

export function toFormValues(entry?: Partial<Entry>): EntryFormValues {
  return {
    title: str(entry?.title),
    status: entry?.status ?? "watched",
    media_type: entry?.media_type ?? "show",
    collection: entry?.collection ?? "korean",
    director: str(entry?.director),
    actors: entry?.actors?.join(", ") ?? "",
    date_watched: str(entry?.date_watched),
    rating: str(entry?.rating),
    comment: str(entry?.comment),
    poster_url: str(entry?.poster_url),
    synopsis: str(entry?.synopsis),
    release_year: str(entry?.release_year),
    total_episodes: str(entry?.total_episodes),
    last_watched_at: str(entry?.last_watched_at),
    last_season: str(entry?.last_season),
    last_episode: str(entry?.last_episode),
    last_timestamp: str(entry?.last_timestamp),
    reaction: entry?.reaction ?? "",
    favorite_rank: str(entry?.favorite_rank),
  };
}

const text = (value: string) => value.trim() || null;
const num = (value: string) => (value.trim() === "" ? null : Number(value));

export function toEntryInput(values: EntryFormValues): EntryPayload {
  const actors = values.actors
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  return {
    title: values.title.trim(),
    status: values.status,
    media_type: values.media_type,
    collection: values.collection,
    director: text(values.director),
    actors: actors.length ? actors : null,
    date_watched: text(values.date_watched),
    rating: num(values.rating),
    comment: text(values.comment),
    poster_url: text(values.poster_url),
    synopsis: text(values.synopsis),
    release_year: num(values.release_year),
    total_episodes: num(values.total_episodes),
    last_watched_at: text(values.last_watched_at),
    last_season: num(values.last_season),
    last_episode: num(values.last_episode),
    last_timestamp: text(values.last_timestamp),
    reaction: values.reaction || null,
    // A number only makes sense on a heart.
    favorite_rank: values.reaction === "favorite" ? num(values.favorite_rank) : null,
    // External ids (tmdb_id…) are left out on purpose — TMDB search will set them later.
  };
}

function checkInt(value: string, min: number, max: number, label: string): string | undefined {
  if (value.trim() === "") return undefined;
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) return `${label} should be a whole number from ${min} to ${max}.`;
  return undefined;
}

export function validateEntryForm(values: EntryFormValues): EntryFormErrors {
  const errors: EntryFormErrors = {};

  if (!values.title.trim()) errors.title = "Every entry needs a title.";
  else if (values.title.trim().length > 200) errors.title = "That title is a bit long (200 characters max).";

  if (values.rating.trim() !== "") {
    const r = Number(values.rating);
    if (Number.isNaN(r) || r < 0 || r > 10 || (r * 2) % 1 !== 0) errors.rating = "Ratings go from 0 to 10 in steps of 0.5.";
  }

  errors.release_year = checkInt(values.release_year, 1870, 2100, "Year");
  errors.total_episodes = checkInt(values.total_episodes, 1, 10000, "Episodes");
  errors.last_season = checkInt(values.last_season, 0, 1000, "Season");
  errors.last_episode = checkInt(values.last_episode, 0, 10000, "Episode");
  if (values.reaction === "favorite") errors.favorite_rank = checkInt(values.favorite_rank, 1, 9999, "Favourite number");

  if (values.last_timestamp.trim() && !/^\d{1,3}:[0-5]\d(:[0-5]\d)?$/.test(values.last_timestamp.trim())) {
    errors.last_timestamp = "Use minutes:seconds, like 32:14 (or 1:05:30).";
  }

  if (values.poster_url.trim()) {
    try {
      const url = new URL(values.poster_url.trim());
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      errors.poster_url = "That doesn’t look like a web link (it should start with https://).";
    }
  }

  // Drop the undefined keys so `Object.keys(errors).length` means "has errors".
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v)) as EntryFormErrors;
}
