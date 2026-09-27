import type { SupabaseClient } from "@supabase/supabase-js";
import type { Entry } from "../types/entry.js";
import { HttpError } from "../utils/httpError.js";
import type { EntryStore } from "./entryStore.js";

const TABLE = "entries";

/** Supabase returns NUMERIC columns as strings — convert rating back to a number. */
function normalize(row: Record<string, unknown>): Entry {
  return { ...row, rating: row.rating == null ? null : Number(row.rating) } as Entry;
}

function fail(message: string, error: { message: string; code?: string }): never {
  // 23505 = unique violation → two favourites got the same number at the same moment.
  if (error.code === "23505") {
    throw new HttpError(409, "That favourite number is already taken.", {
      favorite_rank: "That number is already used in this collection. Pick another.",
    });
  }
  console.error(`[supabase] ${message}:`, error.message);
  throw new HttpError(500, message);
}

export function createSupabaseEntryStore(db: SupabaseClient): EntryStore {
  return {
    async list(filters) {
      let query = db.from(TABLE).select("*").order("created_at", { ascending: false });
      if (filters.status) query = query.eq("status", filters.status);
      if (filters.collection) query = query.eq("collection", filters.collection);
      if (filters.type) query = query.eq("media_type", filters.type);
      if (filters.search) {
        // Escape LIKE wildcards so user input is matched literally.
        const escaped = filters.search.replace(/[\\%_]/g, (c) => `\\${c}`);
        query = query.ilike("title", `%${escaped}%`);
      }
      const { data, error } = await query;
      if (error) fail("Could not load entries", error);
      return data.map(normalize);
    },

    async get(id) {
      const { data, error } = await db.from(TABLE).select("*").eq("id", id).maybeSingle();
      if (error) fail("Could not load entry", error);
      return data ? normalize(data) : null;
    },

    async create(input) {
      const { data, error } = await db.from(TABLE).insert(input).select("*").single();
      if (error) fail("Could not create entry", error);
      return normalize(data);
    },

    async update(id, input) {
      const { data, error } = await db
        .from(TABLE)
        .update(input)
        .eq("id", id)
        .select("*")
        .maybeSingle();
      if (error) fail("Could not update entry", error);
      return data ? normalize(data) : null;
    },

    async remove(id) {
      const { data, error } = await db.from(TABLE).delete().eq("id", id).select("id");
      if (error) fail("Could not delete entry", error);
      return data.length > 0;
    },
  };
}
