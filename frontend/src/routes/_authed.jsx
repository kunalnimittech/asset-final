import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSessionSafe } from "../queries/session";

// Pathless layout: every route inside src/routes/_authed/ requires sign-in.
export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ context, location }) => {
    const session = await getSessionSafe(context.queryClient);
    if (!session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { user: session.user };
  },
  component: Outlet,
});
