import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { verifyAdminCookie } from "@/lib/admin-auth.server";

export const requireAdmin = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();
  if (!request || !verifyAdminCookie(request)) {
    throw new Error("Acesso administrativo necessário.");
  }
  return next({ context: { admin: true as const } });
});

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  return Boolean(request && verifyAdminCookie(request));
});
