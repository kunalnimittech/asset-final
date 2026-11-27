import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserAvatar } from "../../components/UserAvatar";
import { authClient } from "../../lib/auth-client";
import { authErrorMessage, sessionQuery } from "../../queries/session";
import { roleLabel } from "../../lib/access";

export const Route = createFileRoute("/_authed/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user: contextUser } = Route.useRouteContext();
  const { data: session } = useQuery(sessionQuery());
  const user = session?.user ?? contextUser;

  const queryClient = useQueryClient();
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.updateUser({ name: name.trim() });
      if (error) throw new Error(authErrorMessage(error, "Could not save your profile"));
    },
    onSuccess: async () => {
      await queryClient.fetchQuery({ ...sessionQuery(), staleTime: 0 });
      router.invalidate(); // refresh the route context's user too
    },
  });

  const dirty = name.trim() !== (user.name ?? "") && name.trim().length > 0;
  const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : null;

  return (
    <>
      <div className="page-head">
        <h1>Profile</h1>
        <p>How you appear across NimitTech Assets.</p>
      </div>

      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          if (dirty) save.mutate();
        }}
      >
        <div className="panel__body">
          <div className="me" style={{ marginBottom: 24 }}>
            <UserAvatar user={user} size={56} />
            <div className="me__who">
              <strong>{user.name}</strong>
              <span>{joined ? `Member since ${joined}` : user.email}</span>
            </div>
          </div>

          <div className="form form--narrow">
            <label className="form-field">
              <span>Full name</span>
              <input
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  save.reset();
                }}
              />
            </label>
            <div className="form-field">
              <span>Email</span>
              <div className="field-static">{user.email}</div>
            </div>
            <div className="form-field">
              <span>Role</span>
              <div className="field-static">
                <span className="role-chip">{roleLabel(user.role)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="panel__foot">
          {save.isError && <span className="note" style={{ color: "var(--danger)" }}>{save.error.message}</span>}
          {save.isSuccess && <span className="note note--ok">Saved.</span>}
          <button type="submit" className="btn btn--primary" disabled={!dirty || save.isPending}>
            {save.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </>
  );
}
