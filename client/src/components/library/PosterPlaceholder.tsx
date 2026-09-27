import type { Entry } from "../../types/entry";
import { hashString } from "../../utils/format";
import { COLLECTION_COLOR, COLLECTION_LABEL, MEDIA_TYPE_LABEL } from "../../utils/labels";

/**
 * A generated "poster" for entries that don't have a poster_url yet:
 * the collection color, a few bubbles, and the title in chunky letters.
 */
export function PosterPlaceholder({ entry, large = false }: { entry: Entry; large?: boolean }) {
  const hash = hashString(entry.id);
  const color = COLLECTION_COLOR[entry.collection];
  const bx = 15 + (hash % 50);
  const by = 10 + ((hash >> 4) % 25);

  return (
    <div
      className="relative flex size-full flex-col justify-end overflow-hidden p-[8%]"
      style={{
        background: `radial-gradient(circle at ${bx}% ${by}%, rgb(255 255 255 / 0.45) 0 8%, transparent 8.5%),
          radial-gradient(circle at ${100 - bx / 2}% ${by + 22}%, rgb(255 255 255 / 0.3) 0 4%, transparent 4.5%),
          radial-gradient(circle at 80% 110%, rgb(255 255 255 / 0.25) 0 30%, transparent 30.5%),
          linear-gradient(160deg, color-mix(in oklab, ${color}, white 18%), ${color} 55%, color-mix(in oklab, ${color}, black 12%))`,
      }}
      aria-hidden="true"
    >
      <p className="text-[0.7em] font-extrabold tracking-[0.18em] text-ink-dark/60 uppercase">
        {COLLECTION_LABEL[entry.collection]} · {MEDIA_TYPE_LABEL[entry.media_type]}
      </p>
      <p
        className={`mt-1 line-clamp-4 font-title leading-[1.02] font-bold break-words text-ink-dark ${
          large ? "text-[clamp(1.8rem,4vw,2.8rem)]" : "text-[clamp(1.05rem,2.2vw,1.4rem)]"
        }`}
      >
        {entry.title}
      </p>
    </div>
  );
}
