import { createRootRouteWithContext, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client";
import { sessionQuery } from "../queries/session";
import { ThemeToggle } from "../components/ThemeToggle";

export const Route = createRootRouteWithContext()({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  const { data: session } = useQuery(sessionQuery());

  return (
    <>
      <header className="app-header">
        <Link to="/" className="brand">
          NimitTech <span>Assets</span>
        </Link>
        <nav className="app-nav">
          {session && (
            <Link to="/dashboard" activeProps={{ className: "active" }}>
              Dashboard
            </Link>
          )}
        </nav>
        <div className="app-header__end">
          <ThemeToggle />
          {session ? (
            <UserMenu user={session.user} />
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
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <span>© {new Date().getFullYear()} NimitTech</span>
        <span>Asset management</span>
      </footer>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}

function UserMenu({ user }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const signOut = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      // Drop every cached query so the next user never sees this user's data.
      queryClient.clear();
      navigate({ to: "/login", search: { redirect: "/dashboard" } });
    },
  });

  return (
    <div className="user-menu">
      <span className="user-menu__name">{user.name}</span>
      <button type="button" className="btn" onClick={() => signOut.mutate()} disabled={signOut.isPending}>
        {signOut.isPending ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}

function NotFound() {
  return (
    <div className="page">
      <section className="section hero">
        <p className="eyebrow">404</p>
        <h1 className="display display--sm">Page not found</h1>
        <div className="hero-actions">
          <Link to="/" className="btn btn--primary btn--lg">
            Go home
          </Link>
        </div>
      </section>
    </div>
  );
}
