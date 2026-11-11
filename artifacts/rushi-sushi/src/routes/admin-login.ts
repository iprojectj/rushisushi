import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_COOKIE, adminCookieOptions, adminSessionMaxAge, makeAdminCookie, passwordMatches } from "@/lib/admin-auth.server";

const attempts = new Map<string, { count: number; resetAt: number }>();

export const Route = createFileRoute("/admin-login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
        const now = Date.now();
        const prior = attempts.get(ip);
        if (prior && prior.resetAt > now && prior.count >= 8) {
          return Response.json({ success: false, message: "Muitas tentativas. Aguarde 15 minutos." }, { status: 429 });
        }
        const payload = await request.json().catch(() => ({})) as { username?: unknown; password?: unknown };
        const validUser = typeof payload.username === "string" && payload.username.trim().toLowerCase() === "admin";
        if (!validUser || !passwordMatches(payload.password)) {
          attempts.set(ip, prior && prior.resetAt > now
            ? { count: prior.count + 1, resetAt: prior.resetAt }
            : { count: 1, resetAt: now + 15 * 60_000 });
          return Response.json({ success: false, message: "Usuário ou senha inválidos." }, { status: 401 });
        }
        attempts.delete(ip);
        return Response.json({ success: true }, {
          headers: { "Set-Cookie": `${ADMIN_COOKIE}=${makeAdminCookie()}; ${adminCookieOptions}; Max-Age=${adminSessionMaxAge}` },
        });
      },
    },
  },
});
