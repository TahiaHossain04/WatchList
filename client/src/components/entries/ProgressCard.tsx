import { motion } from "framer-motion";
import type { Entry } from "../../types/entry";
import { formatDate, formatProgress, progressFraction } from "../../utils/format";

/**
 * "Currently at" (watching) or "Stopped at" (abandoned) card.
 * Shows only the pieces that exist, and a progress bar when the total episode count is known.
 * Renders nothing if there's no progress info at all.
 */
export function ProgressCard({ entry }: { entry: Entry }) {
  const progress = formatProgress(entry);
  const fraction = progressFraction(entry);
  const lastWatched = formatDate(entry.last_watched_at);
  if (!progress && !lastWatched) return null;

  const isAbandoned = entry.status === "abandoned";

  return (
    <div className="rounded-[1.6rem_1.9rem_1.7rem_1.5rem] bg-panel p-5 ring-1 ring-line">
      {progress && (
        <>
          <p className="font-candy text-lg tracking-wide text-gum-light">{isAbandoned ? "Stopped at" : "Currently at"}</p>
          <p className="font-title text-2xl font-bold text-ink">{progress}</p>
        </>
      )}

      {fraction != null && (
        <div className="mt-3">
          <div
            className="h-3.5 overflow-hidden rounded-full bg-page shadow-inner"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={entry.total_episodes ?? undefined}
            aria-valuenow={entry.last_episode ?? undefined}
            aria-label="Episodes watched"
          >
            <motion.div
              className="h-full rounded-full bg-gum-light shadow-[inset_0_-3px_0_var(--color-pink-deep)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(fraction * 100, 4)}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.3 }}
            />
          </div>
          <p className="mt-1.5 text-sm font-bold text-ink-muted">
            {entry.last_episode} of {entry.total_episodes} episodes
          </p>
        </div>
      )}

      {lastWatched && (
        <p className={`text-ink-muted ${progress ? "mt-3" : ""}`}>
          <span className="font-bold">Last watched</span> {lastWatched}
        </p>
      )}
    </div>
  );
}
