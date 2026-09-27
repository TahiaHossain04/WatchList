import { useMemo } from "react";
import { TvSet } from "../components/channels/TvSet";
import { PageHeader } from "../components/layout/PageHeader";
import { CandyButton, CandyLink } from "../components/ui/CandyButton";
import { StateMessage } from "../components/ui/StateMessage";
import { useAuth } from "../contexts/AuthContext";
import { useEntries } from "../hooks/useEntries";
import type { Collection, WatchStatus } from "../types/entry";
import { collectionPath, COLLECTIONS, STATUS_BY_VALUE } from "../utils/labels";

/**
 * The page behind each home button (Watched, Currently Watching, …):
 * one TV "channel" per collection. Clicking a TV opens that collection's shelf.
 * Channels are listed in COLLECTIONS order (utils/labels.ts).
 * "Other" only shows up once it has something in it.
 */
export function ChannelsPage({ status }: { status: WatchStatus }) {
  const info = STATUS_BY_VALUE[status];
  const { isAdmin } = useAuth();
  const { entries, loading, error, reload } = useEntries(status);

  const counts = useMemo(() => {
    const result = {} as Record<Collection, number>;
    for (const c of COLLECTIONS) result[c.value] = 0;
    for (const e of entries) result[e.collection] += 1;
    return result;
  }, [entries]);

  const channels = COLLECTIONS.filter((c) => c.value !== "other" || loading || counts.other > 0);

  return (
    <>
      <PageHeader
        title={info.label}
        subtitle={loading ? " " : `${entries.length} ${entries.length === 1 ? "title" : "titles"} · pick a channel`}
        actions={
          isAdmin && (
            <CandyLink to={`/admin/add?status=${status}`} variant="pink">
              + Add to {info.shortLabel}
            </CandyLink>
          )
        }
      />

      {error ? (
        <StateMessage
          tone="error"
          title="Bad reception."
          message={error}
          action={<CandyButton onClick={reload}>Try again</CandyButton>}
        />
      ) : (
        <nav
          aria-label={`${info.label} collections`}
          className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-6 gap-y-8 sm:gap-x-10 sm:gap-y-10"
        >
          {channels.map((collection, i) => (
            <TvSet
              key={collection.value}
              collection={collection}
              channel={COLLECTIONS.indexOf(collection) + 1}
              count={loading ? undefined : counts[collection.value]}
              to={collectionPath(status, collection.value)}
              index={i}
            />
          ))}
        </nav>
      )}
    </>
  );
}
