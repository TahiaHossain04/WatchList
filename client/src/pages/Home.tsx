import { Link } from "react-router-dom";
import { Bubble } from "../components/ui/Bubble";
import { BubbleTitle, TITLE_SIZES } from "../components/ui/BubbleTitle";
import { StatusButton } from "../components/ui/StatusButton";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { useAuth } from "../contexts/AuthContext";
import { STATUSES } from "../utils/labels";

/**
 * HOME PAGE — the big glossy title and the four creamy buttons. Nothing else, on purpose.
 *
 * NAVIGATION BUTTONS: they come from STATUSES in utils/labels.ts.
 *   - Reorder / rename / remove them there and both this page and the navbar follow.
 *   - Want a one-off button only here? Add another <StatusButton label=".." path=".." />
 *     inside the <nav> below.
 */
export default function Home() {
  const { isAdmin } = useAuth();

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 py-24">
      {/* Small, quiet corner controls so the page stays clean. */}
      <div className="absolute top-5 right-5 flex items-center gap-2">
        <Link
          to={isAdmin ? "/admin/add" : "/login"}
          className="rounded-full px-4 py-2.5 font-candy text-base tracking-wide text-ink-muted transition-colors hover:bg-panel hover:text-ink"
        >
          {isAdmin ? "+ Add entry" : "Log in"}
        </Link>
        <ThemeToggle />
      </div>

      {/* The title + bubbles share a font-size, so bubble sizes/positions in "em" scale with it. */}
      <div className={`relative ${TITLE_SIZES.hero}`}>
        {/* Decorative bubbles — positions mirror the reference design. */}
        <Bubble tone="cream" size="0.17em" style={{ left: "-3%", top: "24%" }} delay={0.1} />
        <Bubble tone="pink" size="0.44em" style={{ left: "-14%", top: "40%" }} />
        <Bubble tone="lavender" size="0.14em" style={{ left: "-7.5%", top: "80%" }} delay={0.3} />
        <Bubble tone="cream" size="0.21em" style={{ right: "-4%", top: "32%" }} delay={0.2} />
        <Bubble tone="pink" size="0.42em" style={{ right: "-14%", top: "46%" }} delay={0.15} />
        <Bubble tone="lavender" size="0.13em" style={{ right: "-8.5%", top: "80%" }} delay={0.35} />

        <BubbleTitle text={"Tahia’s\nWatch List"} size="hero" />
      </div>

      <nav
        aria-label="Watch list sections"
        className="mt-[clamp(2.5rem,6vh,4.5rem)] grid w-full max-w-md grid-cols-2 gap-3 sm:flex sm:w-auto sm:max-w-4xl sm:flex-wrap sm:justify-center sm:gap-[clamp(0.75rem,1.4vw,1.25rem)]"
      >
        {STATUSES.map((status, i) => (
          <StatusButton key={status.value} label={status.label} path={status.path} shape={i} delay={1.1 + i * 0.08} />
        ))}
      </nav>
    </main>
  );
}
