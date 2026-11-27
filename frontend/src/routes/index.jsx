import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { sessionQuery } from "../queries/session";
import { FeatureGrid } from "../features/bento/FeatureGrid";

// Public landing page. Signed-in users get a shortcut to the dashboard.
export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data: session } = useQuery(sessionQuery());

  return (
    <div className="page">
      <section className="section hero">
        <p className="eyebrow">NimitTech Assets</p>
        <h1 className="display">
          Know where every
          <br />
          asset is.
        </h1>
        <p className="lede">
          Track laptops, licences and equipment from purchase to retirement — who has it, where it is, and when it's due
          for service.
        </p>
        <div className="hero-actions">
          {session ? (
            <Link to="/dashboard" className="btn btn--primary btn--lg">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn btn--primary btn--lg">
                Get started
              </Link>
              <Link to="/login" className="btn btn--lg">
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="band" aria-hidden />

      <section className="section-head">
        <p className="eyebrow">Features</p>
        <h2 className="title">Built for the people who keep track.</h2>
      </section>

      <FeatureGrid />

      <div className="band" aria-hidden />

      <section className="section cta">
        <h2 className="title">Ready to retire the spreadsheet?</h2>
        <div className="hero-actions">
          <Link to={session ? "/dashboard" : "/signup"} className="btn btn--primary btn--lg">
            {session ? "Open dashboard" : "Create your account"}
          </Link>
        </div>
      </section>
    </div>
  );
}
