import type { Collection, Entry, EntryInput, EntryPayload, MediaType, WatchStatus } from "../types/entry";
import { apiRequest } from "./apiClient";

/** Every call the UI makes for entries. Components never call fetch directly. */

export interface EntryQuery {
  status?: WatchStatus;
  collection?: Collection;
  type?: MediaType;
  search?: string;
}

export function listEntries(query: EntryQuery = {}): Promise<Entry[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return apiRequest<Entry[]>(`/entries${qs ? `?${qs}` : ""}`);
}

export function getEntry(id: string): Promise<Entry> {
  return apiRequest<Entry>(`/entries/${encodeURIComponent(id)}`);
}

export function createEntry(input: EntryPayload): Promise<Entry> {
  return apiRequest<Entry>("/entries", { method: "POST", body: JSON.stringify(input) });
}

export function updateEntry(id: string, input: Partial<EntryInput>): Promise<Entry> {
  return apiRequest<Entry>(`/entries/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteEntry(id: string): Promise<void> {
  return apiRequest<void>(`/entries/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function fetchAdminStatus(): Promise<{ isAdmin: boolean; email: string | null }> {
  return apiRequest("/auth/me");
}

/** A title found on TMDB. The server holds the TMDB key; this search is admin-only. */
export interface TmdbResult {
  tmdb_id: number;
  kind: "movie" | "tv";
  title: string;
  original_title: string;
  year: number | null;
  poster_url: string | null;
  synopsis: string | null;
  original_language: string;
}

export function searchTmdb(query: string, type?: MediaType): Promise<TmdbResult[]> {
  const params = new URLSearchParams({ q: query });
  if (type) params.set("type", type);
  return apiRequest<TmdbResult[]>(`/tmdb/search?${params}`);
}

