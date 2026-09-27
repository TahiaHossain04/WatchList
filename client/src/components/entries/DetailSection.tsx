import type { ReactNode } from "react";

/**
 * A labelled block on the entry page ("Director", "Cast", …).
 * Pass `hidden` (or no children) and it renders nothing — so empty/NULL fields
 * simply disappear instead of showing "N/A".
 */
export function DetailSection({ label, children }: { label: string; children?: ReactNode }) {
  if (children == null || children === false || children === "") return null;
  return (
    <section>
      <h2 className="mb-1.5 font-candy text-lg tracking-wide text-gum-light">{label}</h2>
      <div className="text-lg leading-relaxed text-ink">{children}</div>
    </section>
  );
}
