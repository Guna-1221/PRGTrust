import { createFileRoute } from "@tanstack/react-router";
import { getImageFromR2 } from "@/server/storage";

export const Route = createFileRoute("/api/images/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        try {
          const rawKey = params._splat;
          if (!rawKey) {
            return new Response("Image key required.", { status: 400 });
          }

          const key = decodeURIComponent(rawKey);
          const image = await getImageFromR2(key);

          if (!image) {
            return new Response("Image not found.", { status: 404 });
          }

          // Check if-none-match for 304 Not Modified
          const ifNoneMatch = request.headers.get("If-None-Match");
          if (image.etag && ifNoneMatch === image.etag) {
            return new Response(null, { status: 304 });
          }

          const headers = new Headers();
          headers.set("Content-Type", image.contentType || "image/jpeg");
          headers.set("Cache-Control", "public, max-age=31536000, immutable");
          if (image.etag) headers.set("ETag", image.etag);
          if (image.size) headers.set("Content-Length", String(image.size));

          return new Response(image.body as BodyInit, {
            status: 200,
            headers,
          });
        } catch (err) {
          console.error("Failed to serve image:", err);
          return new Response("Failed to serve image.", { status: 500 });
        }
      },
    },
  },
});
