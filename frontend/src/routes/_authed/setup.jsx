import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { guard } from "../../lib/guard";
import { api } from "../../lib/api";
import { UserAvatar } from "../../components/UserAvatar";

export const Route = createFileRoute("/_authed/setup")({
  beforeLoad: guard("setup"),
  component: SetupPage,
});

const usersQuery = { queryKey: ["users"], queryFn: () => api("/users") };
const rolesQuery = { queryKey: ["roles"], queryFn: () => api("/roles"), staleTime: 5 * 60_000 };

function SetupPage() {
  const { user: me } = Route.useRouteContext();
  const users = useQuery(usersQuery);
  const roles = useQuery(rolesQuery);
  const queryClient = useQueryClient();

  const changeRole = useMutation({
    mutationFn: ({ id, role }) => api(`/users/${id}`, { method: "PATCH", body: { role } }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["users"], (list) => list?.map((u) => (u.id === updated.id ? updated : u)));
    },
  });

  const counts = (users.data ?? []).reduce((acc, u) => ({ ...acc, [u.role]: (acc[u.role] ?? 0) + 1 }), {});

  return (
    <>
      <div className="page-head">
        <h1>Setup</h1>
        <p>Users and roles. Each person has one role, and it decides what they can open.</p>
      </div>

      <section className="stats stats--roles" aria-label="People per role">
        {(roles.data ?? []).map((r) => (
          <div key={r.key} className="stat">
            <span className="stat__label">{r.name}</span>
            <div className="stat__value">{counts[r.key] ?? 0}</div>
          </div>
        ))}
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel__head">
          <h2>Users</h2>
          <p>Change a role and it applies the next time that person loads a page.</p>
        </div>
        <div className="panel__body">
          {users.isPending && <p className="muted">Loading users…</p>}
          {users.isError && <p className="form-error">{users.error.message}</p>}
          {changeRole.isError && <p className="form-error" style={{ marginBottom: 12 }}>{changeRole.error.message}</p>}
          {users.data && (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data.map((u) => {
                    const self = u.id === me.id;
                    return (
                      <tr key={u.id}>
                        <td>
                          <span className="table__who">
                            <UserAvatar user={u} size={28} />
                            {u.name}
                            {self && <span className="access-chip">You</span>}
                          </span>
                        </td>
                        <td className="muted">{u.email}</td>
                        <td>
                          <select
                            className="select"
                            value={u.role}
                            disabled={self || changeRole.isPending}
                            title={self ? "You can't change your own role" : undefined}
                            aria-label={`Role for ${u.name}`}
                            onChange={(e) => changeRole.mutate({ id: u.id, role: e.target.value })}
                          >
                            {(roles.data ?? []).map((r) => (
                              <option key={r.key} value={r.key}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
