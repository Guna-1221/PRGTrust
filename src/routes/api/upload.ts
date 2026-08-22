import { createFileRoute } from "@tanstack/react-router";
import { authenticateRequest } from "@/server/auth";
import { uploadImageToR2 } from "@/server/storage";

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await authenticateRequest(request);
        if (!auth.authenticated) {
          return Response.json({ error: auth.error || "Unauthorized." }, { status: 401 });
        }

        try {
          const contentType = request.headers.get("content-type") || "";

          // Handle multipart/form-data
          if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const file = formData.get("file") as File | null;
            if (!file) {
              return Response.json({ error: "No file provided in form data." }, { status: 400 });
            }

            const arrayBuffer = await file.arrayBuffer();
            const result = await uploadImageToR2(arrayBuffer, file.type, file.name);
            return Response.json({ success: true, ...result });
          }

          // Handle JSON payload with base64 Data URL or bytes
          if (contentType.includes("application/json")) {
            const body = (await request.json().catch(() => null)) as {
              dataUrl?: string;
              base64?: string;
              contentType?: string;
              filename?: string;
            } | null;

            if (!body) {
              return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
            }

            let mime = body.contentType || "image/jpeg";
            let rawBase64 = body.base64 || "";

            if (body.dataUrl && body.dataUrl.startsWith("data:")) {
              const match = body.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
              if (match) {
                mime = match[1];
                rawBase64 = match[2];
              }
            }

            if (!rawBase64) {
              return Response.json({ error: "Missing image data in request." }, { status: 400 });
            }

            // Convert base64 to binary ArrayBuffer
            const binaryString = atob(rawBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            const result = await uploadImageToR2(bytes.buffer, mime, body.filename);
            return Response.json({ success: true, ...result });
          }

          // Handle raw binary image upload
          if (contentType.startsWith("image/")) {
            const arrayBuffer = await request.arrayBuffer();
            const result = await uploadImageToR2(arrayBuffer, contentType, "upload.jpg");
            return Response.json({ success: true, ...result });
          }

          return Response.json(
            {
              error:
                "Unsupported Content-Type. Please upload multipart/form-data or application/json.",
            },
            { status: 400 },
          );
        } catch (err: unknown) {
          console.error("Upload error:", err);
          const message = err instanceof Error ? err.message : "Failed to upload image.";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
