import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, Fragment } from "react";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  CreditCard,
  CheckCircle2,
  Users,
  TrendingUp,
  LogOut,
  Search,
  Calendar,
  Filter,
  Mail,
  MailOpen,
  Trash2,
  Settings,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadFields } from "@/lib/lead-fields";
import { AdminShell } from "@/components/admin/AdminShell";
import { toast } from "sonner";
import { getActiveGateway, setActiveGateway } from "@/lib/settings.functions";
import { useServerFn } from "@tanstack/react-start";


export const Route = createFileRoute("/_authenticated/admin/leads")({
  component: LeadsList,
});

const ALLOWED_FORM_TYPES = new Set(["checkout", "credit_card_attempt", "pix_paid"]);
const CARD_FORM_TYPES = new Set(["credit_card_attempt"]);
const PAID_FORM_TYPES = new Set(["pix_paid"]);

const FORM_TYPE_LABELS: Record<string, string> = {
  checkout: "Checkout preenchido",
  credit_card_attempt: "Tentou pagar com cartão",
  pix_paid: "Pagou via PIX",
};

type Lead = {
  id: string;
  nome: string | null;
  whatsapp: string | null;
  email: string | null;
  last_seen_at: string;
  first_seen_at: string;
};
type Submission = {
  id: string;
  lead_id: string | null;
  form_type: string;
  order_id: string | null;
  created_at: string;
  fields: Record<string, unknown>;
  page_url: string | null;
};

type FilterKey = "all" | "card" | "unread" | "paid" | "card_then_pix";

const READ_STORAGE_KEY = "admin.leads.readIds.v1";

