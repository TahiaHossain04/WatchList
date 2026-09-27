import { entryStore } from "../services/entries.service.js";
import { fieldsFromMatch, findBestMatch, tmdbEnabled } from "../services/tmdb.service.js";
import type { Entry } from "../types/entry.js";

/**
 * Fills in poster, release year and synopsis from TMDB for every entry without a poster.
 *
 *   npm run posters -- --dry-run   show what would change, save nothing
 *   npm run posters                save the confident matches
 *   npm run posters -- --all       also save the unsure ones (check them on the site after!)
 *
 * Fields you already filled in are never overwritten.
 * Unsure matches are listed so you can fix them with "Find on TMDB" on the Edit page.
 */

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const includeUnsure = args.includes("--all");

async function main() {
  if (!tmdbEnabled()) {
    console.error("TMDB_API_KEY is missing from server/.env.");
    process.exit(1);
  }

  const todo = (await entryStore.list({})).filter((e) => !e.poster_url);
  console.log(`${todo.length} entr${todo.length === 1 ? "y has" : "ies have"} no poster. Looking them up…\n`);

  const unsure: string[] = [];
  const missing: string[] = [];
  let saved = 0;

  // A few lookups at a time keeps well under TMDB's rate limit.
  for (let i = 0; i < todo.length; i += 4) {
    await Promise.all(todo.slice(i, i + 4).map(async (entry: Entry) => {
      const label = `${entry.title} (${entry.media_type}, ${entry.collection})`;
      try {
        const match = await findBestMatch(entry);
        if (!match) return void missing.push(label);

        const r = match.result;
        const found = `${r.title}${r.year ? ` (${r.year})` : ""} [${r.kind} ${r.tmdb_id}, ${r.original_language}]`;
        if (!match.confident) unsure.push(`${label}  →  ${found}`);
        if (!match.confident && !includeUnsure) return;

        if (!dryRun) await entryStore.update(entry.id, fieldsFromMatch(r, entry));
        saved++;
      } catch (err) {
        missing.push(`${label}: ${err instanceof Error ? err.message : err}`);
      }
    }));
  }

  if (unsure.length) {
    console.log(`Unsure (${unsure.length})${includeUnsure ? ", saved anyway" : ", not saved"}:`);
    unsure.forEach((line) => console.log(`  ? ${line}`));
    console.log();
  }
  if (missing.length) {
    console.log(`Not found on TMDB (${missing.length}):`);
    missing.forEach((line) => console.log(`  ✗ ${line}`));
    console.log();
  }
  console.log(dryRun ? `Dry run: ${saved} would be saved.` : `✓ Saved ${saved} poster(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
