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

// Future: searchTmdb(query) → apiRequest(`/tmdb/search?q=...`) — the server holds the TMDB key.
