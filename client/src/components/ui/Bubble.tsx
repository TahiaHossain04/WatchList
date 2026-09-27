import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";

/**
 * A small glossy decorative bubble that floats gently up and down.
 * Position it with `style` (top/left/right in % or em). Purely decorative.
 */

// Colors come from the theme — change them in styles/theme.css.
const TONES = {
  pink: { color: "var(--color-pink-light)", light: "var(--color-pink-soft)", dark: "var(--color-pink-primary)" },
  cream: { color: "var(--color-cream)", light: "#ffffff", dark: "var(--color-cream-shade)" },
  lavender: { color: "var(--color-lavender)", light: "#e4dcff", dark: "#8f7ae6" },
} as const;

interface BubbleProps {
  tone: keyof typeof TONES;
  size: string; // any CSS size, e.g. "0.4em" or "3rem"
  style?: CSSProperties;
  delay?: number;
}

export function Bubble({ tone, size, style, delay = 0 }: BubbleProps) {
  const reduceMotion = useReducedMotion();
  const colors = TONES[tone];

  return (
    <motion.span
      aria-hidden="true"
      className="gloss-bubble"
      style={
        {
          width: size,
          height: size,
          "--bubble-color": colors.color,
          "--bubble-light": colors.light,
          "--bubble-dark": colors.dark,
          ...style,
        } as CSSProperties
      }
      initial={{ opacity: 0, scale: 0 }}
      animate={
        reduceMotion
          ? { opacity: 1, scale: 1 }
          : { opacity: 1, scale: 1, y: [0, -7, 0] } // the gentle float
      }
      transition={{
        opacity: { delay: 0.9 + delay, duration: 0.4 },
        scale: { delay: 0.9 + delay, type: "spring", stiffness: 300, damping: 12 },
        y: { delay: 1.4 + delay, duration: 5 + delay * 2, repeat: Infinity, ease: "easeInOut" },
      }}
    />
  );
}
