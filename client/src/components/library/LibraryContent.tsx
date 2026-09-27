import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LibraryView } from "../../hooks/useLibraryFilters";
import type { Entry } from "../../types/entry";
import { MediaCard } from "./MediaCard";
import { Shelf } from "./Shelf";

/** Shows a list of entries as a bookshelf or a poster grid. */
export function LibraryContent({ entries, view }: { entries: Entry[]; view: LibraryView }) {
  return view === "shelf" ? <Shelf entries={entries} /> : <PosterGrid entries={entries} />;
}

function PosterGrid({ entries }: { entries: Entry[] }) {
  const reduceMotion = useReducedMotion();
  return (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      <AnimatePresence mode="popLayout" initial={false}>
        {entries.map((entry, i) => (
          <motion.li
            key={entry.id}
            layout={!reduceMotion}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <MediaCard entry={entry} index={i} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
