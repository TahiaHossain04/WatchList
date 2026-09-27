import { readFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { config } from "../config.js";
import { createEntry, entryStore } from "../services/entries.service.js";
import { createEntrySchema, type CreateEntryInput } from "../types/entry.js";

/**
 * Bulk-add entries from a CSV or JSON file.
 *
 *   npm run import -- imports/my-list.csv            (from the repo root)
 *   npm run import -- imports/my-list.csv --dry-run  (check only, save nothing)
 *
 * CSV: first row = column names (same as the database: title, status, media_type, collection, …).
 *      Separate multiple actors with ";". Leave a cell empty to skip it.
 * JSON: an array of objects with the same field names.
 *
 * Every row is checked first; nothing is saved if any row is invalid.
 * Titles already in the library (same title + status + collection + type) are skipped.
 */

const NUMBER_FIELDS = new Set([
  "rating", "release_year", "total_episodes", "last_season", "last_episode",
  "favorite_rank", "tmdb_id", "jikan_id",
]);

/** Minimal CSV parser: handles quoted cells, commas and newlines inside quotes, and "" escapes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function csvToObjects(text: string): Record<string, unknown>[] {
  const [header, ...rows] = parseCsv(text.replace(/^﻿/, ""));
  const keys = header.map((h) => h.trim());
  return rows.map((cells) => {
    const obj: Record<string, unknown> = {};
    keys.forEach((key, i) => {
      const value = cells[i]?.trim() ?? "";
      if (!key || value === "") return;
      if (key === "actors") obj[key] = value.split(";").map((a) => a.trim()).filter(Boolean);
      else if (NUMBER_FIELDS.has(key)) obj[key] = Number(value);
      else obj[key] = value;
    });
    return obj;
  });
}

const key = (e: Pick<CreateEntryInput, "title" | "status" | "collection" | "media_type">) =>
  [e.title.trim().toLowerCase(), e.status, e.collection, e.media_type].join("|");

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  const dryRun = args.includes("--dry-run");
  if (!file) {
    console.error("Usage: npm run import -- <file.csv|file.json> [--dry-run]");
    process.exit(1);
  }

  // npm runs this inside server/, so resolve the path from where the command was typed.
  const text = readFileSync(resolve(process.env.INIT_CWD ?? process.cwd(), file), "utf8");
  const raw = extname(file).toLowerCase() === ".json" ? (JSON.parse(text) as unknown[]) : csvToObjects(text);

  const valid: CreateEntryInput[] = [];
  const problems: string[] = [];
  raw.forEach((item, i) => {
    const result = createEntrySchema.safeParse(item);
    if (result.success) valid.push(result.data);
    else {
      const title = (item as { title?: string })?.title ?? "(no title)";
      const msg = result.error.issues.map((iss) => `${iss.path.join(".") || "row"}: ${iss.message}`).join("; ");
      problems.push(`  Row ${i + 1} "${title}": ${msg}`);
    }
  });

  if (problems.length) {
    console.error(`✗ ${problems.length} row(s) have problems. Nothing was saved:\n${problems.join("\n")}`);
    process.exit(1);
  }

  const existing = new Set((await entryStore.list({})).map(key));
  // Skip titles already in the library, and repeats within the file itself.
  const fresh = valid.filter((e) => !existing.has(key(e)) && (existing.add(key(e)), true));
  const skipped = valid.length - fresh.length;

  console.log(`${config.demoMode ? "[DEMO MODE] " : ""}${valid.length} valid row(s): ${fresh.length} new, ${skipped} already in the library.`);
  if (dryRun) {
    console.log("Dry run: nothing saved.");
    return;
  }

  let added = 0;
  for (const entry of fresh) {
    try {
      await createEntry(entry);
      added++;
    } catch (err) {
      console.error(`  ✗ "${entry.title}": ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`✓ Added ${added} entr${added === 1 ? "y" : "ies"}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
