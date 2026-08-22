import { createFileRoute } from "@tanstack/react-router";
import { createLogoutCookie } from "@/server/auth";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async () => {
        return Response.json(
          { success: true, message: "Logged out successfully." },
          {
            headers: {
              "Set-Cookie": createLogoutCookie(),
            },
          },
        );
      },
    },
  },
});
