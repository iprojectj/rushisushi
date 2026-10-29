import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarIcon,
  CheckCircle2,
  CreditCard,
  DollarSign,
  LogOut,
  Radio,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { LivePresenceBadge } from "@/components/admin/LivePresence";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  component: DashboardPage,
});

type Submission = {
  id: string;
  form_type: string;
  order_id: string | null;
  created_at: string;
  fields: Record<string, unknown>;
  nome: string | null;
};

type Range = { start: Date; end: Date; label: string };

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtPct(n: number) {
  return `${n.toFixed(1).replace(".", ",")}%`;
}

const COLORS = [
  "var(--primary)",
  "var(--success)",
  "hsl(38 92% 55%)",
  "hsl(292 84% 61%)",
  "hsl(0 84% 60%)",
  "hsl(190 90% 50%)",
];

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  trend,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  trend?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
      <div
        className={cn(
          "absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20 blur-2xl",
          accent,
        )}
      />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight tabular-nums">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-muted-foreground truncate">{hint}</p>
          )}
          {trend && (
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={cn("rounded-xl p-3 shrink-0", accent)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [rangePreset, setRangePreset] = useState<"today" | "yesterday" | "7d" | "30d" | "custom">(
    "today",
  );
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState<Submission[]>([]);
  const [pulse, setPulse] = useState(false);

  const range: Range = useMemo(() => {
    if (rangePreset === "today")
      return { start: startOfDay(new Date()), end: endOfDay(new Date()), label: "Hoje" };
    if (rangePreset === "yesterday") {
      const y = addDays(new Date(), -1);
      return { start: startOfDay(y), end: endOfDay(y), label: "Ontem" };
    }
    if (rangePreset === "7d")
      return {
        start: startOfDay(addDays(new Date(), -6)),
        end: endOfDay(new Date()),
        label: "Últimos 7 dias",
      };
    if (rangePreset === "30d")
      return {
        start: startOfDay(addDays(new Date(), -29)),
        end: endOfDay(new Date()),
        label: "Últimos 30 dias",
      };
    return {
      start: startOfDay(date),
      end: endOfDay(date),
      label: format(date, "dd 'de' MMMM", { locale: ptBR }),
    };
  }, [rangePreset, date]);

  // Fetch dataset for the range
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("lead_submissions")
        .select("id, form_type, order_id, created_at, fields, nome")
        .gte("created_at", range.start.toISOString())
        .lte("created_at", range.end.toISOString())
        .order("created_at", { ascending: false })
        .limit(10000);
      if (cancelled) return;
      if (error) toast.error("Erro ao carregar dashboard", { description: error.message });
      setSubs((data ?? []) as Submission[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [range.start, range.end]);

  // Realtime — new inserts, filter by current range
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lead_submissions" },
        (payload) => {
          const s = payload.new as Submission;
          const t = new Date(s.created_at).getTime();
          if (t >= range.start.getTime() && t <= range.end.getTime()) {
            setSubs((prev) => [s, ...prev]);
          }
          setLive((prev) => [s, ...prev].slice(0, 25));
          setPulse(true);
          setTimeout(() => setPulse(false), 1200);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [range.start, range.end]);

  const metrics = useMemo(() => {
    let checkouts = 0;
    let cardAttempts = 0;
    let pixPaid = 0;
    let revenue = 0;
    const paidOrders = new Set<string>();
    const checkoutLeads = new Set<string>();
    const cardLeads = new Set<string>();

    for (const s of subs) {
      const lid = (s as Submission & { lead_id?: string }).lead_id;
      if (s.form_type === "checkout") {
        checkouts++;
        if (lid) checkoutLeads.add(lid);
      } else if (s.form_type === "credit_card_attempt") {
        cardAttempts++;
        if (lid) cardLeads.add(lid);
      } else if (s.form_type === "pix_paid") {
        pixPaid++;
        if (s.order_id && !paidOrders.has(s.order_id)) {
          paidOrders.add(s.order_id);
          // Find matching checkout to compute revenue
          const checkout = subs.find(
            (x) => x.form_type === "checkout" && x.order_id === s.order_id,
          );
          const v = Number(
            (checkout?.fields as Record<string, unknown>)?.valorTotal ?? 0,
          );
          if (isFinite(v)) revenue += v;
        }
      }
    }

    const conv = checkouts > 0 ? (pixPaid / checkouts) * 100 : 0;
    const avgTicket = pixPaid > 0 ? revenue / pixPaid : 0;

    return {
      checkouts,
      cardAttempts,
      pixPaid,
      revenue,
      conv,
      avgTicket,
      uniqueVisitors: checkoutLeads.size,
      cardUniqueLeads: cardLeads.size,
    };
  }, [subs]);

  // Timeline by hour (for single day) or by day (for multi-day)
  const timeline = useMemo(() => {
    const isMultiDay =
      Math.round(
        (range.end.getTime() - range.start.getTime()) / 86400000,
      ) > 1;

    if (isMultiDay) {
      const bucket = new Map<string, { label: string; pedidos: number; receita: number }>();
      const days = Math.ceil(
        (range.end.getTime() - range.start.getTime()) / 86400000,
      );
      for (let i = 0; i < days; i++) {
        const d = addDays(range.start, i);
        const key = format(d, "yyyy-MM-dd");
        bucket.set(key, {
          label: format(d, "dd/MM"),
          pedidos: 0,
          receita: 0,
        });
      }
      const paidByOrder = new Set<string>();
      for (const s of subs) {
        if (s.form_type !== "pix_paid" || !s.order_id) continue;
        if (paidByOrder.has(s.order_id)) continue;
        paidByOrder.add(s.order_id);
        const key = format(new Date(s.created_at), "yyyy-MM-dd");
        const b = bucket.get(key);
        if (!b) continue;
        b.pedidos++;
        const checkout = subs.find(
          (x) => x.form_type === "checkout" && x.order_id === s.order_id,
        );
        b.receita += Number(
          (checkout?.fields as Record<string, unknown>)?.valorTotal ?? 0,
        );
      }
      return Array.from(bucket.values());
    }

    const bucket = new Map<number, { label: string; pedidos: number; receita: number }>();
    for (let h = 0; h < 24; h++)
      bucket.set(h, { label: `${String(h).padStart(2, "0")}h`, pedidos: 0, receita: 0 });

    const paidByOrder = new Set<string>();
    for (const s of subs) {
      if (s.form_type !== "pix_paid" || !s.order_id) continue;
      if (paidByOrder.has(s.order_id)) continue;
      paidByOrder.add(s.order_id);
      const h = new Date(s.created_at).getHours();
      const b = bucket.get(h)!;
      b.pedidos++;
      const checkout = subs.find(
        (x) => x.form_type === "checkout" && x.order_id === s.order_id,
      );
      b.receita += Number(
        (checkout?.fields as Record<string, unknown>)?.valorTotal ?? 0,
      );
    }
    return Array.from(bucket.values());
  }, [subs, range.start, range.end]);

  // Top UTM sources by paid orders
  const topSources = useMemo(() => {
    const counts = new Map<string, { pedidos: number; receita: number }>();
    const seen = new Set<string>();
    for (const s of subs) {
      if (s.form_type !== "pix_paid" || !s.order_id) continue;
      if (seen.has(s.order_id)) continue;
      seen.add(s.order_id);
      const checkout = subs.find(
        (x) => x.form_type === "checkout" && x.order_id === s.order_id,
      );
      const tp = (checkout?.fields as Record<string, unknown>)?.trackingParameters as
        | Record<string, unknown>
        | undefined;
      const src = String(tp?.utm_source ?? "Direto").trim() || "Direto";
      const cur = counts.get(src) ?? { pedidos: 0, receita: 0 };
      cur.pedidos++;
      cur.receita += Number(
        (checkout?.fields as Record<string, unknown>)?.valorTotal ?? 0,
      );
      counts.set(src, cur);
    }
    return Array.from(counts.entries())
      .map(([source, v]) => ({ source, ...v }))
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 6);
  }, [subs]);

  // Top campaigns
  const topCampaigns = useMemo(() => {
    const counts = new Map<string, { pedidos: number; receita: number; checkouts: number }>();
    const seenPaid = new Set<string>();
    for (const s of subs) {
      if (s.form_type !== "checkout") continue;
      const tp = (s.fields as Record<string, unknown>)?.trackingParameters as
        | Record<string, unknown>
        | undefined;
      const campRaw = String(tp?.utm_campaign ?? "(sem campanha)");
      const camp = campRaw.split("|")[0].trim() || "(sem campanha)";
      const cur = counts.get(camp) ?? { pedidos: 0, receita: 0, checkouts: 0 };
      cur.checkouts++;
      counts.set(camp, cur);
    }
    for (const s of subs) {
      if (s.form_type !== "pix_paid" || !s.order_id) continue;
      if (seenPaid.has(s.order_id)) continue;
      seenPaid.add(s.order_id);
      const checkout = subs.find(
        (x) => x.form_type === "checkout" && x.order_id === s.order_id,
      );
      if (!checkout) continue;
      const tp = (checkout.fields as Record<string, unknown>)?.trackingParameters as
        | Record<string, unknown>
        | undefined;
      const camp = String(tp?.utm_campaign ?? "(sem campanha)").split("|")[0].trim() ||
        "(sem campanha)";
      const cur = counts.get(camp);
      if (!cur) continue;
      cur.pedidos++;
      cur.receita += Number(
        (checkout.fields as Record<string, unknown>)?.valorTotal ?? 0,
      );
    }
    return Array.from(counts.entries())
      .map(([campaign, v]) => ({
        campaign,
        ...v,
        conv: v.checkouts > 0 ? (v.pedidos / v.checkouts) * 100 : 0,
      }))
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 8);
  }, [subs]);

  // Top produtos
  const topProducts = useMemo(() => {
    const counts = new Map<string, { qtd: number; receita: number }>();
    const seen = new Set<string>();
    for (const s of subs) {
      if (s.form_type !== "pix_paid" || !s.order_id) continue;
      if (seen.has(s.order_id)) continue;
      seen.add(s.order_id);
      const checkout = subs.find(
        (x) => x.form_type === "checkout" && x.order_id === s.order_id,
      );
      const prods = (checkout?.fields as Record<string, unknown>)?.products as
        | { name?: string; price?: number; quantity?: number }[]
        | undefined;
      if (!prods) continue;
      for (const p of prods) {
        const name = p.name ?? "Produto";
        const cur = counts.get(name) ?? { qtd: 0, receita: 0 };
        cur.qtd += Number(p.quantity ?? 1);
        cur.receita += Number(p.price ?? 0) * Number(p.quantity ?? 1);
        counts.set(name, cur);
      }
    }
    return Array.from(counts.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 6);
  }, [subs]);

  const eventTypeMix = useMemo(() => {
    const c = { checkout: 0, credit_card_attempt: 0, pix_paid: 0 };
    for (const s of subs) if (s.form_type in c) c[s.form_type as keyof typeof c]++;
    return [
      { name: "Checkouts", value: c.checkout, color: COLORS[0] },
      { name: "Tentativas cartão", value: c.credit_card_attempt, color: COLORS[2] },
      { name: "PIX pago", value: c.pix_paid, color: COLORS[1] },
    ].filter((x) => x.value > 0);
  }, [subs]);

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <AdminShell
      title="Dashboard"
      subtitle={
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)] transition-all",
              pulse && "ring-4 ring-[var(--primary)]/30",
            )}
          />
          Ao vivo · {range.label}
        </span>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Live presence badge — visitors right now */}
        <LivePresenceBadge />
        {/* Filters */}
        <section className="rounded-2xl border bg-card p-4 shadow-sm flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">
            Período
          </span>
          {([
            ["today", "Hoje"],
            ["yesterday", "Ontem"],
            ["7d", "7 dias"],
            ["30d", "30 dias"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setRangePreset(k)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                rangePreset === k
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {label}
            </button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <button
                onClick={() => setRangePreset("custom")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  rangePreset === "custom"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/70",
                )}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                {rangePreset === "custom"
                  ? format(date, "dd/MM/yyyy")
                  : "Escolher data"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) {
                    setDate(d);
                    setRangePreset("custom");
                  }
                }}
                initialFocus
                locale={ptBR}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {loading && (
            <span className="ml-auto text-xs text-muted-foreground animate-pulse">
              Atualizando...
            </span>
          )}
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Faturamento"
            value={fmtBRL(metrics.revenue)}
            hint={`${metrics.pixPaid} ${metrics.pixPaid === 1 ? "pedido pago" : "pedidos pagos"}`}
            icon={DollarSign}
            accent="bg-gradient-to-br from-emerald-500 to-green-600"
          />
          <KpiCard
            label="Ticket médio"
            value={fmtBRL(metrics.avgTicket)}
            hint="por pedido pago"
            icon={ShoppingCart}
            accent="bg-gradient-to-br from-blue-500 to-indigo-600"
          />
          <KpiCard
            label="Conversão PIX"
            value={fmtPct(metrics.conv)}
            hint={`${metrics.pixPaid} de ${metrics.checkouts} checkouts`}
            icon={Target}
            accent="bg-gradient-to-br from-fuchsia-500 to-pink-600"
          />
          <KpiCard
            label="Tentativas cartão"
            value={String(metrics.cardAttempts)}
            hint={`${metrics.cardUniqueLeads} pessoas únicas`}
            icon={CreditCard}
            accent="bg-gradient-to-br from-amber-500 to-orange-600"
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <KpiCard
            label="Checkouts iniciados"
            value={String(metrics.checkouts)}
            hint={`${metrics.uniqueVisitors} pessoas únicas`}
            icon={Zap}
            accent="bg-gradient-to-br from-sky-500 to-cyan-600"
          />
          <KpiCard
            label="Pedidos PIX pagos"
            value={String(metrics.pixPaid)}
            hint="dinheiro na conta"
            icon={CheckCircle2}
            accent="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <KpiCard
            label="Cartão → PIX"
            value={String(
              Array.from(new Set(subs.filter((s) => s.form_type === "pix_paid").map((s) => s.order_id))).filter((oid) =>
                subs.some(
                  (s) => s.form_type === "credit_card_attempt" && s.order_id === oid,
                ),
              ).length,
            )}
            hint="tentou cartão e pagou PIX"
            icon={Activity}
            accent="bg-gradient-to-br from-violet-500 to-purple-600"
          />
        </section>

        {/* Timeline + Mix */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Vendas ao longo do tempo</h3>
                <p className="text-xs text-muted-foreground">
                  Pedidos pagos e receita — {range.label}
                </p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    allowDecimals={false}
                  />
                  <RTooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number, name: string) =>
                      name === "receita" ? [fmtBRL(v), "Receita"] : [v, "Pedidos"]
                    }
                  />
                  <Bar dataKey="pedidos" fill={COLORS[0]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">Mix de eventos</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Como se distribuem as interações
            </p>
            {eventTypeMix.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">
                Sem dados no período.
              </p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventTypeMix}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {eventTypeMix.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <RTooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">
                  {eventTypeMix.map((e) => (
                    <div key={e.name} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: e.color }}
                      />
                      <span className="text-muted-foreground">{e.name}</span>
                      <span className="ml-auto font-semibold">{e.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Sources + Campaigns */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">Origens de tráfego</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Ranking por receita
            </p>
            {topSources.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Sem vendas atribuídas no período.
              </p>
            ) : (
              <div className="space-y-2">
                {topSources.map((s, i) => {
                  const max = topSources[0].receita || 1;
                  const pct = (s.receita / max) * 100;
                  return (
                    <div key={s.source} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: COLORS[i % COLORS.length] }}
                          />
                          {s.source}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {s.pedidos} · <span className="text-foreground font-semibold">{fmtBRL(s.receita)}</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">Campanhas</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Performance por campanha (checkout → pago)
            </p>
            {topCampaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Sem campanhas no período.
              </p>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-xs">
                  <thead className="text-muted-foreground">
                    <tr className="border-b">
                      <th className="text-left px-2 py-2 font-medium">Campanha</th>
                      <th className="text-right px-2 py-2 font-medium">Chk</th>
                      <th className="text-right px-2 py-2 font-medium">Pgs</th>
                      <th className="text-right px-2 py-2 font-medium">Conv</th>
                      <th className="text-right px-2 py-2 font-medium">Receita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCampaigns.map((c) => (
                      <tr key={c.campaign} className="border-b last:border-0">
                        <td className="px-2 py-2 max-w-[180px] truncate" title={c.campaign}>
                          {c.campaign}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">{c.checkouts}</td>
                        <td className="px-2 py-2 text-right tabular-nums font-semibold">
                          {c.pedidos}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {fmtPct(c.conv)}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                          {fmtBRL(c.receita)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Products + Live feed */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">Produtos mais vendidos</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Ranking por receita
            </p>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Sem produtos vendidos no período.
              </p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => {
                  const max = topProducts[0].receita || 1;
                  const pct = (p.receita / max) * 100;
                  return (
                    <div key={p.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium truncate pr-2">{p.name}</span>
                        <span className="tabular-nums text-muted-foreground shrink-0">
                          {p.qtd}× ·{" "}
                          <span className="text-foreground font-semibold">{fmtBRL(p.receita)}</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Radio className="h-3.5 w-3.5 text-emerald-500" />
                  Feed ao vivo
                </h3>
                <p className="text-xs text-muted-foreground">
                  Eventos entrando em tempo real
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                  live.length > 0
                    ? "border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                    : "border-border text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    live.length > 0 ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground",
                  )}
                />
                {live.length} nesta sessão
              </span>
            </div>
            {live.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Aguardando eventos ao vivo...
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-auto">
                {live.map((s) => {
                  const t = new Date(s.created_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                  const info = {
                    checkout: {
                      label: "Checkout preenchido",
                      icon: Zap,
                      color: "text-blue-600 bg-blue-100 dark:bg-blue-950/60",
                    },
                    credit_card_attempt: {
                      label: "Tentou cartão",
                      icon: CreditCard,
                      color: "text-amber-600 bg-amber-100 dark:bg-amber-950/60",
                    },
                    pix_paid: {
                      label: "PIX pago 🎉",
                      icon: CheckCircle2,
                      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60",
                    },
                  }[s.form_type] ?? {
                    label: s.form_type,
                    icon: Activity,
                    color: "text-muted-foreground bg-muted",
                  };
                  const Icon = info.icon;
                  const valor = Number(
                    (s.fields as Record<string, unknown>)?.valorTotal ?? 0,
                  );
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 rounded-lg border bg-background p-2.5"
                    >
                      <div className={cn("rounded-lg p-2", info.color)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">
                          {info.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {s.nome || "Anônimo"}
                          {valor > 0 && ` · ${fmtBRL(valor)}`}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                        {t}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
