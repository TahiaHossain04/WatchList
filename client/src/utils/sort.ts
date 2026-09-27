import type { Entry } from "../types/entry";

export type SortKey =
  | "recently_watched"
  | "oldest_watched"
  | "highest_rated"
  | "lowest_rated"
  | "title_asc"
  | "title_desc"
  | "recently_added";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recently_added", label: "Recently added" },
  { value: "recently_watched", label: "Recently watched" },
  { value: "oldest_watched", label: "Oldest watched" },
  { value: "highest_rated", label: "Highest rated" },
  { value: "lowest_rated", label: "Lowest rated" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "title_desc", label: "Title Z–A" },
];

/** The "watched on" date for sorting — falls back to last-watched for other statuses. */
const watchedDate = (e: Entry) => e.date_watched ?? e.last_watched_at;

/** Compare two possibly-missing values; missing ones always go to the end. */
function compareNullable<T>(a: T | null, b: T | null, cmp: (x: T, y: T) => number) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return cmp(a, b);
}

const byText = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base" });

export function sortEntries(entries: Entry[], key: SortKey): Entry[] {
  const sorted = [...entries];
  const byTitle = (a: Entry, b: Entry) => byText(a.title, b.title);

  sorted.sort((a, b) => {
    switch (key) {
      case "recently_watched":
        return compareNullable(watchedDate(a), watchedDate(b), (x, y) => byText(y, x)) || byTitle(a, b);
      case "oldest_watched":
        return compareNullable(watchedDate(a), watchedDate(b), byText) || byTitle(a, b);
      case "highest_rated":
        return compareNullable(a.rating, b.rating, (x, y) => y - x) || byTitle(a, b);
      case "lowest_rated":
        return compareNullable(a.rating, b.rating, (x, y) => x - y) || byTitle(a, b);
      case "title_asc":
        return byTitle(a, b);
      case "title_desc":
        return byTitle(b, a);
      case "recently_added":
      default:
        return b.created_at.localeCompare(a.created_at);
    }
  });
  return sorted;
}
