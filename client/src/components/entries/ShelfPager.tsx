import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Neighbours } from "../../hooks/useShelfNeighbours";

/**
 * "‹ Previous · 12 / 131 · Next ›" on the entry page.
 * The ← and → arrow keys do the same (ignored while typing in a box).
 */
export function ShelfPager({ neighbours }: { neighbours: Neighbours }) {
  const navigate = useNavigate();
  const { prev, next, position, total } = neighbours;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.altKey || e.ctrlKey || e.metaKey || target.closest("input, textarea, select, [role='dialog'], [role='alertdialog']")) return;
      if (e.key === "ArrowLeft" && prev) navigate(`/entry/${prev.id}`);
      if (e.key === "ArrowRight" && next) navigate(`/entry/${next.id}`);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [prev, next, navigate]);

  if (total < 2) return null;

  const pill =
    "group inline-flex min-h-11 max-w-[42vw] items-center gap-2 rounded-full bg-panel px-4 font-candy text-lg tracking-wide text-ink ring-1 ring-line transition-colors hover:bg-panel-raised sm:max-w-[16rem]";

  return (
    <nav aria-label="Flip through this shelf" className="flex items-center gap-2 sm:gap-3">
      {prev ? (
        <Link to={`/entry/${prev.id}`} className={pill} title={prev.title} aria-label={`Previous: ${prev.title}`}>
          <span aria-hidden="true" className="-mt-1 text-3xl leading-none transition-transform group-hover:-translate-x-0.5">
            ‹
          </span>
          <span className="truncate font-body text-sm font-bold">{prev.title}</span>
        </Link>
      ) : (
        <span className={`${pill} pointer-events-none opacity-35`} aria-hidden="true">
          ‹ <span className="font-body text-sm font-bold">Start</span>
        </span>
      )}

      <span className="shrink-0 font-body text-sm font-extrabold text-ink-muted tabular-nums">
        {position} / {total}
      </span>

      {next ? (
        <Link to={`/entry/${next.id}`} className={pill} title={next.title} aria-label={`Next: ${next.title}`}>
          <span className="truncate font-body text-sm font-bold">{next.title}</span>
          <span aria-hidden="true" className="-mt-1 text-3xl leading-none transition-transform group-hover:translate-x-0.5">
            ›
          </span>
        </Link>
      ) : (
        <span className={`${pill} pointer-events-none opacity-35`} aria-hidden="true">
          <span className="font-body text-sm font-bold">End</span> ›
        </span>
      )}
    </nav>
  );
}
