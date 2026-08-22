import { createFileRoute } from "@tanstack/react-router";
import { authenticateRequest } from "@/server/auth";
import { getAllEvents, createEvent } from "@/server/db";

export const Route = createFileRoute("/api/events/")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const events = await getAllEvents();
          return Response.json(events, {
            headers: {
              "Cache-Control": "public, max-age=10, s-maxage=30",
            },
          });
        } catch (err) {
          console.error("Failed to get events:", err);
          return Response.json({ error: "Failed to retrieve events." }, { status: 500 });
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
            location?: string;
            eventDate?: string;
          } | null;

          if (
            !body ||
            !body.title?.trim() ||
            !body.description?.trim() ||
            !body.eventDate?.trim()
          ) {
            return Response.json(
              { error: "Title, description, and event date are required." },
              { status: 400 },
            );
          }

          const created = await createEvent({
            title: body.title,
            description: body.description,
            image: body.image,
            location: body.location,
            eventDate: body.eventDate,
          });

          return Response.json(created, { status: 201 });
        } catch (err) {
          console.error("Failed to create event:", err);
          return Response.json({ error: "Failed to create event." }, { status: 500 });
        }
      },
    },
  },
});
