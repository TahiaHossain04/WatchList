import { motion, useReducedMotion } from "framer-motion";
import { useState, type CSSProperties, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { COLLECTION_COLOR, type CollectionInfo } from "../../utils/labels";

/**
 * One collection drawn as a little retro bubblegum TV — the "channels" on the
 * Watched / Watching / Want to Watch / Abandoned pages.
 *
 * ANIMATIONS (styles in index.css under "TV SETS"):
 *  - the TV pops up, then its screen switches on like an old CRT (a bright line that opens up)
 *  - scanlines + a slow rolling bar on the screen, always
 *  - hover: the TV lifts, the antenna wiggles and the screen flickers with static
 *  - click: a burst of static ("changing the channel"), then the page opens
 * An empty collection shows pastel color bars and "No signal".
 */

const MotionLink = motion.create(Link);
const CHANNEL_SWITCH_MS = 380; // how long the static plays before opening the channel

interface TvSetProps {
  collection: CollectionInfo;
  channel: number;
  count: number | undefined; // undefined while loading
  to: string;
  index: number;
}

export function TvSet({ collection, channel, count, to, index }: TvSetProps) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [switching, setSwitching] = useState(false);
  const empty = count === 0;

  const handleClick = (e: MouseEvent) => {
    if (reduceMotion || e.metaKey || e.ctrlKey || e.shiftKey) return; // normal link behaviour
    e.preventDefault();
    if (switching) return;
    setSwitching(true);
    setTimeout(() => navigate(to), CHANNEL_SWITCH_MS);
  };

  return (
    <MotionLink
      to={to}
      onClick={handleClick}
      aria-label={`${collection.label}${count != null ? `, ${count} ${count === 1 ? "title" : "titles"}` : ""}`}
      className={`tv ${empty ? "tv--empty" : ""}`}
      style={{ "--tv-color": COLLECTION_COLOR[collection.value] } as CSSProperties}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 + index * 0.08 }}
      whileHover={reduceMotion ? undefined : { y: -8, rotate: index % 2 ? 1.5 : -1.5 }}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
    >
      <span className="tv__antenna" aria-hidden="true">
        <span />
        <span />
      </span>

      <span className="tv__body" aria-hidden="true">
        <span className="tv__screen">
          {/* The picture "switches on" like a CRT: a thin bright line that opens up. */}
          <motion.span
            className="tv__picture"
            initial={reduceMotion ? false : { scaleY: 0.02, scaleX: 0.4, opacity: 0.8, filter: "brightness(4)" }}
            animate={{ scaleY: 1, scaleX: 1, opacity: 1, filter: "brightness(1)" }}
            transition={{ delay: 0.45 + index * 0.08, duration: 0.5, ease: [0.2, 0.9, 0.3, 1] }}
          >
            {empty && <span className="tv__bars" />}
            <span className="tv__channel">CH {String(channel).padStart(2, "0")}</span>
            <span className="tv__name">{collection.label}</span>
            <span className="tv__count">
              {count == null ? "tuning…" : empty ? "No signal" : `${count} ${count === 1 ? "title" : "titles"}`}
            </span>
          </motion.span>
          <span className="tv__scanlines" />
          <span className="tv__roll" />
          <span className={`tv__static ${switching ? "is-on" : ""}`} />
          <span className="tv__glare" />
        </span>

        <span className="tv__controls">
          <span className="tv__knob" />
          <span className="tv__knob" />
          <span className="tv__grille" />
        </span>
      </span>

      <span className="tv__feet" aria-hidden="true">
        <span />
        <span />
      </span>
    </MotionLink>
  );
}
