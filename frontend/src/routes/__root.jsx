import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const Route = createRootRouteWithContext()({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <>
      <header className="app-header">
        <nav>
          <Link to="/" activeProps={{ className: "active" }} activeOptions={{ exact: true }}>
            Home
          </Link>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}

function NotFound() {
  return (
    <div>
      <h1>Page not found</h1>
      <Link to="/">Go home</Link>
    </div>
  );
}
