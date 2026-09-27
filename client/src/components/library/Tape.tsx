import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { Entry } from "../../types/entry";
import { formatProgress, formatRating, hashString } from "../../utils/format";
import { COLLECTION_COLOR, COLLECTION_LABEL, MEDIA_TYPE_LABEL } from "../../utils/labels";
import { ReactionBadge } from "../entries/ReactionBadge";

/**
 * One entry drawn as a VHS tape standing in the rack: a colored cassette case
 * (the collection color) with a cream label sticker where the title is "written".
 *
 *   ♥ favourites  → glow softly, little bubbles float up, heart sticker (with their #)
 *   ✕ not for me  → greyed out with a cross sticker
 *
 * Look & animations: the "VHS TAPES" block in index.css.
 * Title sizing: long titles split onto 2–3 lines and shrink a little; short ones get bigger.
 */

const MAX_FONT_REM = 1.1; // biggest label text (short titles)
const MIN_FONT_REM = 0.55; // smallest label text (very long titles)
const CHAR_WIDTH = 0.6; // average letter width in "em" for the label font — raise if text ever overflows

/** Split a title into `lines` roughly equal lines at word boundaries. */
function splitTitle(title: string, lines: number): string[] {
  const words = title.split(/\s+/);
  if (lines <= 1 || words.length < 2) return [title];
  const longest = (option: string[]) => Math.max(...option.map((l) => l.length));
  let best = [title];
  if (lines === 2 || words.length < 3) {
    // Try every break point, keep the one whose longest line is shortest.
    for (let i = 1; i < words.length; i++) {
      const option = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
      if (longest(option) < longest(best)) best = option;
    }
    return best;
  }
  for (let i = 1; i < words.length - 1; i++) {
    for (let j = i + 1; j < words.length; j++) {
      const option = [words.slice(0, i), words.slice(i, j), words.slice(j)].map((w) => w.join(" "));
      if (longest(option) < longest(best)) best = option;
    }
  }
  return best;
}

function labelLayout(title: string, hash: number) {
  const n = title.length;
  // 1 line for short titles, 2 for medium; switch to 3 when 2 lines would still be long.
  let lines = splitTitle(title, n <= 16 ? 1 : 2);
  if (lines.length === 2 && Math.max(...lines.map((l) => l.length)) > 15) {
    const three = splitTitle(title, 3);
    if (three.length === 3) lines = three;
  }
  const longest = Math.max(...lines.map((l) => l.length));
  // Tape widths (rem) for 1, 2 and 3 lines of title.
  const variance = (hash % 3) * 0.08;
  const width = lines.length === 1 ? 2.2 + Math.min(n, 16) * 0.02 + variance : lines.length === 2 ? 3 + variance : 3.9;
  // Font is capped by the label's WIDTH (lines side by side)…
  const maxFont = Math.min(MAX_FONT_REM, (width - 1.1) / (lines.length * 1.1));
  // …and by its HEIGHT (100cqh = the label's height; it's a size container).
  const fontSize = `clamp(${MIN_FONT_REM}rem, calc(94cqh / ${(longest * CHAR_WIDTH).toFixed(2)}), ${maxFont.toFixed(2)}rem)`;
  return { lines, width, fontSize };
}

export function Tape({ entry, index }: { entry: Entry; index: number }) {
  const reduceMotion = useReducedMotion();
  const hash = hashString(entry.id);
  const { lines, width, fontSize } = labelLayout(entry.title, hash);
  const favorite = entry.reaction === "favorite";
  const disliked = entry.reaction === "dislike";
  // Now and then a tape leans on its neighbour (never the first one, never a favourite).
  const leans = index > 0 && !favorite && hash % 11 === 0;

  const rating = formatRating(entry.rating);
  // Small sticker: the rating, or for shows in progress the episode you're on (e.g. "E7").
  const sticker = entry.status === "watching" && entry.last_episode != null ? `E${entry.last_episode}` : rating;
  const progress = entry.status === "watching" || entry.status === "abandoned" ? formatProgress(entry) : null;
  const mark = favorite
    ? `♥ ${entry.favorite_rank ? `#${entry.favorite_rank} favourite` : "favourite"}`
    : disliked
      ? "✕ not for me"
      : null;

  return (
    <motion.div
      className={`tape-wrap group relative flex items-end ${favorite ? "tape-wrap--fav" : ""}`}
      style={{ marginLeft: leans ? "0.8rem" : undefined }}
      // Tapes drop into the rack one after another and bounce as they land.
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -60, rotate: (hash % 2 ? 1 : -1) * 7 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{
        type: "spring",
        stiffness: 340,
        damping: 13,
        delay: 0.15 + Math.min(index, 20) * 0.04,
        opacity: { duration: 0.15, delay: 0.15 + Math.min(index, 20) * 0.04 },
      }}
    >
      {favorite && (
        <>
          <span className="tape-glow" aria-hidden="true" />
          <span className="fav-bubble" aria-hidden="true" />
          <span className="fav-bubble" aria-hidden="true" />
          <span className="fav-bubble" aria-hidden="true" />
        </>
      )}

      <Link
        to={`/entry/${entry.id}`}
        aria-label={[entry.title, mark, rating && `rated ${rating} out of 10`].filter(Boolean).join(", ")}
        className="relative z-[1] block rounded-md focus-visible:outline-offset-4"
        style={{ transformOrigin: "bottom right", rotate: leans ? "-5deg" : undefined }}
      >
        <motion.div
          className={`tape ${disliked ? "tape--dislike" : ""}`}
          style={
            {
              width: `${width}rem`,
              height: "calc((var(--row-h) - var(--plank) - 0.95rem) * 0.97)",
              "--tape-case": COLLECTION_COLOR[entry.collection],
            } as CSSProperties
          }
          whileHover={reduceMotion ? undefined : { y: -9 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
        >
          <span className="tape__grip" aria-hidden="true" />
          <span className="tape__label" aria-hidden="true">
            <span className="tape__title" style={{ fontSize }}>
              {lines.map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </span>
          </span>
          {sticker && (
            <span className="tape__sticker" aria-hidden="true">
              {sticker}
            </span>
          )}
          <span className="tape__brand" aria-hidden="true">
            VHS
          </span>
        </motion.div>
      </Link>

      {(favorite || disliked) && (
        <span className="pointer-events-none absolute -top-2.5 -right-2 z-[2]">
          <ReactionBadge reaction={entry.reaction} rank={entry.favorite_rank} size={favorite && entry.favorite_rank ? "md" : "sm"} />
        </span>
      )}

      {/* Hover / focus label with the full title */}
      <div
        role="presentation"
        className="pointer-events-none absolute bottom-[calc(100%+0.4rem)] left-1/2 z-20 w-max max-w-[14rem] -translate-x-1/2 translate-y-1 rounded-2xl bg-creme px-3.5 py-2 text-center text-ink-dark opacity-0 shadow-xl transition-all duration-200 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
      >
        <p className="font-title text-base leading-tight font-bold">{entry.title}</p>
        <p className="mt-0.5 text-xs font-bold opacity-70">
          {[mark, COLLECTION_LABEL[entry.collection], MEDIA_TYPE_LABEL[entry.media_type], rating && `★ ${rating}`, progress]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </motion.div>
  );
}
