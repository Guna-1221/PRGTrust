import { createFileRoute } from "@tanstack/react-router";
import { authenticateRequest } from "@/server/auth";

export const Route = createFileRoute("/api/auth/verify")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await authenticateRequest(request);
        if (!auth.authenticated) {
          return Response.json(
            { authenticated: false, error: auth.error || "Not authenticated." },
            { status: 401 },
          );
        }

        return Response.json({
          authenticated: true,
          user: { role: "admin" },
        });
      },
    },
  },
});
