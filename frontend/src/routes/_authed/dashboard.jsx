import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  return (
    <div className="page">
      <section className="section section--intro">
        <p className="eyebrow">Dashboard</p>
        <h1 className="display display--sm">Welcome, {user.name}.</h1>
        <p className="lede">
          You're signed in as <span className="role-chip">{user.role}</span>
        </p>
      </section>
      <section className="tiles">
        {[
          ["Assets", "Your register will appear here."],
          ["Assigned to you", "Items checked out in your name."],
          ["Upcoming service", "Warranties and maintenance due soon."],
        ].map(([title, body]) => (
          <div key={title} className="tile">
            <h2>{title}</h2>
            <p>{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
