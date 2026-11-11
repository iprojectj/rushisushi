import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import BrazilPurchaseMap from "./BrazilPurchaseMap";
import { getAdminLiveSessions, getAdminPurchaseGeography, getAdminTrafficSessions } from "@/lib/admin-data.functions";
import type { PurchaseGeography } from "@/lib/purchase-geography.types";
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
  region: string | null;
  region_code: string | null;
  lat: number | null;
  lng: number | null;
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
  const loadRowsFn = useServerFn(getAdminTrafficSessions);
  const loadLiveFn = useServerFn(getAdminLiveSessions);
  const loadPurchasesFn = useServerFn(getAdminPurchaseGeography);
  const [rows, setRows] = useState<Session[]>([]);
  const [purchases, setPurchases] = useState<PurchaseGeography | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!alive) return;
      try {
        const data = await loadRowsFn({ data: { start: start.toISOString(), end: end.toISOString() } });
        if (alive) { setError(null); setRows(data as Session[]); }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Erro ao carregar tráfego");
      }
      setNow(Date.now());
    };
    load();
    const id = setInterval(load, 10000);
    return () => { alive = false; clearInterval(id); };
  }, [start, end, loadRowsFn]);

  useEffect(() => {
    let alive = true;
    let busy = false;
    setPurchases(null);
    setPurchaseError(null);
    const load = async () => {
      if (busy) return;
      busy = true;
      try {
        const data = await loadPurchasesFn({ data: { start: start.toISOString(), end: end.toISOString() } });
        if (alive) { setPurchases(data); setPurchaseError(null); }
      } catch (e) {
        if (alive) setPurchaseError(e instanceof Error ? e.message : "Erro ao carregar compras");
      } finally {
        busy = false;
      }
    };
    load();
    const id = setInterval(load, 10000);
    return () => { alive = false; clearInterval(id); };
  }, [start, end, loadPurchasesFn]);

  // "Online agora" = sinal recebido nos últimos 60s (independe do período escolhido).
  const [live, setLive] = useState<Session[]>([]);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const data = await loadLiveFn();
        if (alive) setLive(data as unknown as Session[]);
      } catch {
        if (alive) setLive([]);
      }
    };
    load();
    const id = setInterval(load, 5000);
    return () => { alive = false; clearInterval(id); };
  }, [loadLiveFn]);

  const funnel = useMemo(() => STEPS.map((_, i) => rows.filter((r) => r.max_step >= i + 1).length), [rows]);
  const total = funnel[0] || 0;
  const states = purchases?.states ?? [];
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="font-semibold">De onde vêm as compras</h3>
          <p className="mb-2 text-xs text-muted-foreground">Somente pagamentos confirmados. Bolinhas maiores = mais compras. Localização por município do endereço de entrega.</p>
          {purchases ? <BrazilPurchaseMap cities={purchases.cities} /> : (
            <p className="py-20 text-center text-sm text-muted-foreground">
              {purchaseError ? "Não foi possível carregar o mapa de compras." : "Carregando compras…"}
            </p>
          )}
          {purchases && purchases.unmapped > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {purchases.unmapped} {purchases.unmapped === 1 ? "compra sem cidade identificada não aparece" : "compras sem cidade identificada não aparecem"} no mapa.
            </p>
          )}
          {purchaseError && <p role="alert" className="mt-2 text-sm text-destructive">Falha ao atualizar compras: {purchaseError}</p>}
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="font-semibold">Compras por estado</h3>
          <p className="mb-3 text-xs text-muted-foreground">Por data de confirmação do pagamento no período escolhido.</p>
          <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
            {!purchases && <p className="text-sm text-muted-foreground">{purchaseError ? "Dados indisponíveis." : "Carregando compras…"}</p>}
            {purchases && states.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma compra paga no período.</p>}
            {states.map((state) => (
              <div key={state.code}>
                <div className="flex justify-between gap-2 text-sm"><span className="truncate">{state.name}{state.code !== "unknown" && ` (${state.code})`}</span><b className="tabular-nums">{state.count}</b></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(state.count / states[0].count) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
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
