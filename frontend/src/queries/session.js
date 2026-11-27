import { queryOptions } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client";

// The signed-in user lives in the React Query cache under ["session"].
// Value: { user, session } when signed in, null when signed out.
export const sessionQuery = () =>
  queryOptions({
    queryKey: ["session"],
    queryFn: async () => {
      const { data, error } = await authClient.getSession();
      if (error) throw new Error(authErrorMessage(error, "Could not check your session"));
      return data ?? null;
    },
    staleTime: 60_000,
    retry: false,
  });

/**
 * Read the session in a route guard. If the server can't be reached the
 * visitor is treated as signed out, so public pages (login, signup) still load
 * instead of crashing on a session error.
 */
export async function getSessionSafe(queryClient) {
  try {
    return await queryClient.ensureQueryData(sessionQuery());
  } catch {
    return null;
  }
}

/** A readable message for a better-auth error, including "server is down". */
export function authErrorMessage(error, fallback) {
  if (!error) return fallback;
  const status = error.status ?? 0;
  if (status === 0 || status >= 500) {
    return "Can't reach the server. Make sure the backend is running and try again.";
  }
  if (error.code === "INVALID_ORIGIN") {
    return "This address isn't allowed to sign in. Open the app at the URL set in CORS_ORIGIN.";
  }
  return error.message || fallback;
}
