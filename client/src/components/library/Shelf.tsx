import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Entry } from "../../types/entry";
import { Tape } from "./Tape";

/**
 * The tape rack: VHS tapes stand side by side and wrap onto new rows.
 * The shelves are painted by the `.shelf` class in index.css — one per row,
 * because every row is exactly --row-h tall.
 *
 * ANIMATION: `layout` makes tapes slide to their new spot when filters/sorting change;
 * AnimatePresence lets removed tapes shrink away instead of vanishing.
 */
export function Shelf({ entries }: { entries: Entry[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="shelf relative rounded-b-md px-3 sm:px-5">
      <ul className="flex flex-wrap items-end gap-x-1">
        <AnimatePresence mode="popLayout" initial={false}>
          {entries.map((entry, i) => (
            <motion.li
              key={entry.id}
              layout={!reduceMotion}
              className="flex h-(--row-h) items-end pb-(--plank)"
              exit={{ opacity: 0, scale: 0.6, y: 24, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              <Tape entry={entry} index={i} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
