import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      <h1>Asset Management</h1>
      <p>Welcome. Add pages by creating files in src/routes.</p>
    </div>
  );
}
