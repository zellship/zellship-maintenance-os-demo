import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/ove/AppShell";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <AppShell />;
}
