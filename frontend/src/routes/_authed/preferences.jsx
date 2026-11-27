import { createFileRoute } from "@tanstack/react-router";
import { guard } from "../../lib/guard";
import { ModulePage } from "../../features/app/ModulePage";

export const Route = createFileRoute("/_authed/preferences")({
  beforeLoad: guard("preferences"),
  component: PreferencesPage,
});

function PreferencesPage() {
  const { access } = Route.useRouteContext();
  return <ModulePage moduleKey="preferences" access={access} />;
}
