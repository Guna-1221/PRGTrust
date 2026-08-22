import { createFileRoute } from "@tanstack/react-router";
import { authenticateRequest } from "@/server/auth";
import { getEventById, updateEvent, deleteEvent } from "@/server/db";

export const Route = createFileRoute("/api/events/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const event = await getEventById(params.id);
          if (!event) {
            return Response.json({ error: "Event not found." }, { status: 404 });
          }
          return Response.json(event);
        } catch (err) {
          console.error("Failed to get event:", err);
          return Response.json({ error: "Failed to get event." }, { status: 500 });
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
            location?: string;
            eventDate?: string;
          } | null;

          if (!body) {
            return Response.json({ error: "Invalid request payload." }, { status: 400 });
          }

          const updated = await updateEvent(params.id, body);
          if (!updated) {
            return Response.json({ error: "Event not found." }, { status: 404 });
          }

          return Response.json(updated);
        } catch (err) {
          console.error("Failed to update event:", err);
          return Response.json({ error: "Failed to update event." }, { status: 500 });
        }
      },
      DELETE: async ({ params, request }) => {
        const auth = await authenticateRequest(request);
        if (!auth.authenticated) {
          return Response.json({ error: auth.error || "Unauthorized." }, { status: 401 });
        }

        try {
          const success = await deleteEvent(params.id);
          if (!success) {
            return Response.json({ error: "Event not found or already deleted." }, { status: 404 });
          }

          return Response.json({ success: true, message: "Event deleted successfully." });
        } catch (err) {
          console.error("Failed to delete event:", err);
          return Response.json({ error: "Failed to delete event." }, { status: 500 });
        }
      },
    },
  },
});
