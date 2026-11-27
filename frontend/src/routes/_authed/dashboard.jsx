import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, History, Package, UserCheck, Wrench } from "lucide-react";
import { UserAvatar } from "../../components/UserAvatar";
import { sessionQuery } from "../../queries/session";
import { guard } from "../../lib/guard";
import { roleLabel } from "../../lib/access";

export const Route = createFileRoute("/_authed/dashboard")({
  beforeLoad: guard("dashboard"),
  component: DashboardPage,
});

const ICON = { size: 16, strokeWidth: 1.75 };

// Asset data isn't wired up yet, so the figures show a dash, not a made-up number.
const STATS = [
  { label: "Total assets", Icon: Package },
  { label: "Assigned to you", Icon: UserCheck },
  { label: "In repair", Icon: Wrench },
  { label: "Due for service", Icon: CalendarClock },
];

function DashboardPage() {
  const { user: contextUser } = Route.useRouteContext();
  const { data: session } = useQuery(sessionQuery());
  const user = session?.user ?? contextUser;
  const first = (user.name || "").split(" ")[0] || "there";

  return (
    <>
      <div className="page-head">
        <h1>Welcome back, {first}</h1>
        <p>Here's what's happening with NimitTech's assets.</p>
      </div>

      <section className="stats" aria-label="Summary">
        {STATS.map(({ label, Icon }) => (
          <div key={label} className="stat">
            <span className="stat__label">
              <Icon {...ICON} />
              {label}
            </span>
            <div className="stat__value">—</div>
            <div className="stat__hint">No data yet</div>
          </div>
        ))}
      </section>

      <div className="split">
        <section className="panel">
          <div className="panel__head">
            <h2>Recent activity</h2>
            <p>Purchases, handovers and repairs, newest first.</p>
          </div>
          <div className="empty">
            <span className="empty__icon">
              <History size={20} strokeWidth={1.75} />
            </span>
            <strong>No activity yet</strong>
            <span>When assets are added or change hands, they'll show up here.</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>Your account</h2>
          </div>
          <div className="panel__body">
            <div className="me">
              <UserAvatar user={user} size={44} />
              <div className="me__who">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
            </div>
            <p style={{ marginTop: 14, fontSize: 14 }}>
              Role <span className="role-chip">{roleLabel(user.role)}</span>
            </p>
            <div className="me__links">
              <Link to="/profile" className="btn">
                Edit profile
              </Link>
              <Link to="/settings" className="btn">
                Settings
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
