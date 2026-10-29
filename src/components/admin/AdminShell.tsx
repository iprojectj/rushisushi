import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BarChart3, Users, LogOut, Menu, X, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { LivePresenceBadge } from "./LivePresence";
import "./admin-theme.css";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/admin/leads", label: "Leads", icon: Users },
] as const;

export function AdminShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [openMobile, setOpenMobile] = useState(false);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="admin-shell min-h-screen">
      {/* Ambient soft background (Light iFood Style) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full opacity-5 blur-[120px]"
          style={{ background: "radial-gradient(closest-side, var(--primary), transparent)" }}
        />
      </div>

      {/* Sidebar (desktop) */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-60 flex-col border-r border-[var(--border)] glass p-4 md:flex">
        <div className="mb-8 flex items-center gap-2">
          <div
            className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--primary)] shadow-sm"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">Rushi</p>
            <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
              Command Center
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] glow-primary"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2">
          <LivePresenceBadge />
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted-foreground)] transition-all hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="md:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-20 glass border-b border-[var(--border)]">
          <div className="flex items-center gap-3 px-4 py-3 md:px-8 md:py-4">
            <button
              onClick={() => setOpenMobile(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold tracking-tight md:text-2xl">
                {title}
              </h1>
              {subtitle && (
                <div className="mt-0.5 truncate text-xs text-[var(--muted-foreground)] md:text-sm">
                  {subtitle}
                </div>
              )}
            </div>
            <div className="hidden md:block">
              <LivePresenceBadge inline />
            </div>
            {actions}
          </div>
        </header>

        <main className="px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-[var(--border)] md:hidden">
        <div className="grid grid-cols-3">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
                  active ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="flex flex-col items-center gap-1 py-3 text-[11px] font-medium text-[var(--muted-foreground)]"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {openMobile && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpenMobile(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute left-0 top-0 h-full w-72 glass p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary)]"
                >
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <p className="font-bold">Rushi Admin</p>
              </div>
              <button
                onClick={() => setOpenMobile(false)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => {
                const active = pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpenMobile(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium",
                      active
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)]",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6">
              <LivePresenceBadge />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
