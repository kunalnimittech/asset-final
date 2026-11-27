import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authClient } from "./auth-client";
import { sessionQuery } from "../queries/session";

/**
 * Sign out and forget the user everywhere in the UI.
 *
 * The session is set to null (not just removed from the cache): a mounted
 * useQuery keeps showing its last result after queryClient.clear(), which is
 * why the header used to keep showing the old name after signing out.
 */
export function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message || "Could not sign out");
    },
    onSuccess: async () => {
      queryClient.setQueryData(sessionQuery().queryKey, null);
      // Drop every other cached query so the next user never sees this user's data.
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== "session" });
      await navigate({ to: "/login", search: { redirect: "/dashboard" }, replace: true });
    },
  });
}
