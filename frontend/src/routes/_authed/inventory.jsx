import { createFileRoute } from "@tanstack/react-router";
import { guard } from "../../lib/guard";
import { ModulePage } from "../../features/app/ModulePage";

export const Route = createFileRoute("/_authed/inventory")({
  beforeLoad: guard("inventory"),
  component: InventoryPage,
});

function InventoryPage() {
  const { access } = Route.useRouteContext();
  return <ModulePage moduleKey="inventory" access={access} />;
}
