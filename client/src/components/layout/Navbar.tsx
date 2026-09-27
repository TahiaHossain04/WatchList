import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { STATUSES } from "../../utils/labels";
import { BubbleTitle } from "../ui/BubbleTitle";
import { ThemeToggle } from "../ui/ThemeToggle";

/**
 * The top bar on every page except Home.
 * NAV LINKS come from STATUSES in utils/labels.ts (same list as the home buttons).
 * Admin-only links (+ Add, Log out) appear only when logged in as the admin.
 */
export function Navbar() {
  const { isAdmin, signOut } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the page changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    showToast("Logged out. See you soon ♡");
    navigate("/");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative rounded-full px-4 py-2 font-candy text-lg tracking-wide transition-colors ${
      isActive ? "text-ink-dark" : "text-ink-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="shrink-0 rounded-2xl px-1 py-1" aria-label="Tahia’s Watch List — home">
          <BubbleTitle text="Tahia’s Watch List" size="logo" as="span" animate={false} />
        </Link>

        {/* Desktop links */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {STATUSES.map((s) => (
            <NavLink key={s.value} to={s.path} className={linkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-[1.2em_1.4em_1.3em_1.1em] bg-creme shadow-[inset_0_-3px_0_var(--color-cream-shade)]"
                      transition={{ type: "spring", stiffness: 480, damping: 34 }}
                    />
                  )}
                  <span className="relative">{s.shortLabel}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            {isAdmin ? (
              <>
                <Link
                  to="/admin/add"
                  className="rounded-full bg-gum px-4 py-2 font-candy text-lg tracking-wide text-ink-dark shadow-[inset_0_-3px_0_var(--color-pink-deep)] transition-colors hover:bg-gum-light"
                >
                  + Add entry
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full px-3 py-2 font-candy text-lg tracking-wide text-ink-muted hover:text-ink"
                >
                  Log out
                </button>
              </>
            ) : (
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
            )}
          </div>
          <ThemeToggle />
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full bg-panel text-ink ring-1 ring-line lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Main"
            className="overflow-hidden border-t border-line lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <ul className="flex flex-col gap-1 px-4 py-4">
              {STATUSES.map((s, i) => (
                <motion.li key={s.value} initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <NavLink
                    to={s.path}
                    className={({ isActive }) =>
                      `block rounded-2xl px-4 py-3 font-candy text-xl tracking-wide ${
                        isActive ? "bg-creme text-ink-dark" : "text-ink hover:bg-panel"
                      }`
                    }
                  >
                    {s.label}
                  </NavLink>
                </motion.li>
              ))}
              <li className="mt-2 border-t border-line pt-3">
                {isAdmin ? (
                  <div className="flex flex-wrap gap-2">
                    <Link to="/admin/add" className="rounded-2xl bg-gum px-4 py-3 font-candy text-xl tracking-wide text-ink-dark">
                      + Add entry
                    </Link>
                    <button type="button" onClick={handleLogout} className="rounded-2xl px-4 py-3 font-candy text-xl tracking-wide text-ink-muted">
                      Log out
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="block rounded-2xl px-4 py-3 font-candy text-xl tracking-wide text-ink-muted hover:bg-panel">
                    Log in
                  </Link>
                )}
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
