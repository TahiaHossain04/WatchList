import type { CreateEntryInput, Entry, EntryFilters, UpdateEntryInput } from "../types/entry.js";

/**
 * Anything that can store entries. There are two implementations:
 *  - supabaseEntryStore: the real PostgreSQL database
 *  - memoryEntryStore:   sample data in memory (demo mode, no setup needed)
 */
export interface EntryStore {
  list(filters: EntryFilters): Promise<Entry[]>;
  get(id: string): Promise<Entry | null>;
  create(input: CreateEntryInput): Promise<Entry>;
  update(id: string, input: UpdateEntryInput): Promise<Entry | null>;
  remove(id: string): Promise<boolean>;
}
