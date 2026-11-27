import { createFileRoute, redirect } from "@tanstack/react-router";

// /home is an alias: the landing page lives at /.
export const Route = createFileRoute("/home")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
