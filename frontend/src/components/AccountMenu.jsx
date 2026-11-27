import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronsUpDown, LayoutDashboard, LogOut, Settings, UserRound } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { useSignOut } from "../lib/use-sign-out";
import "./account-menu.css";

const ICON = { size: 16, strokeWidth: 1.75 };

/**
 * The signed-in user's menu: who you are, where to go, and Sign out.
 * `variant="avatar"` is a round trigger for a header; `variant="card"` is the
 * full-width name-and-email trigger at the foot of the app sidebar.
 */
export function AccountMenu({ user, variant = "avatar", showDashboard = false }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const signOut = useSignOut();

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="acct" data-variant={variant} ref={root}>
      <button
        type="button"
        className="acct__trigger"
        data-open={open || undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((o) => !o)}
      >
        <UserAvatar user={user} size={variant === "card" ? 32 : 30} />
        {variant === "card" && (
          <>
            <span className="acct__who">
              <span className="acct__name">{user.name}</span>
              <span className="acct__email">{user.email}</span>
            </span>
            <ChevronsUpDown {...ICON} className="acct__chev" />
          </>
        )}
      </button>

      {open && (
        <div className="acct__menu" role="menu">
          <div className="acct__head">
            <span className="acct__name">{user.name}</span>
            <span className="acct__email">{user.email}</span>
          </div>
          <div className="acct__sep" />
          {showDashboard && (
            <Link to="/dashboard" className="acct__item" role="menuitem" onClick={close}>
              <LayoutDashboard {...ICON} />
              Dashboard
            </Link>
          )}
          <Link to="/profile" className="acct__item" role="menuitem" onClick={close}>
            <UserRound {...ICON} />
            Profile
          </Link>
          <Link to="/settings" className="acct__item" role="menuitem" onClick={close}>
            <Settings {...ICON} />
            Settings
          </Link>
          <div className="acct__sep" />
          <button
            type="button"
            className="acct__item acct__item--danger"
            role="menuitem"
            onClick={() => signOut.mutate()}
            disabled={signOut.isPending}
          >
            <LogOut {...ICON} />
            {signOut.isPending ? "Signing out…" : "Sign out"}
          </button>
          {signOut.isError && <p className="acct__error">{signOut.error.message}</p>}
        </div>
      )}
    </div>
  );
}
