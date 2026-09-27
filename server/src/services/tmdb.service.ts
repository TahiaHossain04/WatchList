import { config } from "../config.js";
import type { Collection, Entry, MediaType } from "../types/entry.js";
import { HttpError } from "../utils/httpError.js";

/**
 * TMDB (themoviedb.org) lookups: posters, release year, synopsis.
 * The key stays on the server. TMDB_API_KEY accepts either the v3 "API Key"
 * or the longer v4 "API Read Access Token" (starts with "eyJ").
 */

const API = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export type TmdbKind = "movie" | "tv";

export interface TmdbResult {
  tmdb_id: number;
  kind: TmdbKind;
  title: string;
  original_title: string;
  year: number | null;
  poster_url: string | null;
  synopsis: string | null;
  original_language: string;
  popularity: number;
}

/** Fields TMDB can fill in on an entry. */
export type TmdbFields = Pick<Entry, "tmdb_id" | "poster_url" | "release_year" | "synopsis">;

export const tmdbEnabled = () => Boolean(config.tmdbApiKey);

async function tmdbGet(path: string, params: Record<string, string>): Promise<unknown> {
  const key = config.tmdbApiKey;
  if (!key) throw new HttpError(503, "TMDB is not set up. Add TMDB_API_KEY to the server environment.");

  const url = new URL(API + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const headers: Record<string, string> = { accept: "application/json" };
  if (key.startsWith("eyJ")) headers.authorization = `Bearer ${key}`;
  else url.searchParams.set("api_key", key);

  const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new HttpError(502, `TMDB request failed (${res.status}).`);
  return res.json();
}

interface RawResult {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  overview?: string;
  original_language?: string;
  popularity?: number;
}

function normalise(raw: RawResult, kind: TmdbKind): TmdbResult {
  const date = kind === "movie" ? raw.release_date : raw.first_air_date;
  return {
    tmdb_id: raw.id,
    kind,
    title: (kind === "movie" ? raw.title : raw.name) ?? "",
    original_title: (kind === "movie" ? raw.original_title : raw.original_name) ?? "",
    year: date ? Number(date.slice(0, 4)) || null : null,
    poster_url: raw.poster_path ? IMAGE_BASE + raw.poster_path : null,
    synopsis: raw.overview?.trim() || null,
    original_language: raw.original_language ?? "",
    popularity: raw.popularity ?? 0,
  };
}

/** Which TMDB kinds to search for each of our media types. */
function kindsFor(mediaType?: MediaType): TmdbKind[] {
  if (mediaType === "movie") return ["movie"];
  if (mediaType === "show") return ["tv"];
  return ["tv", "movie"]; // documentaries and "other" can be either
}

export async function searchTmdb(query: string, mediaType?: MediaType): Promise<TmdbResult[]> {
  const lists = await Promise.all(
    kindsFor(mediaType).map(async (kind) => {
      const body = (await tmdbGet(`/search/${kind}`, { query, include_adult: "false" })) as { results?: RawResult[] };
      return (body.results ?? []).map((r) => normalise(r, kind));
    }),
  );
  return lists.flat().sort((a, b) => b.popularity - a.popularity);
}

/** TMDB original_language codes that fit each collection. */
const COLLECTION_LANGUAGES: Record<Collection, string[] | null> = {
  korean: ["ko"],
  chinese: ["zh", "cn"],
  anime: ["ja"],
  thai: ["th"],
  english: ["en"],
  hindi: ["hi", "ta", "te", "ml", "bn", "pa", "mr"],
  other: null,
};

const simplify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");

export interface TmdbMatch {
  result: TmdbResult;
  /** true when the title matches exactly and nothing contradicts it. */
  confident: boolean;
}

/** Picks the most likely TMDB title for an entry, or null if nothing plausible. */
export async function findBestMatch(
  entry: Pick<Entry, "title" | "media_type" | "collection" | "release_year">,
): Promise<TmdbMatch | null> {
  // "Dr. Romantic 3" / "D.P. 2" / "Season 2": TMDB lists later seasons under the show's main title.
  const baseTitle = entry.title.replace(/(?:\s*[:-]\s*|\s+)(?:(?:season|class|part)\s*)?\d{1,2}$/i, "").trim();
  const seasonal = entry.media_type !== "movie" && baseTitle !== entry.title && baseTitle.length > 0;
  const title = seasonal ? baseTitle : entry.title;

  const results = await searchTmdb(title, entry.media_type);
  if (!results.length) return null;

  const wanted = simplify(title);
  const languages = COLLECTION_LANGUAGES[entry.collection];

  const scored = results.slice(0, 20).map((result, index) => {
    const exact = simplify(result.title) === wanted || simplify(result.original_title) === wanted;
    const languageOk = !languages || languages.includes(result.original_language);
    const yearOk = entry.release_year == null || (result.year != null && Math.abs(result.year - entry.release_year) <= 1);
    let score = 0;
    if (exact) score += 4;
    if (languageOk) score += 3;
    if (entry.release_year != null && yearOk) score += 4;
    if (result.poster_url) score += 1;
    score -= index * 0.1; // results are sorted by popularity; earlier is better
    return { result, score, confident: exact && languageOk && yearOk };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  return { result: best.result, confident: best.confident };
}

/** Turns a match into entry fields, only filling what the entry doesn't already have. */
export function fieldsFromMatch(result: TmdbResult, entry: Partial<TmdbFields>): Partial<TmdbFields> {
  const fields: Partial<TmdbFields> = { tmdb_id: result.tmdb_id };
  if (!entry.poster_url && result.poster_url) fields.poster_url = result.poster_url;
  if (entry.release_year == null && result.year) fields.release_year = result.year;
  if (!entry.synopsis && result.synopsis) fields.synopsis = result.synopsis.slice(0, 5000);
  return fields;
}
