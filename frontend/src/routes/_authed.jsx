import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSessionSafe } from "../queries/session";
import { AppShell } from "../features/app/AppShell";

// Pathless layout: every route inside src/routes/_authed/ requires sign-in and
// renders inside the app shell (sidebar + top bar), not the marketing site.
export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ context, location }) => {
    const session = await getSessionSafe(context.queryClient);
    if (!session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { user: session.user };
  },
  component: AppShell,
});
