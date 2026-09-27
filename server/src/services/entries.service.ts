import type { CreateEntryInput, Entry, UpdateEntryInput } from "../types/entry.js";
import { typeGroup } from "../types/entry.js";
import { HttpError } from "../utils/httpError.js";
import type { EntryStore } from "./entryStore.js";
import { createMemoryEntryStore } from "./memoryEntryStore.js";
import { createSupabaseEntryStore } from "./supabaseEntryStore.js";
import { supabaseAdmin } from "./supabase.js";
import { fieldsFromMatch, findBestMatch, tmdbEnabled } from "./tmdb.service.js";

/** The one store the app uses: Supabase when configured, otherwise the demo store. */
export const entryStore: EntryStore = supabaseAdmin
  ? createSupabaseEntryStore(supabaseAdmin)
  : createMemoryEntryStore();

type RankFields = Pick<Entry, "collection" | "media_type" | "reaction" | "favorite_rank">;

/**
 * Favourite-number rules:
 *  - only hearted titles keep a number (removing the heart clears it)
 *  - within one collection + kind (dramas / movies / docs), each number is used once
 */
async function applyRankRules(entry: RankFields, selfId?: string): Promise<number | null> {
  if (entry.reaction !== "favorite" || entry.favorite_rank == null) return null;

  const sameCollection = await entryStore.list({ collection: entry.collection });
  const clash = sameCollection.find(
    (other) =>
      other.id !== selfId &&
      other.favorite_rank === entry.favorite_rank &&
      typeGroup(other.media_type) === typeGroup(entry.media_type),
  );
  if (clash) {
    throw new HttpError(409, "That favourite number is already taken.", {
      favorite_rank: `#${entry.favorite_rank} is already “${clash.title}”. Pick another number.`,
    });
  }
  return entry.favorite_rank;
}

export async function createEntry(input: CreateEntryInput): Promise<Entry> {
  const favorite_rank = await applyRankRules({
    collection: input.collection,
    media_type: input.media_type,
    reaction: input.reaction ?? null,
    favorite_rank: input.favorite_rank ?? null,
  });
  const tmdbFields = await autoFillFromTmdb(input);
  return entryStore.create({ ...input, ...tmdbFields, favorite_rank });
}

/**
 * New entries without a poster get one from TMDB automatically.
 * Only confident matches are used, and a TMDB outage never blocks saving.
 */
async function autoFillFromTmdb(input: CreateEntryInput) {
  if (!tmdbEnabled() || input.poster_url || input.tmdb_id != null) return {};
  try {
    const match = await findBestMatch({ ...input, release_year: input.release_year ?? null });
    return match?.confident ? fieldsFromMatch(match.result, input) : {};
  } catch (err) {
    console.error(`[tmdb] Lookup failed for "${input.title}":`, err instanceof Error ? err.message : err);
    return {};
  }
}

export async function updateEntry(id: string, input: UpdateEntryInput): Promise<Entry | null> {
  const existing = await entryStore.get(id);
  if (!existing) return null;
  const merged = { ...existing, ...input };
  const favorite_rank = await applyRankRules(merged, id);
  // Only send favorite_rank when it changes, so plain edits don't touch it.
  const changes = favorite_rank === existing.favorite_rank ? input : { ...input, favorite_rank };
  return entryStore.update(id, changes);
}
