import { motion, useReducedMotion } from "framer-motion";

/**
 * A handful of soft, blurry bubbles drifting slowly up behind every page.
 * Purely decorative — very faint so they never compete with the content.
 * Edit BUBBLES to add/remove bubbles or change their size, speed and position.
 */
const BUBBLES = [
  { left: "6%", size: 90, color: "var(--color-pink-light)", duration: 38, delay: 0 },
  { left: "22%", size: 40, color: "var(--color-cream)", duration: 30, delay: 12 },
  { left: "48%", size: 120, color: "var(--color-lavender)", duration: 46, delay: 6 },
  { left: "71%", size: 55, color: "var(--color-pink-light)", duration: 34, delay: 20 },
  { left: "88%", size: 80, color: "var(--color-cream)", duration: 42, delay: 3 },
];

export function AmbientBubbles() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
      {BUBBLES.map((b, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full blur-[2px]"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle at 35% 30%, rgb(255 255 255 / 0.5) 0 12%, ${b.color} 45%, transparent 72%)`,
          }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-20vh", opacity: [0, 0.16, 0.16, 0], x: [0, 18, -12, 0] }}
          transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}
