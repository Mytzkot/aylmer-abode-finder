import { createFileRoute, Navigate } from "@tanstack/react-router";

// Backwards-compat: /apply/<propertyId> redirects to /apply?property=<propertyId>
export const Route = createFileRoute("/apply/$roomId")({ component: Redirector });

function Redirector() {
  const { roomId } = Route.useParams();
  return <Navigate to="/apply" search={{ property: roomId }} replace />;
}
