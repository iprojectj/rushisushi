import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/** Live visitors + funnel, read from anonymous heartbeats (site_sessions). Admin-only via RLS. */
interface Session {
  id: string;
  last_seen: string;
  path: string | null;
  max_step: number;
  pageviews: number;
  utm_source: string | null;
  utm_campaign: string | null;
  device: string | null;
  city: string | null;
}

const STEPS = ["Entraram no site", "Adicionaram ao carrinho", "Iniciaram checkout", "Chegaram no pagamento", "Geraram PIX", "Pagaram"];
const PAGE: Record<string, string> = { "/": "Cardápio", "/pedido": "Tela do PIX", "/obrigado": "Obrigado" };
const pageName = (p: string | null) => {
  const k = (p ?? "/").replace(/\.html$/, "").replace(/^\/index$/, "/");
  return PAGE[k] ?? k;
};

function top(list: Session[], f: (s: Session) => string) {
  const m = new Map<string, number>();
  list.forEach((s) => m.set(f(s), (m.get(f(s)) ?? 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
}

export function TrafficMetrics({ start, end }: { start: Date; end: Date }) {
  const [rows, setRows] = useState<Session[]>([]);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data, error: e } = await supabase
        .from("site_sessions")
        .select("id,last_seen,path,max_step,pageviews,utm_source,utm_campaign,device,city")
        .gte("first_seen", start.toISOString())
        .lte("first_seen", end.toISOString())
        .order("last_seen", { ascending: false })
        .limit(5000);
      if (!alive) return;
      if (e) setError(e.message);
      else { setError(null); setRows(data ?? []); }
      setNow(Date.now());
    };
    load();
    const id = setInterval(load, 10000);
    return () => { alive = false; clearInterval(id); };
  }, [start, end]);

  // "Online agora" = sinal recebido nos últimos 60s (independe do período escolhido).
  const [live, setLive] = useState<Session[]>([]);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data } = await supabase
        .from("site_sessions")
        .select("id,last_seen,path,max_step,pageviews,utm_source,utm_campaign,device,city")
        .gte("last_seen", new Date(Date.now() - 60000).toISOString())
        .limit(2000);
      if (alive) setLive(data ?? []);
    };
    load();
    const id = setInterval(load, 5000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const funnel = useMemo(() => STEPS.map((_, i) => rows.filter((r) => r.max_step >= i + 1).length), [rows]);
  const total = funnel[0] || 0;
  const bounce = total ? Math.round((rows.filter((r) => r.pageviews <= 1 && r.max_step === 1).length / total) * 100) : 0;
  const mobile = total ? Math.round((rows.filter((r) => r.device === "mobile").length / total) * 100) : 0;

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm md:col-span-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="relative flex h-2.5 w-2.5">
              {live.length > 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            Online agora
          </div>
          <div className="mt-2 text-5xl font-bold tabular-nums">{live.length}</div>
          <div className="mt-3 space-y-1 text-sm">
            {top(live, (s) => pageName(s.path)).map(([k, v]) => (
              <div key={k} className="flex justify-between text-muted-foreground"><span>{k}</span><span className="font-semibold text-foreground">{v}</span></div>
            ))}
            {live.length === 0 && <p className="text-muted-foreground">Ninguém no site neste minuto.</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:col-span-2">
          {[
            ["Visitantes no período", String(total)],
            ["Conversão (visita → pago)", total ? `${((funnel[5] / total) * 100).toFixed(1)}%` : "—"],
            ["Saíram sem interagir", `${bounce}%`],
            ["Pelo celular", `${mobile}%`],
          ].map(([l, v]) => (
            <div key={l} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{l}</div>
              <div className="mt-2 text-3xl font-bold tabular-nums">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="font-semibold">Funil de vendas do período</h3>
        <p className="mb-4 text-xs text-muted-foreground">Quantos visitantes chegaram em cada etapa e onde mais gente desiste.</p>
        <div className="space-y-3">
          {STEPS.map((label, i) => {
            const v = funnel[i];
            const pct = total ? (v / total) * 100 : 0;
            const prev = i > 0 ? funnel[i - 1] : 0;
            const drop = i > 0 && prev ? Math.round(((prev - v) / prev) * 100) : null;
            return (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="tabular-nums">
                    <b>{v}</b> <span className="text-muted-foreground">({pct.toFixed(1)}%)</span>
                    {drop !== null && drop > 0 && <span className="ml-2 text-destructive">−{drop}% saíram</span>}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full bg-primary transition-all")} style={{ width: `${Math.max(pct, v ? 1 : 0)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          ["Origem do tráfego (utm_source)", top(rows, (s) => s.utm_source || "Direto / sem UTM")],
          ["Campanhas que mais trazem visitas", top(rows, (s) => s.utm_campaign || "Sem campanha")],
        ].map(([title, list]) => (
          <div key={title as string} className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="mb-3 font-semibold">{title as string}</h3>
            {(list as [string, number][]).length === 0 && <p className="text-sm text-muted-foreground">Sem dados ainda.</p>}
            {(list as [string, number][]).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b py-1.5 text-sm last:border-0">
                <span className="truncate">{k}</span><b className="tabular-nums">{v}</b>
              </div>
            ))}
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">Não foi possível carregar as métricas: {error}</p>}
      <p className="text-xs text-muted-foreground">Atualizado {new Date(now).toLocaleTimeString("pt-BR")} · atualiza sozinho a cada 10s.</p>
    </section>
  );
}
