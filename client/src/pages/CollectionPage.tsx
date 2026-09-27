import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { FilterBar } from "../components/library/FilterBar";
import { LibraryContent } from "../components/library/LibraryContent";
import { ShelfSkeleton } from "../components/library/ShelfSkeleton";
import { TypeToggle } from "../components/library/TypeToggle";
import { CandyButton, CandyLink } from "../components/ui/CandyButton";
import { StateMessage } from "../components/ui/StateMessage";
import { useAuth } from "../contexts/AuthContext";
import { useEntries } from "../hooks/useEntries";
import { useLibraryFilters } from "../hooks/useLibraryFilters";
import { rememberShelfOrder } from "../hooks/useShelfNeighbours";
import type { WatchStatus } from "../types/entry";
import { COLLECTION_BY_SLUG, STATUS_BY_VALUE, TYPE_GROUPS } from "../utils/labels";
import type { SortKey } from "../utils/sort";

/**
 * One collection's shelf inside a status, e.g. /watched/k-drama.
 * Top: the Dramas | Movies toggle. Then search / sort / shelf-or-posters. Then the books.
 */
export function CollectionPage({ status }: { status: WatchStatus }) {
  const { collection: slug = "" } = useParams();
  const collection = COLLECTION_BY_SLUG[slug];
  const statusInfo = STATUS_BY_VALUE[status];

  if (!collection) {
    return (
      <StateMessage
        title="That channel doesn’t exist."
        message="Maybe the link is a little off."
        action={<CandyLink to={statusInfo.path}>See all channels</CandyLink>}
      />
    );
  }
  return <CollectionShelf status={status} collectionSlug={slug} />;
}

function CollectionShelf({ status, collectionSlug }: { status: WatchStatus; collectionSlug: string }) {
  const collection = COLLECTION_BY_SLUG[collectionSlug]!;
  const statusInfo = STATUS_BY_VALUE[status];
  const { isAdmin } = useAuth();
  const { entries, loading, error, reload } = useEntries(status, collection.value);
  const defaultSort: SortKey = status === "watched" ? "recently_watched" : "recently_added";
  const { filters, setFilter, clearSearch, visible, inTypeCount, groupCounts, favoriteCount } = useLibraryFilters(
    entries,
    defaultSort,
  );

  // Remember this exact order so the entry page's ‹ Previous / Next › follows it.
  const location = useLocation();
  useEffect(() => {
    if (!loading) rememberShelfOrder(visible, location.pathname + location.search);
  }, [visible, loading, location.pathname, location.search]);

  const typeLabel = TYPE_GROUPS.find((g) => g.value === filters.type)!
    .label(collection)
    .toLowerCase();
  const addLink = `/admin/add?status=${status}&collection=${collection.value}`;

  return (
    <>
      <Link
        to={statusInfo.path}
        className="mb-2 inline-flex items-center gap-1.5 rounded-full py-1 pr-3 font-candy text-lg tracking-wide text-ink-muted transition-colors hover:text-ink"
      >
        <span aria-hidden="true">←</span> {statusInfo.label} channels
      </Link>

      <PageHeader
        title={collection.label}
        subtitle={
          loading ? " " : `${statusInfo.label} · ${entries.length} ${entries.length === 1 ? "title" : "titles"}`
        }
        actions={
          isAdmin && (
            <CandyLink to={addLink} variant="pink">
              + Add {collection.label}
            </CandyLink>
          )
        }
      />

      {error ? (
        <StateMessage
          tone="error"
          title="The shelf wobbled."
          message={error}
          action={<CandyButton onClick={reload}>Try again</CandyButton>}
        />
      ) : loading ? (
        <ShelfSkeleton />
      ) : entries.length === 0 ? (
        <StateMessage
          title="Nothing on this channel yet."
          message={statusInfo.emptyMessage}
          action={isAdmin && <CandyLink to={addLink}>Add the first one</CandyLink>}
        />
      ) : (
        <>
          <TypeToggle
            collection={collection}
            value={filters.type}
            counts={groupCounts}
            onChange={(v) => setFilter("type", v)}
          />
          {inTypeCount > 0 && <FilterBar filters={filters} onChange={setFilter} favoriteCount={favoriteCount} />}

          {inTypeCount === 0 ? (
            <StateMessage title={`No ${typeLabel} here yet.`} message="Flip the switch above to see the rest." />
          ) : visible.length === 0 && filters.favorites && !filters.search ? (
            <StateMessage
              title="No favourites here yet."
              message="Hearts are handed out sparingly."
              action={<CandyButton onClick={() => setFilter("favorites", false)}>Show everything</CandyButton>}
            />
          ) : visible.length === 0 ? (
            <StateMessage
              title="No matches."
              message="Nothing on this shelf matches that search."
              action={<CandyButton onClick={clearSearch}>Clear search</CandyButton>}
            />
          ) : (
            <LibraryContent entries={visible} view={filters.view} />
          )}
        </>
      )}
    </>
  );
}
