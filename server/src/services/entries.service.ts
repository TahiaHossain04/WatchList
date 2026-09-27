import type { CreateEntryInput, Entry, UpdateEntryInput } from "../types/entry.js";
import { typeGroup } from "../types/entry.js";
import { HttpError } from "../utils/httpError.js";
import type { EntryStore } from "./entryStore.js";
import { createMemoryEntryStore } from "./memoryEntryStore.js";
import { createSupabaseEntryStore } from "./supabaseEntryStore.js";
import { supabaseAdmin } from "./supabase.js";

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
  return entryStore.create({ ...input, favorite_rank });
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
