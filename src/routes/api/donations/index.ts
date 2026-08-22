import { createFileRoute } from "@tanstack/react-router";
import { authenticateRequest } from "@/server/auth";
import { getAllDonations, createDonation } from "@/server/db";

export const Route = createFileRoute("/api/donations/")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const donations = await getAllDonations();
          return Response.json(donations, {
            headers: {
              "Cache-Control": "public, max-age=10, s-maxage=30",
            },
          });
        } catch (err) {
          console.error("Failed to get donations:", err);
          return Response.json({ error: "Failed to retrieve donations." }, { status: 500 });
        }
      },
      POST: async ({ request }) => {
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

          if (!body || !body.title?.trim() || !body.description?.trim() || !body.image?.trim()) {
            return Response.json(
              { error: "Title, description, and image are required." },
              { status: 400 },
            );
          }

          const created = await createDonation({
            title: body.title,
            description: body.description,
            image: body.image,
            date: body.date,
          });

          return Response.json(created, { status: 201 });
        } catch (err) {
          console.error("Failed to create donation:", err);
          return Response.json({ error: "Failed to create donation." }, { status: 500 });
        }
      },
    },
  },
});
