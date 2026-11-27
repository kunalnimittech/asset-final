import { createFileRoute } from "@tanstack/react-router";
import { guard } from "../../lib/guard";
import { ModulePage } from "../../features/app/ModulePage";

export const Route = createFileRoute("/_authed/maintenance")({
  beforeLoad: guard("maintenance"),
  component: MaintenancePage,
});

function MaintenancePage() {
  const { access } = Route.useRouteContext();
  return <ModulePage moduleKey="maintenance" access={access} />;
}
