import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, DollarSign, Receipt, ShoppingBag, Target } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { TrafficMetrics } from "@/components/admin/TrafficMetrics";
import { cn } from "@/lib/utils";
import {
  type CheckoutRow,
  customerName,
  fmtBRL,
  fmtPct,
  gatewayLabel,
  isPaid,
  orderProducts,
  orderValue,
} from "@/lib/admin-orders";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({ meta: [{ title: "Visão geral — Rushi Admin" }, { name: "robots", content: "noindex" }] }),
  component: DashboardPage,
});

type Preset = "today" | "yesterday" | "7d" | "30d";
const PRESETS: { key: Preset; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "yesterday", label: "Ontem" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
];

function rangeFor(p: Preset): { start: Date; end: Date } {
  const s = new Date();
  s.setHours(0, 0, 0, 0);
  const e = new Date();
  e.setHours(23, 59, 59, 999);
  if (p === "yesterday") {
    s.setDate(s.getDate() - 1);
    e.setDate(e.getDate() - 1);
  } else if (p === "7d") s.setDate(s.getDate() - 6);
  else if (p === "30d") s.setDate(s.getDate() - 29);
  return { start: s, end: e };
}

interface KpiProps {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "success" | "warning" | "info";
}
const TONE: Record<KpiProps["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/10 text-info",
};
function Kpi({ label, value, hint, icon: Icon, tone }: KpiProps) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <span className={cn("rounded-lg p-2", TONE[tone])}><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-2 truncate text-2xl font-bold tabular-nums md:text-3xl">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function DashboardPage() {
  const [preset, setPreset] = useState<Preset>("today");
  const range = useMemo(() => rangeFor(preset), [preset]);
  const [rows, setRows] = useState<CheckoutRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data, error } = await supabase
        .from("lead_submissions")
        .select("id, lead_id, order_id, created_at, nome, fields")
        .eq("form_type", "checkout")
        .gte("created_at", range.start.toISOString())
        .lte("created_at", range.end.toISOString())
        .order("created_at", { ascending: false })
        .limit(5000);
      if (!alive) return;
      if (error) toast.error("Erro ao carregar pedidos", { description: error.message });
      else setRows((data ?? []) as CheckoutRow[]);
      setLoading(false);
    };
    setLoading(true);
    load();
    const t = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [range.start, range.end]);

  const m = useMemo(() => {
    const paid = rows.filter(isPaid);
    const revenue = paid.reduce((a, r) => a + orderValue(r), 0);
    const pendingValue = rows.filter((r) => !isPaid(r)).reduce((a, r) => a + orderValue(r), 0);
    const products = new Map<string, { qty: number; paidQty: number }>();
    for (const r of rows)
      for (const p of orderProducts(r)) {
        const cur = products.get(p.name) ?? { qty: 0, paidQty: 0 };
        cur.qty += Number(p.quantity) || 1;
        if (isPaid(r)) cur.paidQty += Number(p.quantity) || 1;
        products.set(p.name, cur);
      }
    return {
      orders: rows.length,
      paid: paid.length,
      revenue,
      pendingValue,
      ticket: paid.length ? revenue / paid.length : 0,
      conv: rows.length ? (paid.length / rows.length) * 100 : 0,
      topProducts: [...products.entries()].sort((a, b) => b[1].qty - a[1].qty).slice(0, 6),
    };
  }, [rows]);

  const filters = (
    <div className="flex rounded-xl border bg-card p-1" role="tablist" aria-label="Período">
      {PRESETS.map((p) => (
        <button
          key={p.key}
          role="tab"
          aria-selected={preset === p.key}
          onClick={() => setPreset(p.key)}
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors md:px-3",
            preset === p.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );

  return (
    <AdminShell title="Visão geral" subtitle="Vendas e tráfego do período" actions={filters}>
      <div className="mx-auto max-w-7xl space-y-8">
        <section aria-labelledby="vendas">
          <h2 id="vendas" className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Vendas</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Kpi label="Faturamento" value={loading ? "…" : fmtBRL(m.revenue)} hint="Pedidos pagos" icon={DollarSign} tone="success" />
            <Kpi label="Pedidos pagos" value={loading ? "…" : String(m.paid)} icon={CheckCircle2} tone="success" />
            <Kpi label="PIX gerados" value={loading ? "…" : String(m.orders)} icon={ShoppingBag} tone="primary" />
            <Kpi label="Conversão" value={loading ? "…" : fmtPct(m.conv)} hint="PIX gerado → pago" icon={Target} tone="info" />
            <Kpi label="Ticket médio" value={loading ? "…" : fmtBRL(m.ticket)} icon={Receipt} tone="info" />
            <Kpi label="Não pagos" value={loading ? "…" : fmtBRL(m.pendingValue)} hint="Valor em PIX pendentes" icon={Clock} tone="warning" />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Últimos pedidos</h2>
              <Link to="/admin/leads" className="text-xs font-medium text-primary hover:underline">Ver clientes</Link>
            </div>
            {rows.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{loading ? "Carregando..." : "Nenhum pedido no período."}</p>
            ) : (
              <ul className="divide-y">
                {rows.slice(0, 12).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{customerName(r)}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        {" · "}
                        {orderProducts(r).map((p) => p.name).join(", ") || "—"}
                        {" · "}
                        {gatewayLabel(r.fields?.gateway)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums">{fmtBRL(orderValue(r))}</p>
                      <span className={cn("text-[11px] font-medium", isPaid(r) ? "text-success" : "text-warning")}>
                        {isPaid(r) ? "Pago" : "Aguardando"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Produtos mais pedidos</h2>
            {m.topProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sem dados no período.</p>
            ) : (
              <ul className="space-y-3">
                {m.topProducts.map(([name, v]) => (
                  <li key={name}>
                    <div className="flex justify-between text-sm">
                      <span className="truncate pr-2">{name}</span>
                      <span className="tabular-nums text-muted-foreground">{v.qty} · {v.paidQty} pagos</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted">
                      <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(v.qty / m.topProducts[0][1].qty) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section aria-labelledby="trafego">
          <h2 id="trafego" className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tráfego e funil</h2>
          <TrafficMetrics start={range.start} end={range.end} />
        </section>
      </div>
    </AdminShell>
  );
}
