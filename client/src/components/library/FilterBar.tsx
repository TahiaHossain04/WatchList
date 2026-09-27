import { useEffect, useId, useRef, useState } from "react";
import type { LibraryFilters } from "../../hooks/useLibraryFilters";
import { SORT_OPTIONS, type SortKey } from "../../utils/sort";
import { ChipGroup } from "../ui/ChipGroup";

/**
 * Search box, sort menu and shelf/poster toggle for a collection page.
 * (Dramas vs Movies lives in TypeToggle; collections are their own pages now.)
 * It only shows controls — the actual filtering happens in useLibraryFilters.
 */
interface FilterBarProps {
  filters: LibraryFilters;
  onChange: <K extends keyof LibraryFilters>(key: K, value: LibraryFilters[K]) => void;
  favoriteCount: number;
}

export function FilterBar({ filters, onChange, favoriteCount }: FilterBarProps) {
  const searchId = useId();
  const sortId = useId();

  // The search box keeps its own text so fast typing never drops letters
  // (the URL updates a moment later). It re-syncs when the URL changes from
  // elsewhere — e.g. "Clear filters" — as long as you're not typing in it.
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(filters.search);
  useEffect(() => {
    if (document.activeElement !== searchRef.current) setQuery(filters.search);
  }, [filters.search]);

  return (
    <div className="candy-panel mb-10 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search by title
          </label>
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            id={searchId}
            type="search"
            ref={searchRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onChange("search", e.target.value);
            }}
            placeholder="Search titles…"
            className="field-input rounded-full pl-11"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* ♥ Favourites: only hearted titles, in Tahia's order */}
          <button
            type="button"
            aria-pressed={filters.favorites}
            onClick={() => onChange("favorites", !filters.favorites)}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 font-candy text-lg tracking-wide transition-colors ${
              filters.favorites
                ? "bg-gum text-ink-dark shadow-[inset_0_-3px_0_var(--color-pink-deep)]"
                : "text-ink-muted ring-2 ring-line hover:text-ink"
            }`}
          >
            <span aria-hidden="true">♥</span> Favourites
            <span className="rounded-full bg-page/60 px-1.5 font-body text-xs font-extrabold">{favoriteCount}</span>
          </button>

          {/* Sort (hidden in Favourites mode — that list is always in Tahia's order) */}
          <label htmlFor={sortId} className="sr-only">
            Sort by
          </label>
          <div className={`relative min-w-[11.5rem] flex-1 sm:flex-none ${filters.favorites ? "hidden" : ""}`}>
            <select
              id={sortId}
              value={filters.sort}
              onChange={(e) => onChange("sort", e.target.value as SortKey)}
              className="field-input cursor-pointer appearance-none rounded-full pr-10"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.6}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          <ChipGroup
            label="View"
            value={filters.view}
            onChange={(v) => onChange("view", v)}
            size="md"
            options={[
              { value: "shelf", label: "Shelf" },
              { value: "grid", label: "Posters" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
