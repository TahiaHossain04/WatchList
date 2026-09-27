import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Fades + lifts its content in. Give consecutive blocks increasing `order`
 * (0, 1, 2…) and they appear one after another — STEP seconds apart.
 */
const STEP = 0.07;

export function Reveal({ order = 0, children, className }: { order?: number; children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      // empty:hidden — if the content renders nothing (e.g. no cast), take up no space.
      className={`empty:hidden ${className ?? ""}`}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.15 + order * STEP }}
    >
      {children}
    </motion.div>
  );
}
