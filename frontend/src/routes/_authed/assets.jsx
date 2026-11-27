import { createFileRoute } from "@tanstack/react-router";
import { guard } from "../../lib/guard";
import { ModulePage } from "../../features/app/ModulePage";

export const Route = createFileRoute("/_authed/assets")({
  beforeLoad: guard("assets"),
  component: AssetsPage,
});

function AssetsPage() {
  const { access } = Route.useRouteContext();
  return <ModulePage moduleKey="assets" access={access} />;
}
