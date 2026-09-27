import { motion } from "framer-motion";
import { TYPE_GROUPS, type CollectionInfo, type TypeGroup } from "../../utils/labels";

/**
 * The big Dramas | Movies (| Docs & more) switch at the top of a collection page,
 * so a huge drama list and a movie list never pile up on the same shelf.
 * "Docs & more" only appears when that collection actually has some.
 */
interface TypeToggleProps {
  collection: CollectionInfo;
  value: TypeGroup;
  counts: Record<TypeGroup, number>;
  onChange: (value: TypeGroup) => void;
}

export function TypeToggle({ collection, value, counts, onChange }: TypeToggleProps) {
  const options = TYPE_GROUPS.filter((g) => g.value !== "more" || counts.more > 0 || value === "more");

  return (
    <div className="mb-6 flex justify-center">
      <div role="tablist" aria-label="Show dramas or movies" className="inline-flex gap-1 rounded-full bg-panel p-1.5 ring-1 ring-line">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(option.value)}
              className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 font-candy text-lg tracking-wide transition-colors sm:px-7 sm:text-xl ${
                selected ? "text-ink-dark" : "text-ink-muted hover:text-ink"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="type-toggle"
                  className="absolute inset-0 rounded-full bg-creme shadow-[inset_0_-4px_0_var(--color-cream-shade)]"
                  transition={{ type: "spring", stiffness: 480, damping: 34 }}
                />
              )}
              <span className="relative">{option.label(collection)}</span>
              <span
                className={`relative rounded-full px-2 py-0.5 font-body text-xs font-extrabold ${
                  selected ? "bg-gum-light text-ink-dark" : "bg-page text-ink-muted"
                }`}
              >
                {counts[option.value]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
