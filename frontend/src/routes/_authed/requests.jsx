import { createFileRoute } from "@tanstack/react-router";
import { guard } from "../../lib/guard";
import { ModulePage } from "../../features/app/ModulePage";

export const Route = createFileRoute("/_authed/requests")({
  beforeLoad: guard("requests"),
  component: RequestsPage,
});

function RequestsPage() {
  const { access } = Route.useRouteContext();
  return <ModulePage moduleKey="requests" access={access} />;
}
