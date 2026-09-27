import { motion } from "framer-motion";
import { useCallback, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DetailSection } from "../components/entries/DetailSection";
import { ProgressCard } from "../components/entries/ProgressCard";
import { ReactionBadge } from "../components/entries/ReactionBadge";
import { ShelfPager } from "../components/entries/ShelfPager";
import { Poster } from "../components/library/Poster";
import { CandyButton, CandyLink } from "../components/ui/CandyButton";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { LoadingBubbles } from "../components/ui/LoadingBubbles";
import { Reveal } from "../components/ui/Reveal";
import { StateMessage } from "../components/ui/StateMessage";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useEntry } from "../hooks/useEntry";
import { useShelfNeighbours } from "../hooks/useShelfNeighbours";
import { deleteEntry, updateEntry } from "../services/entriesApi";
import { formatDate, formatRating } from "../utils/format";
import { COLLECTION_COLOR, COLLECTION_LABEL, collectionPath, MEDIA_TYPE_LABEL, STATUS_BY_VALUE, COLLECTION_INFO, TYPE_GROUPS, typeGroupOf } from "../utils/labels";

/**
 * /entry/:id — everything about one title.
 * Every section is optional: if a field is empty it's simply not shown.
 */
export default function EntryDetails() {
  const { id } = useParams();
  const { entry, setEntry, loading, error, notFound } = useEntry(id);
  const neighbours = useShelfNeighbours(entry);
  const { isAdmin } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingMark, setSavingMark] = useState(false);
  const closeConfirm = useCallback(() => setConfirmOpen(false), []);

  if (loading) return <LoadingBubbles label="Pulling it off the shelf…" />;
  if (notFound || !entry) {
    return (
      <StateMessage
        tone={error ? "error" : "empty"}
        title={error ? "Something went wrong." : "That title isn’t on the shelf."}
        message={error ?? "It may have been removed, or the link is a little off."}
        action={<CandyLink to="/">Back home</CandyLink>}
      />
    );
  }

  const status = STATUS_BY_VALUE[entry.status];
  const rating = formatRating(entry.rating);
  const watchedOn = formatDate(entry.date_watched);
  const shelfPath = collectionPath(entry.status, entry.collection);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEntry(entry.id);
      showToast(`“${entry.title}” removed`);
      navigate(shelfPath, { replace: true });
    } catch (err) {
      showToast((err as Error).message, "error");
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  // Admin quick buttons: tap ♥ or ✕ to set/clear the mark without opening the form.
  const toggleReaction = async (reaction: "favorite" | "dislike") => {
    setSavingMark(true);
    try {
      const next = entry.reaction === reaction ? null : reaction;
      const updated = await updateEntry(entry.id, { reaction: next });
      setEntry(updated);
      showToast(next === "favorite" ? "Added to favourites ♥" : next === "dislike" ? "Marked as not for you" : "Mark removed");
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setSavingMark(false);
    }
  };

  const listName = `${COLLECTION_INFO[entry.collection].label} ${TYPE_GROUPS.find((g) => g.value === typeGroupOf(entry.media_type))!
    .label(COLLECTION_INFO[entry.collection])
    .toLowerCase()}`;

  return (
    <article>
      {/* Back to the shelf + flip to the previous / next title on it */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={neighbours?.backPath ?? shelfPath}
          className="inline-flex items-center gap-1.5 rounded-full py-1 pr-3 font-candy text-lg tracking-wide text-ink-muted transition-colors hover:text-ink"
        >
          <span aria-hidden="true">←</span> {COLLECTION_LABEL[entry.collection]} · {status.shortLabel}
        </Link>
        {neighbours && <ShelfPager neighbours={neighbours} />}
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,19rem)_1fr] md:gap-12 lg:grid-cols-[minmax(0,22rem)_1fr]">
        {/* Poster */}
        <motion.div
          className="mx-auto w-full max-w-[18rem] md:max-w-none"
          initial={{ opacity: 0, rotate: -6, y: 20 }}
          animate={{ opacity: 1, rotate: -2, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          <div
            className={`relative aspect-[2/3] overflow-hidden rounded-[1.8rem_2.1rem_1.9rem_1.7rem] shadow-[0_1.6rem_2.4rem_-1.2rem_rgb(0_0_0/0.6)] ring-1 ring-line ${
              entry.reaction === "favorite" ? "card--fav" : entry.reaction === "dislike" ? "card--dislike" : ""
            }`}
          >
            <Poster entry={entry} large />
            <span className="absolute top-3 right-3">
              <ReactionBadge reaction={entry.reaction} rank={entry.favorite_rank} size="lg" />
            </span>
          </div>
        </motion.div>

        {/* Info */}
        <div className="flex min-w-0 flex-col gap-7">
          <Reveal order={0}>
            <header>
              <div className="mb-3 flex flex-wrap gap-2">
                <Tag>
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full"
                    style={{ background: COLLECTION_COLOR[entry.collection] }}
                  />
                  {COLLECTION_LABEL[entry.collection]}
                </Tag>
                <Tag>{MEDIA_TYPE_LABEL[entry.media_type]}</Tag>
                {entry.release_year && <Tag>{entry.release_year}</Tag>}
                <Tag highlight>{status.label}</Tag>
              </div>
              <h1 className="font-title text-[clamp(2.2rem,5vw,3.75rem)] leading-[1.02] font-bold break-words text-ink">
                {entry.title}
              </h1>
              {entry.reaction === "favorite" && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-gum/15 py-1 pr-4 pl-1 font-candy text-lg tracking-wide text-gum-light ring-1 ring-gum/40">
                  <ReactionBadge reaction="favorite" rank={entry.favorite_rank} size="md" />
                  {entry.favorite_rank ? `Tahia’s #${entry.favorite_rank} favourite in ${listName}` : "One of Tahia’s favourites"}
                </p>
              )}
              {entry.reaction === "dislike" && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-panel py-1 pr-4 pl-1 font-candy text-lg tracking-wide text-ink-muted ring-1 ring-line">
                  <ReactionBadge reaction="dislike" size="md" />
                  Watched it — not Tahia’s cup of tea
                </p>
              )}
              {rating && (
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="font-title text-4xl font-bold text-gum-light">★ {rating}</span>
                  <span className="font-bold text-ink-muted">/ 10</span>
                </p>
              )}
            </header>
          </Reveal>

          {(entry.status === "watching" || entry.status === "abandoned") && (
            <Reveal order={1}>
              <ProgressCard entry={entry} />
            </Reveal>
          )}

          {entry.comment && (
            <Reveal order={2}>
              <section className="relative rounded-[1.6rem_1.9rem_1.7rem_1.5rem] bg-creme p-6 text-ink-dark shadow-[inset_0_-5px_0_var(--color-cream-shade)]">
                <h2 className="mb-1 font-candy text-lg tracking-wide text-gum-deep">My thoughts</h2>
                <p className="text-lg leading-relaxed whitespace-pre-line">{entry.comment}</p>
              </section>
            </Reveal>
          )}

          <Reveal order={3} className="grid gap-6 sm:grid-cols-2">
            <DetailSection label="Watched on">{watchedOn}</DetailSection>
            <DetailSection label="Director">{entry.director}</DetailSection>
            <DetailSection label="Episodes">
              {entry.total_episodes && entry.status !== "watching" ? `${entry.total_episodes} episodes` : null}
            </DetailSection>
          </Reveal>

          <Reveal order={4}>
            <DetailSection label="Cast">
              {entry.actors?.length ? (
                <ul className="flex flex-wrap gap-2">
                  {entry.actors.map((actor) => (
                    <li key={actor} className="rounded-full bg-panel px-3.5 py-1 text-base font-bold ring-1 ring-line">
                      {actor}
                    </li>
                  ))}
                </ul>
              ) : null}
            </DetailSection>
          </Reveal>

          <Reveal order={5}>
            <DetailSection label="Synopsis">
              {entry.synopsis && <p className="whitespace-pre-line text-ink-muted">{entry.synopsis}</p>}
            </DetailSection>
          </Reveal>

          {isAdmin && (
            <Reveal order={6} className="flex flex-wrap gap-3 border-t border-line pt-6">
              <CandyButton

                variant={entry.reaction === "favorite" ? "pink" : "ghost"}

                aria-pressed={entry.reaction === "favorite"}

                disabled={savingMark}

                onClick={() => toggleReaction("favorite")}

              >

                ♥ Favourite

              </CandyButton>

              <CandyButton

                variant="ghost"

                aria-pressed={entry.reaction === "dislike"}

                disabled={savingMark}

                onClick={() => toggleReaction("dislike")}

                className={entry.reaction === "dislike" ? "bg-panel-raised text-ink" : ""}

              >

                ✕ Not for me

              </CandyButton>
              <CandyLink to={`/admin/edit/${entry.id}`}>Edit entry</CandyLink>
              <CandyButton variant="ghost" onClick={() => setConfirmOpen(true)}>
                Delete
              </CandyButton>
            </Reveal>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete “${entry.title}”?`}
        message="This action cannot be undone."
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={closeConfirm}
      />
    </article>
  );
}

function Tag({ children, highlight = false }: { children: ReactNode; highlight?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-extrabold ${
        highlight ? "bg-gum-light text-ink-dark" : "bg-panel text-ink-muted ring-1 ring-line"
      }`}
    >
      {children}
    </span>
  );
}
