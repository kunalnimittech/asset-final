import { createFileRoute } from "@tanstack/react-router";
import { guard } from "../../lib/guard";
import { ModulePage } from "../../features/app/ModulePage";

export const Route = createFileRoute("/_authed/work-orders")({
  beforeLoad: guard("work-orders"),
  component: WorkOrdersPage,
});

function WorkOrdersPage() {
  const { access } = Route.useRouteContext();
  return <ModulePage moduleKey="work-orders" access={access} />;
}
