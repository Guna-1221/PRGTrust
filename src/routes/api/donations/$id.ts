import { createFileRoute } from "@tanstack/react-router";
import { authenticateRequest } from "@/server/auth";
import { getDonationById, updateDonation, deleteDonation } from "@/server/db";

export const Route = createFileRoute("/api/donations/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const donation = await getDonationById(params.id);
          if (!donation) {
            return Response.json({ error: "Donation entry not found." }, { status: 404 });
          }
          return Response.json(donation);
        } catch (err) {
          console.error("Failed to get donation:", err);
          return Response.json({ error: "Failed to get donation." }, { status: 500 });
        }
      },
      PUT: async ({ params, request }) => {
        const auth = await authenticateRequest(request);
        if (!auth.authenticated) {
          return Response.json({ error: auth.error || "Unauthorized." }, { status: 401 });
        }

        try {
          const body = (await request.json().catch(() => null)) as {
            title?: string;
            description?: string;
            image?: string;
            date?: string;
          } | null;

          if (!body) {
            return Response.json({ error: "Invalid request payload." }, { status: 400 });
          }

          const updated = await updateDonation(params.id, body);
          if (!updated) {
            return Response.json({ error: "Donation entry not found." }, { status: 404 });
          }

          return Response.json(updated);
        } catch (err) {
          console.error("Failed to update donation:", err);
          return Response.json({ error: "Failed to update donation." }, { status: 500 });
        }
      },
      DELETE: async ({ params, request }) => {
        const auth = await authenticateRequest(request);
        if (!auth.authenticated) {
          return Response.json({ error: auth.error || "Unauthorized." }, { status: 401 });
        }

        try {
          const success = await deleteDonation(params.id);
          if (!success) {
            return Response.json(
              { error: "Donation entry not found or already deleted." },
              { status: 404 },
            );
          }

          return Response.json({ success: true, message: "Donation entry deleted successfully." });
        } catch (err) {
          console.error("Failed to delete donation:", err);
          return Response.json({ error: "Failed to delete donation." }, { status: 500 });
        }
      },
    },
  },
});
