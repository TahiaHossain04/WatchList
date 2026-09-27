import { useState } from "react";
import { ApiError } from "../../services/apiClient";
import { searchTmdb, type TmdbResult } from "../../services/entriesApi";
import type { MediaType } from "../../types/entry";
import { CandyButton } from "../ui/CandyButton";

/**
 * "Find on TMDB": searches for the title typed in the form and lets you pick the
 * right match. Picking one fills in the poster, year and synopsis (see EntryForm).
 */
export function TmdbPicker({
  title,
  mediaType,
  selectedId,
  onPick,
}: {
  title: string;
  mediaType: MediaType;
  selectedId: number | null;
  onPick: (result: TmdbResult) => void;
}) {
  const [results, setResults] = useState<TmdbResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      setResults(await searchTmdb(title.trim(), mediaType));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't search TMDB.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:col-span-2">
      <div className="flex flex-wrap items-center gap-3">
        <CandyButton onClick={search} disabled={loading || !title.trim()}>
          {loading ? "Searching…" : "Find on TMDB"}
        </CandyButton>
        <span className="text-sm text-ink-muted">
          {title.trim() ? "Pick the right match to fill in the poster, year and synopsis." : "Type a title first."}
        </span>
      </div>

      {error && <p className="text-sm font-bold text-gum-light">{error}</p>}
      {results?.length === 0 && <p className="text-sm text-ink-muted">No matches. Try a different spelling.</p>}

      {results && results.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {results.map((r) => {
            const selected = r.tmdb_id === selectedId;
            return (
              <li key={`${r.kind}-${r.tmdb_id}`}>
                <button
                  type="button"
                  onClick={() => onPick(r)}
                  aria-pressed={selected}
                  className={`flex w-full flex-col gap-1 rounded-xl p-1.5 text-left transition-colors hover:bg-panel ${
                    selected ? "bg-panel ring-2 ring-gum" : ""
                  }`}
                >
                  <span className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-panel">
                    {r.poster_url ? (
                      <img src={r.poster_url.replace("/w500/", "/w185/")} alt="" loading="lazy" className="size-full object-cover" />
                    ) : (
                      <span className="grid size-full place-items-center text-xs text-ink-muted">No poster</span>
                    )}
                  </span>
                  <span className="line-clamp-2 text-sm font-bold text-ink">{r.title}</span>
                  <span className="text-xs text-ink-muted">
                    {[r.year, r.kind === "tv" ? "Series" : "Movie", r.original_language.toUpperCase()].filter(Boolean).join(" · ")}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
