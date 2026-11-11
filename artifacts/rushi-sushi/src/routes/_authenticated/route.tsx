import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAdminSession } from "@/lib/admin-auth.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (!await getAdminSession()) throw redirect({ to: "/auth" });
    return { user: { id: "admin", email: "admin" } };
  },
  component: () => <Outlet />,
});
