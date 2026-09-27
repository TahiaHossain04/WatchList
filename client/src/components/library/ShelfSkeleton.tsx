/** Placeholder shelf with pulsing grey books while entries load. */
const HEIGHTS = [0.8, 0.92, 0.72, 0.88, 0.96, 0.78, 0.84, 0.9, 0.74, 0.86, 0.95, 0.8];

export function ShelfSkeleton() {
  return (
    <div role="status" aria-label="Loading the shelf" className="shelf px-3 sm:px-5">
      <div className="flex flex-wrap items-end gap-x-1.5 overflow-hidden" style={{ maxHeight: "var(--row-h)" }}>
        {HEIGHTS.map((h, i) => (
          <div key={i} className="flex h-(--row-h) items-end pb-(--plank)">
            <div
              className="w-11 animate-pulse rounded-t-md bg-panel-raised"
              style={{ height: `calc((var(--row-h) - var(--plank) - 0.9rem) * ${h})`, animationDelay: `${i * 90}ms` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
