import { useState } from "react";
import { Link, Outlet, useRouteContext, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, Settings, UserRound, X } from "lucide-react";
import { MODULES, modulesFor, roleLabel } from "../../lib/access";
import { sessionQuery } from "../../queries/session";
import { AccountMenu } from "../../components/AccountMenu";
import { ThemeToggle } from "../../components/ThemeToggle";
import "./app-shell.css";

const ICON = { size: 16, strokeWidth: 1.75 };

const ACCOUNT_NAV = [
  { to: "/profile", label: "Profile", Icon: UserRound },
  { to: "/settings", label: "Settings", Icon: Settings },
];

const TITLES = {
  ...Object.fromEntries(MODULES.map((m) => [m.path, m.label])),
  "/profile": "Profile",
  "/settings": "Settings",
};

/** The signed-in app: a sidebar of sections, a top bar, and the page. */
export function AppShell() {
  const context = useRouteContext({ from: "/_authed" });
  // Prefer the live session so a renamed user shows up at once.
  const { data: session } = useQuery(sessionQuery());
  const user = session?.user ?? context.user;

  // The menu is built from the user's role (RBAC, see lib/access.js).
  const nav = [
    { label: roleLabel(user.role), items: modulesFor(user.role).map((m) => ({ to: m.path, label: m.label, Icon: m.Icon })) },
    { label: "Account", items: ACCOUNT_NAV },
  ];

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // The phone drawer remembers the page it was opened on, so moving to
  // another page closes it without an effect.
  const [drawerAt, setDrawerAt] = useState(null);
  const drawer = drawerAt === pathname;
  const setDrawer = (open) => setDrawerAt(open ? pathname : null);

  return (
    <div className="app" data-drawer={drawer || undefined}>
      <aside className="app-side" aria-label="Main navigation">
        <div className="app-side__top">
          <Link to="/" className="brand">
            NimitTech <span>Assets</span>
          </Link>
          <button type="button" className="btn btn--icon btn--ghost app-side__close" onClick={() => setDrawer(false)} aria-label="Close menu">
            <X {...ICON} />
          </button>
        </div>

        <nav className="app-nav-list">
          {nav.map((group) => (
            <div key={group.label} className="app-nav-group">
              <p className="app-nav-group__label">{group.label}</p>
              {group.items.map(({ to, label, Icon }) => (
                <Link key={to} to={to} className="app-nav-item" activeProps={{ "data-active": "" }}>
                  <Icon {...ICON} />
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="app-side__foot">
          <AccountMenu user={user} variant="card" />
        </div>
      </aside>

      <button type="button" className="app-scrim" aria-label="Close menu" tabIndex={-1} onClick={() => setDrawer(false)} />

      <div className="app-main-col">
        <header className="app-top">
          <button type="button" className="btn btn--icon btn--ghost app-top__menu" onClick={() => setDrawer(true)} aria-label="Open menu">
            <Menu {...ICON} />
          </button>
          <p className="app-top__title">{TITLES[pathname] ?? "NimitTech Assets"}</p>
          <div className="app-top__end">
            <ThemeToggle />
          </div>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
