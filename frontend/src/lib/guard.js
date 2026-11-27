import { redirect } from "@tanstack/react-router";
import { accessFor } from "./access";

/**
 * Route guard: use in a page's beforeLoad. Sends a user whose role has no
 * access to that module back to their dashboard.
 *
 * This only protects the screens. Each backend module route must check the
 * role too (requireRole) — hiding a page is not security.
 */
export const guard =
  (moduleKey) =>
  ({ context }) => {
    const level = accessFor(context.user?.role, moduleKey);
    if (!level) throw redirect({ to: "/dashboard", replace: true });
    return { access: level };
  };
