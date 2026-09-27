import { motion } from "framer-motion";

/** Three bouncing bubbles — the site's loading indicator. */
export function LoadingBubbles({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16">
      <div className="flex gap-2" aria-hidden="true">
        {["var(--color-pink-light)", "var(--color-cream)", "var(--color-lavender)"].map((color, i) => (
          <motion.span
            key={color}
            className="size-4 rounded-full"
            style={{ background: color }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
          />
        ))}
      </div>
      <span className="font-candy text-lg tracking-wide text-ink-muted">{label}</span>
    </div>
  );
}