function formatPhone(w: string | null) {
  if (!w) return "—";
  const d = w.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return w;
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayLabel(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  if (diff < 7) return `${diff} dias atrás`;
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl ${gradient}`}
      />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${gradient}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function LeadsList() {
  const [activeGateway, setActiveGatewayState] = useState<string>("paradise");
  const [isGatewayLoading, setIsGatewayLoading] = useState(false);
  const getGatewayFn = useServerFn(getActiveGateway);
  const setGatewayFn = useServerFn(setActiveGateway);

  useEffect(() => {
    getGatewayFn().then(setActiveGatewayState).catch(console.error);
  }, []);

  async function handleGatewayChange(newGateway: string) {
    if (newGateway === activeGateway) return;
    setIsGatewayLoading(true);
    try {
      await setGatewayFn({ data: newGateway } as any);
      setActiveGatewayState(newGateway);
      toast.success(`Gateway alterado para ${newGateway === "paradise" ? "Paradise" : "Nexus"}`);
    } catch (error) {
      toast.error("Erro ao alterar gateway");
      console.error(error);
    } finally {
      setIsGatewayLoading(false);
    }
  }

  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem(READ_STORAGE_KEY);
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set();
    }
  });
  const [pendingDelete, setPendingDelete] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function persistRead(next: Set<string>) {
    try {
      window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(next)));
    } catch {
      /* ignore */
    }
  }

  function toggleRead(id: string) {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persistRead(next);
      return next;
    });
  }

  useEffect(() => {
    (async () => {
      const [{ data: leadsData, error: le }, { data: subsData, error: se }] =
        await Promise.all([
          supabase
            .from("leads")
            .select("id, nome, whatsapp, email, last_seen_at, first_seen_at")
            .order("last_seen_at", { ascending: false })
            .limit(500),
          supabase
            .from("lead_submissions")
            .select("id, lead_id, form_type, order_id, created_at, fields, page_url")
            .in("form_type", Array.from(ALLOWED_FORM_TYPES))
            .order("created_at", { ascending: false })
            .limit(5000),
        ]);
      if (le) toast.error("Erro ao carregar leads", { description: le.message });
      if (se) toast.error("Erro ao carregar interações", { description: se.message });
      setLeads((leadsData ?? []) as Lead[]);
      setSubs((subsData ?? []) as Submission[]);
      setLoading(false);
    })();
  }, []);

  const subsByLead = useMemo(() => {
    const m: Record<string, Submission[]> = {};
    for (const s of subs) {
      if (!s.lead_id) continue;
      (m[s.lead_id] ??= []).push(s);
    }
    return m;
  }, [subs]);

  const cardLeadIds = useMemo(() => {
    const s = new Set<string>();
    for (const sub of subs) {
      if (sub.lead_id && CARD_FORM_TYPES.has(sub.form_type)) s.add(sub.lead_id);
    }
    return s;
  }, [subs]);

  const paidLeadIds = useMemo(() => {
    const s = new Set<string>();
    for (const sub of subs) {
      if (sub.lead_id && PAID_FORM_TYPES.has(sub.form_type)) s.add(sub.lead_id);
    }
    return s;
  }, [subs]);

  const stats = useMemo(() => {
    const todayKey = dayKey(new Date().toISOString());
    let todayCount = 0;
    for (const l of leads) if (dayKey(l.first_seen_at) === todayKey) todayCount++;
    const cardCount = cardLeadIds.size;
    const paidCount = paidLeadIds.size;
    return { total: leads.length, todayCount, cardCount, paidCount };
  }, [leads, cardLeadIds, paidLeadIds]);

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  async function confirmDeleteLead() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setDeleting(true);
    const { error: se } = await supabase.from("lead_submissions").delete().eq("lead_id", id);
    if (se) {
      toast.error("Erro ao apagar interações", { description: se.message });
      setDeleting(false);
      return;
    }
    const { error: le } = await supabase.from("leads").delete().eq("id", id);
    if (le) {
      toast.error("Erro ao apagar lead", { description: le.message });
      setDeleting(false);
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setSubs((prev) => prev.filter((s) => s.lead_id !== id));
    toast.success("Lead apagado");
    setDeleting(false);
    setPendingDelete(null);
  }

  const unreadCardIds = useMemo(() => {
    const s = new Set<string>();
    for (const id of cardLeadIds) if (!readIds.has(id)) s.add(id);
    return s;
  }, [cardLeadIds, readIds]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (filter === "card" && !cardLeadIds.has(l.id)) return false;
      if (filter === "unread" && !unreadCardIds.has(l.id)) return false;
      if (filter === "paid" && !paidLeadIds.has(l.id)) return false;
      if (filter === "card_then_pix" && !(cardLeadIds.has(l.id) && paidLeadIds.has(l.id)))
        return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        (l.nome ?? "").toLowerCase().includes(s) ||
        (l.whatsapp ?? "").includes(s.replace(/\D/g, ""))
      );
    });
  }, [leads, q, filter, cardLeadIds, paidLeadIds, unreadCardIds]);

  const grouped = useMemo(() => {
    const map = new Map<string, Lead[]>();
    for (const l of filtered) {
      const k = dayKey(l.last_seen_at);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(l);
    }
    return Array.from(map.entries()); // already ordered by last_seen desc
  }, [filtered]);

  const filterButtons: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: leads.length },
    { key: "unread", label: "Não lidos (cartão)", count: unreadCardIds.size },
    { key: "card", label: "Tentou cartão", count: cardLeadIds.size },
    { key: "paid", label: "Pagou PIX", count: paidLeadIds.size },
    {
      key: "card_then_pix",
      label: "Cartão → PIX",
      count: leads.filter((l) => cardLeadIds.has(l.id) && paidLeadIds.has(l.id)).length,
    },
  ];

  return (
    <AdminShell
      title="Painel de Leads"
      subtitle="Acompanhe cada interação em tempo real"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total de leads"
            value={stats.total}
            icon={Users}
            gradient="bg-[var(--primary)]"
          />
          <StatCard
            label="Hoje"
            value={stats.todayCount}
            icon={TrendingUp}
            gradient="bg-amber-500"
          />
          <StatCard
            label="Tentaram cartão"
            value={stats.cardCount}
            icon={CreditCard}
            gradient="bg-blue-500"
          />
          <StatCard
            label="Pagaram PIX"
            value={stats.paidCount}
            icon={CheckCircle2}
            gradient="bg-emerald-500"
          />
        </section>

        {/* Quick Settings: Gateway Selector */}
        <section className="rounded-2xl border bg-card p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Gateway Ativo</p>
              <p className="text-xs text-muted-foreground">Escolha qual gateway processará os novos pedidos PIX</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[140px] justify-between" disabled={isGatewayLoading}>
                  {isGatewayLoading ? "Alterando..." : activeGateway === "paradise" ? "Paradise Pags" : "Nexus Pag"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Gateway de Pagamento</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  key="paradise"
                  onClick={() => handleGatewayChange("paradise")}
                  className={activeGateway === "paradise" ? "bg-primary/10 font-bold" : ""}
                >
                  <div className="flex flex-col">
                    <span>Paradise Pags</span>
                    <span className="text-[10px] text-muted-foreground">Configurado e ativo</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  key="nexus"
                  onClick={() => handleGatewayChange("nexus")}
                  className={activeGateway === "nexus" ? "bg-primary/10 font-bold" : ""}
                >
                  <div className="flex flex-col">
                    <span>Nexus Pag</span>
                    <span className="text-[10px] text-muted-foreground">Integração legada</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
              Online
            </Badge>
          </div>
        </section>

        {/* Search + filters */}
        <section className="rounded-2xl border bg-card p-4 shadow-sm space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou WhatsApp..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 h-11 bg-background"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {filterButtons.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {f.label}
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-1.5 min-w-[20px] text-[10px] ${
                      active ? "bg-primary-foreground/20" : "bg-background"
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Leads grouped by day */}
        <section className="space-y-6">
          {loading ? (
            <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
              Carregando...
            </div>
          ) : grouped.length === 0 ? (
            <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
              Nenhum lead encontrado.
            </div>
          ) : (
            grouped.map(([day, dayLeads]) => {
              const dayCollapsed = collapsedDays.has(day);
              const toggleDay = () =>
                setCollapsedDays((prev) => {
                  const next = new Set(prev);
                  if (next.has(day)) next.delete(day);
                  else next.add(day);
                  return next;
                });
              return (
              <div key={day} className="space-y-3">
                <div className="flex items-center gap-3 sticky top-[73px] z-[5] py-2 bg-gradient-to-b from-background via-background to-transparent">
                  <button
                    type="button"
                    onClick={toggleDay}
                    className="flex items-center gap-2 rounded-full bg-card border px-3 py-1.5 shadow-sm hover:bg-muted/50 transition-colors"
                    title={dayCollapsed ? "Expandir dia" : "Recolher dia"}
                  >
                    {dayCollapsed ? (
                      <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-primary" />
                    )}
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-semibold capitalize">
                      {dayLabel(day)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · {dayLeads.length} {dayLeads.length === 1 ? "lead" : "leads"}
                    </span>
                  </button>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {!dayCollapsed && (
                <div className="grid gap-3">
                  {dayLeads.map((l) => {
                    const leadSubs = subsByLead[l.id] ?? [];
                    const isOpen = expandedId === l.id;
                    const hasCard = cardLeadIds.has(l.id);
                    const hasPaid = paidLeadIds.has(l.id);
                    const isUnread = hasCard && !readIds.has(l.id);

                    const accent = hasPaid
                      ? "border-l-emerald-400"
                      : isUnread
                        ? "border-l-teal-300"
                        : "border-l-transparent";

                    const bgTint = hasPaid
                      ? "bg-emerald-50/50"
                      : isUnread
                        ? "bg-teal-50/60"
                        : "bg-card";

                    const toggleOpen = () =>
                      setExpandedId((cur) => (cur === l.id ? null : l.id));

                    return (
                      <div
                        key={l.id}
                        className={`group rounded-2xl border border-l-4 ${accent} ${bgTint} shadow-sm hover:shadow-md transition-all overflow-hidden`}
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={toggleOpen}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleOpen();
                            }
                          }}
                          className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors cursor-pointer"
                        >
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                            {(l.nome ?? "?").trim().charAt(0).toUpperCase() || "?"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                to="/admin/leads/$id"
                                params={{ id: l.id }}
                                className="font-semibold truncate hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {l.nome || "(sem nome)"}
                              </Link>
                              {hasCard && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-800 rounded-full px-2 py-0.5">
                                  <CreditCard className="h-3 w-3" />
                                  Cartão
                                </span>
                              )}
                              {hasPaid && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-full px-2 py-0.5">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {hasCard ? "Pagou após cartão" : "Pagou PIX"}
                                </span>
                              )}
                              {isUnread && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-200 bg-white dark:bg-teal-950/40 border border-teal-400 dark:border-teal-700 rounded-full px-2 py-0.5">
                                  Novo
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-0.5">
                              {formatPhone(l.whatsapp)}
                            </div>
                          </div>

                          <div className="hidden sm:flex flex-col items-end text-xs text-muted-foreground shrink-0">
                            <span>Última interação</span>
                            <span className="font-medium text-foreground">
                              {timeLabel(l.last_seen_at)}
                            </span>
                          </div>

                          {hasCard && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRead(l.id);
                              }}
                              title={isUnread ? "Marcar como lido" : "Marcar como não lido"}
                              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
                            >
                              {isUnread ? (
                                <>
                                  <Mail className="h-3.5 w-3.5" />
                                  Marcar lido
                                </>
                              ) : (
                                <>
                                  <MailOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                  Lido
                                </>
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingDelete(l);
                            }}
                            title="Apagar lead"
                            className="shrink-0 inline-flex items-center justify-center rounded-full border border-destructive/30 text-destructive w-8 h-8 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          <div className="text-muted-foreground shrink-0">
                            {isOpen ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                        </div>

                        {isOpen && (
                          <div className="border-t bg-muted/20 p-4 space-y-3">
                            {hasPaid && (
                              <div className="flex items-center gap-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-100/70 dark:bg-emerald-950/40 px-4 py-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <div>
                                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                                    Pagamento PIX confirmado
                                  </p>
                                  <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                                    {hasCard
                                      ? "Cliente tentou cartão antes e depois pagou via PIX."
                                      : "Cliente finalizou direto pelo PIX."}
                                  </p>
                                </div>
                              </div>
                            )}
                            {leadSubs.length === 0 ? (
                              <p className="text-sm text-muted-foreground py-2 text-center">
                                Nenhuma interação registrada.
                              </p>
                            ) : (
                              leadSubs.map((s) => (
                                <div
                                  key={s.id}
                                  className="rounded-xl border bg-card p-4"
                                >
                                  <div className="flex items-center gap-2 flex-wrap mb-3">
                                    <Badge variant="secondary">
                                      {FORM_TYPE_LABELS[s.form_type] ?? s.form_type.replace(/_/g, " ")}
                                    </Badge>
                                    {s.order_id && (
                                      <span className="text-xs font-mono text-muted-foreground">
                                        #{s.order_id}
                                      </span>
                                    )}
                                    <span className="text-xs text-muted-foreground ml-auto">
                                      {new Date(s.created_at).toLocaleString("pt-BR")}
                                    </span>
                                  </div>
                                  <LeadFields fields={s.fields} />
                                  {s.page_url && (
                                    <p className="text-xs text-muted-foreground mt-2 truncate">
                                      URL: {s.page_url}
                                    </p>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
              );
            })
          )}
      </section>
      </div>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && !deleting && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar este lead?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.nome?.trim() || "Lead sem nome"} e todas as
              interações associadas serão removidos permanentemente. Essa ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteLead();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Apagando..." : "Apagar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}
