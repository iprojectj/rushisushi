import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/admin-auth.server";

export const Route = createFileRoute("/admin-logout")({
  server: {
    handlers: {
      POST: async () => Response.json({ success: true }, {
        headers: { "Set-Cookie": `${ADMIN_COOKIE}=; ${adminCookieOptions}; Max-Age=0` },
      }),
    },
  },
});
