import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Entry } from "../types/entry";
import { TYPE_GROUPS, type TypeGroup } from "../utils/labels";
import { SORT_OPTIONS, sortEntries, type SortKey } from "../utils/sort";

/**
 * Filter + sort + view state for one collection's page, stored in the URL
 * (?type=movies&fav=1&q=spirit&sort=title_asc&view=grid).
 * fav=1 → "♥ Favourites" mode: only hearted titles, in Tahia's order (#1, #2, …).
 * Keeping it in the URL means the back button and shared links remember your filters.
 */

export type LibraryView = "shelf" | "grid";

export interface LibraryFilters {
  type: TypeGroup; // the Dramas / Movies / Docs & more toggle
  favorites: boolean; // only show hearted titles, ranked
  search: string;
  sort: SortKey;
  view: LibraryView;
}

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

const inGroup = (entry: Entry, group: TypeGroup) =>
  TYPE_GROUPS.find((g) => g.value === group)!.types.includes(entry.media_type);

export function useLibraryFilters(entries: Entry[], defaultSort: SortKey) {
  const [params, setParams] = useSearchParams();

  // How many entries fall in each toggle option (shown on the toggle).
  const groupCounts = useMemo(() => {
    const counts = { series: 0, movies: 0, more: 0 } as Record<TypeGroup, number>;
    for (const group of TYPE_GROUPS) counts[group.value] = entries.filter((e) => inGroup(e, group.value)).length;
    return counts;
  }, [entries]);

  // With no ?type= in the URL, open on the first option that has something in it.
  const defaultType = TYPE_GROUPS.find((g) => groupCounts[g.value] > 0)?.value ?? "series";

  const filters: LibraryFilters = {
    type: pick(params.get("type"), TYPE_GROUPS.map((g) => g.value), defaultType),
    favorites: params.get("fav") === "1",
    search: params.get("q") ?? "",
    sort: pick(params.get("sort"), SORT_OPTIONS.map((o) => o.value), defaultSort),
    view: pick(params.get("view"), ["shelf", "grid"] as const, "shelf"),
  };

  const setFilter = <K extends keyof LibraryFilters>(key: K, value: LibraryFilters[K]) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const param = key === "search" ? "q" : key === "favorites" ? "fav" : key;
        const isDefault =
          value === "" ||
          value === false ||
          (key === "type" && value === defaultType) ||
          (key === "sort" && value === defaultSort) ||
          (key === "view" && value === "shelf");
        if (isDefault) next.delete(param);
        else next.set(param, value === true ? "1" : String(value));
        return next;
      },
      { replace: true },
    );
  };

  const clearSearch = () => setFilter("search", "");

  const inType = useMemo(() => entries.filter((e) => inGroup(e, filters.type)), [entries, filters.type]);

  const favoriteCount = useMemo(() => inType.filter((e) => e.reaction === "favorite").length, [inType]);

  const visible = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const matching = query ? inType.filter((e) => e.title.toLowerCase().includes(query)) : inType;
    if (!filters.favorites) return sortEntries(matching, filters.sort);
    // Favourites mode: numbered ones first (#1, #2…), then un-numbered favourites A–Z.
    return matching
      .filter((e) => e.reaction === "favorite")
      .sort(
        (a, b) =>
          (a.favorite_rank ?? Infinity) - (b.favorite_rank ?? Infinity) ||
          a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
      );
  }, [inType, filters.search, filters.sort, filters.favorites]);

  return { filters, setFilter, clearSearch, visible, inTypeCount: inType.length, groupCounts, favoriteCount };
}
