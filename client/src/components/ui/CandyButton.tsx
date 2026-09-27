import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ComponentProps } from "react";
import { Link } from "react-router-dom";

/**
 * Everyday buttons in the site's candy style.
 *   variant "cream"  – the calm default (same look as the home buttons, smaller)
 *   variant "pink"   – the main action on a page (Save, Log in)
 *   variant "ghost"  – quiet secondary action (Cancel)
 *   variant "danger" – destructive action (Delete)
 * Use <CandyButton> for actions and <CandyLink> for navigation.
 */

type Variant = "cream" | "pink" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  cream: "organic-button",
  pink: "bg-gum text-ink-dark shadow-[inset_0_-0.22em_0_var(--color-pink-deep),0_0.5em_0.9em_-0.35em_rgb(0_0_0/0.4)] hover:bg-gum-light",
  ghost: "text-ink-muted ring-2 ring-line hover:bg-panel hover:text-ink",
  danger: "bg-(--color-danger) text-white shadow-[inset_0_-0.22em_0_var(--color-danger-shade),0_0.5em_0.9em_-0.35em_rgb(0_0_0/0.4)] hover:brightness-110",
};

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[1.4em_1.6em_1.5em_1.3em/1.3em_1.4em_1.6em_1.5em] px-6 py-2 font-candy text-lg tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const MOTION = {
  whileHover: { y: -3, scale: 1.03 },
  whileTap: { y: 1, scale: 0.96 },
  transition: { type: "spring", stiffness: 400, damping: 20 },
} as const;

interface CandyButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
}

export function CandyButton({ variant = "cream", className = "", disabled, ...props }: CandyButtonProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      disabled={disabled}
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
      {...(reduceMotion || disabled ? {} : MOTION)}
      {...props}
    />
  );
}

const MotionLink = motion.create(Link);

type CandyLinkProps = ComponentProps<typeof MotionLink> & {
  variant?: Variant;
};

export function CandyLink({ variant = "cream", className = "", ...props }: CandyLinkProps) {
  const reduceMotion = useReducedMotion();
  return (
    <MotionLink className={`${BASE} ${VARIANTS[variant]} ${className}`} {...(reduceMotion ? {} : MOTION)} {...props} />
  );
}
