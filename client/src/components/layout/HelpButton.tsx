import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { ReactionBadge } from "../entries/ReactionBadge";

/**
 * The floating "?" bubble in the corner of every page (except Home).
 * Opens a little card explaining what the hearts, crosses and greyed-out tapes mean.
 * Edit the wording in the <ul> below.
 */
export function HelpButton() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on Escape or when clicking anywhere else.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="What the marks mean"
            className="candy-panel w-[min(21rem,calc(100vw-2rem))] origin-bottom-right p-5"
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
          >
            <h2 className="font-title text-xl font-bold text-ink">What the marks mean</h2>
            <ul className="mt-3 flex flex-col gap-3 text-ink">
              <li className="flex gap-3">
                <ReactionBadge reaction="favorite" rank={1} size="md" className="shrink-0" />
                <span>
                  <strong>Glowing, with a heart</strong> — one of Tahia’s favourites. The number is her ranking
                  (#1 = most loved). Tap <strong>♥ Favourites</strong> on a shelf to see them in order.
                </span>
              </li>
              <li className="flex gap-3">
                <ReactionBadge reaction="dislike" size="md" className="shrink-0" />
                <span>
                  <strong>Greyed out, with a cross</strong> — she watched it, but it wasn’t really for her.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-creme text-[0.6rem] font-extrabold text-ink-dark shadow-[inset_0_-2px_0_var(--color-cream-shade)]">
                  9
                </span>
                <span>
                  <strong>Everything else</strong> — enjoyed it. The little sticker is her rating out of 10 (or the
                  episode she’s on).
                </span>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close help" : "What do the hearts and crosses mean?"}
        onClick={() => setOpen((o) => !o)}
        className="grid size-12 place-items-center rounded-full bg-creme font-title text-2xl font-bold text-ink-dark shadow-[inset_0_-4px_0_var(--color-cream-shade),0_0.6rem_1.2rem_-0.4rem_rgb(0_0_0/0.5)]"
        whileHover={{ y: -3, scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
      >
        {open ? "×" : "?"}
      </motion.button>
    </div>
  );
}
