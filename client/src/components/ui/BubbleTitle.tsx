import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";

/**
 * BubbleTitle — glossy bubblegum lettering that bounces in letter by letter.
 *
 *   <BubbleTitle text={"Tahia’s\nWatch List"} />      ← "\n" starts a new line
 *
 * HOW IT WORKS
 *  1. The text is split into lines ("\n"), then words, then single letters.
 *  2. Each letter is a <motion.span> made of three stacked copies
 *     (rim, body, gloss) — the look is defined in index.css under "BUBBLE LETTERS".
 *  3. Each letter starts above its spot, invisible and tilted, then a spring
 *     animation drops it into place. Letter i waits `i * STAGGER` seconds.
 *
 * Screen readers get the plain text once (sr-only); the animated letters are aria-hidden.
 */

// ---- Animation knobs ------------------------------------------------------
const STAGGER = 0.05; // seconds between each letter starting (bigger = slower wave)
const START_DELAY = 0.15; // seconds before the first letter moves
const DROP_FROM = "-0.9em"; // how far above its spot each letter starts (bounce height)
const SPRING = { type: "spring", stiffness: 380, damping: 13, mass: 0.9 } as const; // lower damping = bouncier

// ---- Sizes (responsive via clamp: min, preferred, max) ---------------------
export const TITLE_SIZES = {
  hero: "text-[clamp(3rem,8.5vw,8.25rem)]",
  page: "text-[clamp(2.7rem,7.5vw,5.75rem)]",
  small: "text-[clamp(1.9rem,4vw,2.6rem)]",
  logo: "text-[1.45rem]",
} as const;

// Narrow letters get their shine centered instead of top-left.
const NARROW = new Set(["i", "l", "I", "t", "j", "’", "'", "!", "1", "f", "r"]);

interface BubbleTitleProps {
  text: string;
  size?: keyof typeof TITLE_SIZES;
  as?: "h1" | "h2" | "span";
  animate?: boolean;
  className?: string;
}

export function BubbleTitle({ text, size = "hero", as = "h1", animate = true, className = "" }: BubbleTitleProps) {
  const reduceMotion = useReducedMotion();
  const Tag = as;
  const lines = text.split("\n");
  let letterIndex = 0; // running count across all lines, used for the stagger delay

  return (
    <Tag className={`${TITLE_SIZES[size]} ${size === "logo" ? "bubble-title--plain" : ""} m-0 text-center font-bold leading-[0.98] ${className}`}>
      <span className="sr-only">{text.replace(/\n/g, " ")}</span>
      <span aria-hidden="true" className="block">
        {lines.map((line, lineIdx) => (
          <span key={lineIdx} className="flex flex-wrap justify-center gap-x-[0.28em]">
            {line.split(" ").map((word, wordIdx) => (
              // Words never break in the middle; they wrap as whole units on small screens.
              <span key={wordIdx} className="inline-flex whitespace-nowrap">
                {[...word].map((char) => {
                  const i = letterIndex++;
                  return (
                    <BubbleLetter
                      key={i}
                      char={char}
                      index={i}
                      animate={animate}
                      reduceMotion={Boolean(reduceMotion)}
                    />
                  );
                })}
              </span>
            ))}
          </span>
        ))}
      </span>
    </Tag>
  );
}

interface BubbleLetterProps {
  char: string;
  index: number;
  animate: boolean;
  reduceMotion: boolean;
}

function BubbleLetter({ char, index, animate, reduceMotion }: BubbleLetterProps) {
  // A tiny resting tilt per letter (-1.8° … +1.8°) makes it feel hand-made.
  const tilt = (((index * 37) % 7) - 3) * 0.6;
  const narrow = NARROW.has(char);
  const glossStyle = {
    "--gx": narrow ? "46%" : "30%",
    "--gy": narrow ? "30%" : "38%",
  } as CSSProperties;

  const initial = !animate
    ? false
    : reduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: DROP_FROM, rotate: tilt - 14, scale: 0.7 };

  return (
    <motion.span
      className="bubble-letter"
      initial={initial}
      animate={{ opacity: 1, y: "0em", rotate: tilt, scale: 1 }}
      transition={
        reduceMotion
          ? { duration: 0.5, delay: START_DELAY }
          : { ...SPRING, delay: START_DELAY + index * STAGGER, opacity: { duration: 0.2, delay: START_DELAY + index * STAGGER } }
      }
      // Hover: the letter lifts a few pixels and wiggles.
      whileHover={reduceMotion ? undefined : { y: "-0.05em", scale: 1.06, rotate: tilt + 4 }}
    >
      <span className="bubble-letter__rim">{char}</span>
      <span className="bubble-letter__body">{char}</span>
      <span className="bubble-letter__gloss" style={glossStyle}>
        {char}
      </span>
    </motion.span>
  );
}
