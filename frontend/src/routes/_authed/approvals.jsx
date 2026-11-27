import { createFileRoute } from "@tanstack/react-router";
import { guard } from "../../lib/guard";
import { ModulePage } from "../../features/app/ModulePage";

export const Route = createFileRoute("/_authed/approvals")({
  beforeLoad: guard("approvals"),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const { access } = Route.useRouteContext();
  return <ModulePage moduleKey="approvals" access={access} />;
}
