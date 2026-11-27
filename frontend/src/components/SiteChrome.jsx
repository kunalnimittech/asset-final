import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { sessionQuery } from "../queries/session";
import { ThemeToggle } from "./ThemeToggle";
import { AccountMenu } from "./AccountMenu";

/**
 * The public site's header: brand on the left, account actions on the right.
 * On phones, Sign in and Get started fold into a menu button.
 */
export function SiteHeader() {
  const { data: session } = useQuery(sessionQuery());
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Open only on the page where it was opened, so navigating closes it.
  const [openAt, setOpenAt] = useState(null);
  const open = openAt === pathname;
  const headerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpenAt(null);
    const onKey = (e) => e.key === "Escape" && close();
    const onDown = (e) => !headerRef.current?.contains(e.target) && close();
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <header className="app-header" ref={headerRef}>
      <Link to="/" className="brand">
        NimitTech <span>Assets</span>
      </Link>
      <div className="app-header__end">
        <ThemeToggle />
        {session ? (
          <>
            <Link to="/dashboard" className="btn btn--ghost app-header__wide">
              Dashboard
            </Link>
            <AccountMenu user={session.user} showDashboard />
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn--ghost app-header__wide">
              Sign in
            </Link>
            <Link to="/signup" className="btn btn--primary app-header__wide">
              Get started
            </Link>
            <button
              type="button"
              className="btn btn--ghost btn--icon app-header__burger"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpenAt(open ? null : pathname)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </>
        )}
      </div>

      {!session && (
        <nav id="site-menu" className="site-menu" data-open={open || undefined} aria-hidden={!open}>
          <Link to="/login" className="btn btn--lg btn--block" tabIndex={open ? 0 : -1}>
            Sign in
          </Link>
          <Link to="/signup" className="btn btn--primary btn--lg btn--block" tabIndex={open ? 0 : -1}>
            Get started
          </Link>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="app-footer">
      <span>© {new Date().getFullYear()} NimitTech</span>
      <span>Asset management</span>
    </footer>
  );
}
