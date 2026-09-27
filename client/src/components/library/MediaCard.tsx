import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Entry } from "../../types/entry";
import { formatProgress, formatRating, hashString } from "../../utils/format";
import { ReactionBadge } from "../entries/ReactionBadge";
import { Poster } from "./Poster";

/** Poster-style card used by the grid view: poster (or placeholder) + title + rating. */
export function MediaCard({ entry, index = 0 }: { entry: Entry; index?: number }) {
  const reduceMotion = useReducedMotion();
  const tilt = ((hashString(entry.id) % 5) - 2) * 0.5; // -1° … +1°
  const rating = formatRating(entry.rating);
  const progress = entry.status === "watching" || entry.status === "abandoned" ? formatProgress(entry) : null;

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 + Math.min(index, 18) * 0.04 }}
    >
      <Link to={`/entry/${entry.id}`} className="group block rounded-3xl focus-visible:outline-offset-4">
        <motion.div
          className={`relative aspect-[2/3] overflow-hidden rounded-[1.4rem_1.6rem_1.5rem_1.3rem] bg-panel shadow-[0_1rem_1.6rem_-0.9rem_rgb(0_0_0/0.55)] ring-1 ring-line ${
            entry.reaction === "favorite" ? "card--fav" : entry.reaction === "dislike" ? "card--dislike" : ""
          }`}
          style={{ rotate: `${tilt}deg` }}
          whileHover={reduceMotion ? undefined : { y: -8, rotate: 0, scale: 1.03 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
        >
          <Poster entry={entry} />
          <span className="absolute top-2 right-2">
            <ReactionBadge reaction={entry.reaction} rank={entry.favorite_rank} size="lg" />
          </span>
        </motion.div>
        <div className="mt-3 px-1">
          <h3 className="line-clamp-2 font-title text-lg leading-tight font-semibold text-ink group-hover:text-gum-light">
            {entry.title}
          </h3>
          {(rating || progress) && (
            <p className="mt-1 text-sm font-bold text-ink-muted">
              {rating && <span className="text-gum-light">★ {rating}</span>}
              {rating && progress && " · "}
              {progress}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
