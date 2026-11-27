import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { sessionQuery } from "../queries/session";
import { ThemeToggle } from "./ThemeToggle";
import { AccountMenu } from "./AccountMenu";

/** The public site's header: brand on the left, account actions on the right. */
export function SiteHeader() {
  const { data: session } = useQuery(sessionQuery());

  return (
    <header className="app-header">
      <Link to="/" className="brand">
        NimitTech <span>Assets</span>
      </Link>
      <div className="app-header__end">
        <ThemeToggle />
        {session ? (
          <>
            <Link to="/dashboard" className="btn btn--ghost">
              Dashboard
            </Link>
            <AccountMenu user={session.user} showDashboard />
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn--ghost">
              Sign in
            </Link>
            <Link to="/signup" className="btn btn--primary">
              Get started
            </Link>
          </>
        )}
      </div>
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
