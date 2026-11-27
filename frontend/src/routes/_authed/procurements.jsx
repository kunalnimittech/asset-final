import { createFileRoute } from "@tanstack/react-router";
import { guard } from "../../lib/guard";
import { ModulePage } from "../../features/app/ModulePage";

export const Route = createFileRoute("/_authed/procurements")({
  beforeLoad: guard("procurements"),
  component: ProcurementsPage,
});

function ProcurementsPage() {
  const { access } = Route.useRouteContext();
  return <ModulePage moduleKey="procurements" access={access} />;
}
