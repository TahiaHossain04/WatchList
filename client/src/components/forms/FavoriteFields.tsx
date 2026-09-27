import { useEffect, useState } from "react";
import { listEntries } from "../../services/entriesApi";
import type { Collection, MediaType, Reaction } from "../../types/entry";
import { COLLECTION_INFO, TYPE_GROUPS, typeGroupOf } from "../../utils/labels";
import { ChipGroup } from "../ui/ChipGroup";
import { Field } from "./Field";

/**
 * "Your mark": no mark / ♥ favourite / ✕ not for me.
 * Picking the heart reveals the favourite-number box. Numbers are unique within
 * this collection + kind (e.g. K-Drama dramas), so it shows which ones are taken.
 */
interface FavoriteFieldsProps {
  entryId?: string;
  collection: Collection;
  mediaType: MediaType;
  reaction: Reaction | "";
  rank: string;
  rankError?: string;
  onReactionChange: (value: Reaction | "") => void;
  onRankChange: (value: string) => void;
}

export function FavoriteFields({
  entryId,
  collection,
  mediaType,
  reaction,
  rank,
  rankError,
  onReactionChange,
  onRankChange,
}: FavoriteFieldsProps) {
  const [taken, setTaken] = useState<{ rank: number; title: string }[]>([]);

  // Load which numbers are already used in this collection + kind.
  useEffect(() => {
    if (reaction !== "favorite") return;
    let cancelled = false;
    listEntries({ collection })
      .then((entries) => {
        if (cancelled) return;
        const group = typeGroupOf(mediaType);
        setTaken(
          entries
            .filter((e) => e.id !== entryId && e.favorite_rank != null && typeGroupOf(e.media_type) === group)
            .map((e) => ({ rank: e.favorite_rank!, title: e.title }))
            .sort((a, b) => a.rank - b.rank),
        );
      })
      .catch(() => !cancelled && setTaken([]));
    return () => {
      cancelled = true;
    };
  }, [reaction, collection, mediaType, entryId]);

  const takenSet = new Set(taken.map((t) => t.rank));
  let nextFree = 1;
  while (takenSet.has(nextFree)) nextFree++;
  const clash = taken.find((t) => String(t.rank) === rank.trim());
  const listName = `${COLLECTION_INFO[collection].label} ${TYPE_GROUPS.find((g) => g.value === typeGroupOf(mediaType))!
    .label(COLLECTION_INFO[collection])
    .toLowerCase()}`;

  return (
    <>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <span className="font-bold text-ink" aria-hidden="true">
          Your mark
        </span>
        <ChipGroup
          label="Your mark"
          size="md"
          value={reaction}
          onChange={onReactionChange}
          options={[
            { value: "", label: "No mark" },
            { value: "favorite", label: "♥ Favourite" },
            { value: "dislike", label: "✕ Not for me" },
          ]}
        />
        <p className="text-sm text-ink-muted">
          Favourites glow on the shelf; “not for me” ones are greyed out.
        </p>
      </div>

      {reaction === "favorite" && (
        <Field
          label={`Favourite number (${listName})`}
          hint={
            taken.length
              ? `Taken: ${taken.map((t) => `#${t.rank}`).join(", ")} · next free: #${nextFree}`
              : "Optional — #1 is your very favourite."
          }
          error={rankError ?? (clash ? `#${clash.rank} is already “${clash.title}”. Pick another number.` : undefined)}
          className="sm:col-span-2"
        >
          {(p) => (
            <div className="flex flex-wrap items-center gap-3">
              <input
                {...p}
                value={rank}
                onChange={(e) => onRankChange(e.target.value)}
                type="number"
                min={1}
                inputMode="numeric"
                placeholder="#"
                className="field-input max-w-32"
              />
              {rank.trim() !== String(nextFree) && (
                <button
                  type="button"
                  onClick={() => onRankChange(String(nextFree))}
                  className="rounded-full px-4 py-2 font-candy text-lg tracking-wide text-gum-light ring-2 ring-line hover:bg-panel-raised"
                >
                  Use #{nextFree}
                </button>
              )}
            </div>
          )}
        </Field>
      )}
    </>
  );
}
