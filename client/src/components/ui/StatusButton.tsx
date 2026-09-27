import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * StatusButton — the big creamy, slightly wobbly pill buttons from the home page.
 *
 *   <StatusButton label="Watched" path="/watched" />
 *
 * ROUTING: it renders a React Router <Link>, so clicking changes the page
 * without a full reload. `path` is where it goes.
 *
 * LOOK: colors come from the --button-* variables in styles/theme.css and the
 * `.organic-button` class in index.css. `shape` picks one of the wobbly outlines below.
 */

// Uneven border-radius values = hand-drawn, organic pill shapes. Add more if you like.
// (horizontal radii / vertical radii — "em" so the shape scales with the text size)
const SHAPES = [
  "1.9em 2.3em 2.1em 1.7em / 1.6em 1.9em 1.7em 1.9em",
  "2.2em 1.8em 2.4em 2em / 1.9em 1.6em 2em 1.7em",
  "1.8em 2.2em 1.9em 2.3em / 1.7em 2em 1.6em 1.9em",
  "2.3em 1.9em 2em 2.2em / 1.8em 1.7em 1.9em 1.6em",
];
const TILTS = [-0.8, 0.5, -0.4, 0.9]; // degrees — tiny, just enough to feel hand-placed

const MotionLink = motion.create(Link);

interface StatusButtonProps {
  label: string;
  path: string;
  shape?: number; // 0–3
  size?: "lg" | "sm";
  active?: boolean;
  delay?: number; // entrance delay in seconds
}

export function StatusButton({ label, path, shape = 0, size = "lg", active = false, delay = 0 }: StatusButtonProps) {
  const reduceMotion = useReducedMotion();
  const sizing =
    size === "lg"
      ? "min-h-[3.9rem] px-[1.5em] text-[clamp(1.05rem,1.45vw,1.4rem)] sm:min-h-[4.3rem] sm:min-w-[9em]"
      : "min-h-11 px-5 text-lg";

  return (
    <MotionLink
      to={path}
      aria-current={active ? "page" : undefined}
      className={`organic-button select-none whitespace-nowrap ${sizing}`}
      style={{ borderRadius: SHAPES[shape % SHAPES.length] }}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, rotate: TILTS[shape % TILTS.length] }}
      animate={{ opacity: 1, y: 0, rotate: TILTS[shape % TILTS.length] }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay }}
      // HOVER MOVEMENT: lift (y), grow (scale). TAP: squish down before navigating.
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.05, rotate: 0 }}
      whileTap={reduceMotion ? undefined : { y: 1, scale: 0.95 }}
    >
      {label}
    </MotionLink>
  );
}
