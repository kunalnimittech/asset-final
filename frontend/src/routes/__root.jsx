import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

// The root only hosts the two layouts: _site (public pages) and _authed (the app).
export const Route = createRootRouteWithContext()({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}

function NotFound() {
  return (
    <div className="site">
      <SiteHeader />
      <main className="app-main">
        <section className="section hero">
          <p className="eyebrow">404</p>
          <h1 className="display display--sm">Page not found</h1>
          <div className="hero-actions">
            <Link to="/" className="btn btn--primary btn--lg">
              Go home
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
