import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { CreateEntryInput, Entry } from "../types/entry.js";
import type { EntryStore } from "./entryStore.js";

/**
 * Store used in DEMO MODE (no Supabase configured).
 * Entries are kept in memory and saved to server/data/demo-db.json after every change,
 * so they survive restarts. Delete that file to go back to the sample data below.
 */

const DATA_FILE = fileURLToPath(new URL("../../data/demo-db.json", import.meta.url));

function loadSaved(): Entry[] | null {
  try {
    return existsSync(DATA_FILE) ? (JSON.parse(readFileSync(DATA_FILE, "utf8")) as Entry[]) : null;
  } catch (err) {
    console.error(`[demo] Could not read ${DATA_FILE} — starting from sample data.`, err);
    return null;
  }
}

function save(entries: Map<string, Entry>) {
  try {
    mkdirSync(dirname(DATA_FILE), { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify([...entries.values()], null, 2));
  } catch (err) {
    console.error("[demo] Could not save demo data:", err);
  }
}

const EMPTY: Omit<Entry, "id" | "title" | "status" | "media_type" | "collection" | "created_at" | "updated_at"> = {
  director: null,
  actors: null,
  date_watched: null,
  rating: null,
  comment: null,
  poster_url: null,
  synopsis: null,
  release_year: null,
  total_episodes: null,
  last_watched_at: null,
  last_season: null,
  last_episode: null,
  last_timestamp: null,
  reaction: null,
  favorite_rank: null,
  tmdb_id: null,
  jikan_id: null,
  wikipedia_title: null,
};

function build(input: CreateEntryInput, daysAgo: number): Entry {
  const stamp = new Date(Date.now() - daysAgo * 86_400_000).toISOString();
  return { ...EMPTY, ...input, id: randomUUID(), created_at: stamp, updated_at: stamp } as Entry;
}

const SEED: [CreateEntryInput, number][] = [
  [{ title: "Lovely Runner", status: "watched", media_type: "show", collection: "korean", rating: 9.5, date_watched: "2024-06-02", release_year: 2024, total_episodes: 16, actors: ["Byeon Woo-seok", "Kim Hye-yoon"], comment: "Sunjae I will protect you forever." }, 1],
  [{ title: "Twenty Five Twenty One", status: "watched", media_type: "show", collection: "korean", rating: 9, date_watched: "2023-03-14", release_year: 2022, actors: ["Kim Tae-ri", "Nam Joo-hyuk"], comment: "That ending. We don't talk about that ending." }, 40],
  [{ title: "Crash Landing on You", status: "watched", media_type: "show", collection: "korean", rating: 8.5, date_watched: "2021-01-20", release_year: 2019 }, 90],
  [{ title: "Reply 1988", status: "watched", media_type: "show", collection: "korean", rating: 10, date_watched: "2022-08-11", release_year: 2015 }, 60],
  [{ title: "Spirited Away", status: "watched", media_type: "movie", collection: "anime", rating: 10, director: "Hayao Miyazaki", date_watched: "2020-11-02", release_year: 2001, synopsis: "A girl wanders into a world of spirits and must work in a bathhouse to free her parents." }, 120],
  [{ title: "Frieren: Beyond Journey's End", status: "watched", media_type: "show", collection: "anime", rating: 9.5, date_watched: "2024-03-30", release_year: 2023 }, 20],
  [{ title: "Your Name", status: "watched", media_type: "movie", collection: "anime", rating: 9, director: "Makoto Shinkai", release_year: 2016 }, 150],
  [{ title: "Hidden Love", status: "watched", media_type: "show", collection: "chinese", rating: 8, date_watched: "2023-09-05", release_year: 2023 }, 70],
  [{ title: "The Untamed", status: "watched", media_type: "show", collection: "chinese", rating: 8.5, release_year: 2019 }, 200],
  [{ title: "3 Idiots", status: "watched", media_type: "movie", collection: "hindi", rating: 9, director: "Rajkumar Hirani", release_year: 2009 }, 300],
  [{ title: "Breaking Bad", status: "watched", media_type: "show", collection: "english", rating: 9.5, release_year: 2008 }, 400],
  [{ title: "Our Planet", status: "watched", media_type: "documentary", collection: "english", rating: 8, release_year: 2019 }, 250],
  [{ title: "Jujutsu Kaisen", status: "watching", media_type: "show", collection: "anime", last_season: 2, last_episode: 7, last_timestamp: "12:40", total_episodes: 23 }, 3],
  [{ title: "When Life Gives You Tangerines", status: "watching", media_type: "show", collection: "korean", last_season: 1, last_episode: 9, total_episodes: 16, last_watched_at: "2026-09-18" }, 5],
  [{ title: "Love Between Fairy and Devil", status: "abandoned", media_type: "show", collection: "chinese", last_watched_at: "2025-08-21", last_season: 1, last_episode: 9, last_timestamp: "24:17", comment: "Pretty, but I got distracted." }, 30],
  [{ title: "Squid Game", status: "want_to_watch", media_type: "show", collection: "korean" }, 2],
  [{ title: "Perfect Days", status: "want_to_watch", media_type: "movie", collection: "other" }, 4],
  [{ title: "Pachinko", status: "want_to_watch", media_type: "show", collection: "korean" }, 8],
];

export function createMemoryEntryStore(): EntryStore {
  const entries = new Map<string, Entry>();
  const saved = loadSaved();
  if (saved) {
    // Fill in fields added since the file was saved (e.g. reaction) with null.
    for (const entry of saved) entries.set(entry.id, { ...EMPTY, ...entry });
  } else {
    for (const [input, daysAgo] of SEED) {
      const entry = build(input, daysAgo);
      entries.set(entry.id, entry);
    }
  }

  return {
    async list(filters) {
      const search = filters.search?.toLowerCase();
      return [...entries.values()]
        .filter((e) => !filters.status || e.status === filters.status)
        .filter((e) => !filters.collection || e.collection === filters.collection)
        .filter((e) => !filters.type || e.media_type === filters.type)
        .filter((e) => !search || e.title.toLowerCase().includes(search))
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },

    async get(id) {
      return entries.get(id) ?? null;
    },

    async create(input) {
      const entry = build(input, 0);
      entries.set(entry.id, entry);
      save(entries);
      return entry;
    },

    async update(id, input) {
      const existing = entries.get(id);
      if (!existing) return null;
      const updated: Entry = { ...existing, ...input, updated_at: new Date().toISOString() } as Entry;
      entries.set(id, updated);
      save(entries);
      return updated;
    },

    async remove(id) {
      const deleted = entries.delete(id);
      if (deleted) save(entries);
      return deleted;
    },
  };
}
