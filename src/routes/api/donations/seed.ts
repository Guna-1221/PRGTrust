import { createFileRoute } from "@tanstack/react-router";
import { authenticateRequest } from "@/server/auth";
import { resetDonationsToSeed } from "@/server/db";

export const Route = createFileRoute("/api/donations/seed")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await authenticateRequest(request);
        if (!auth.authenticated) {
          return Response.json({ error: auth.error || "Unauthorized." }, { status: 401 });
        }

        try {
          const seeds = await resetDonationsToSeed();
          return Response.json({
            success: true,
            items: seeds,
            message: "Reset to default seed entries.",
          });
        } catch (err) {
          console.error("Failed to reset donations:", err);
          return Response.json({ error: "Failed to reset donation entries." }, { status: 500 });
        }
      },
    },
  },
});
