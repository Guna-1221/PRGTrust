import { createFileRoute } from "@tanstack/react-router";
import { verifyPasscode, createAdminToken, createAuthCookie } from "@/server/auth";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as { passcode?: string };
          const passcode = body.passcode || "";

          const isValid = await verifyPasscode(passcode);
          if (!isValid) {
            return Response.json({ error: "Incorrect passcode. Access denied." }, { status: 401 });
          }

          const token = await createAdminToken();
          const cookieHeader = createAuthCookie(token);

          return Response.json(
            {
              success: true,
              token,
              user: { role: "admin" },
              message: "Authenticated successfully.",
            },
            {
              headers: {
                "Set-Cookie": cookieHeader,
              },
            },
          );
        } catch (err) {
          console.error("Login error:", err);
          return Response.json({ error: "Internal server error." }, { status: 500 });
        }
      },
    },
  },
});
