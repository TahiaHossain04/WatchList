import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "framer-motion";
import { useContext, useRef } from "react";
import { UNSAFE_LocationContext as LocationContext, useLocation, useOutlet } from "react-router-dom";
import { AmbientBubbles } from "./AmbientBubbles";
import { HelpButton } from "./HelpButton";
import { Navbar } from "./Navbar";

/**
 * The frame around every page except Home: navbar on top, the page below.
 *
 * PAGE TRANSITIONS: when the URL path changes, the old page fades/slides out and the
 * new one slides in (AnimatePresence below). Change `PAGE_MOTION` to tweak the feel.
 * Filter changes (?type=…) don't count as a new page, so they don't trigger it.
 */
const PAGE_MOTION = {
  initial: { opacity: 0, y: 18, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18, ease: "easeIn" } },
} as const;

export function Layout() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex min-h-svh flex-col overflow-x-clip">
      <AmbientBubbles />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-creme focus:px-4 focus:py-2 focus:text-ink-dark"
      >
        Skip to content
      </a>
      <Navbar />
      {/* Scroll to the top once the old page has finished leaving. */}
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
        <motion.main
          id="main"
          key={location.pathname}
          className="relative mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-20 sm:px-6"
          {...(reduceMotion ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : PAGE_MOTION)}
        >
          <FrozenOutlet />
        </motion.main>
      </AnimatePresence>
      {/* Required by TMDB's API terms. */}
      <footer className="relative px-4 pb-6 text-center text-xs text-ink-muted">
        Posters and details from{" "}
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="underline hover:text-ink">
          TMDB
        </a>
        . This product uses the TMDB API but is not endorsed or certified by TMDB.
      </footer>
      <HelpButton />
    </div>
  );
}

/**
 * Shows the current page normally, but while a page is animating OUT it keeps
 * rendering it exactly as it was — same element, same URL — so it doesn't flash
 * the next page or re-run redirects with the new URL.
 */
function FrozenOutlet() {
  const isPresent = useIsPresent();
  const outlet = useOutlet();
  const location = useContext(LocationContext);
  const snapshot = useRef({ outlet, location });
  if (isPresent) snapshot.current = { outlet, location };

  return <LocationContext.Provider value={snapshot.current.location}>{snapshot.current.outlet}</LocationContext.Provider>;
}
