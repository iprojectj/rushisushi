import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowDownUp, Check, ChevronDown, Clock3, LoaderCircle, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminRefundRequests, updateAdminRefundRequest } from "@/lib/refund-admin.functions";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/_authenticated/admin/refunds")({
  head: () => pageHead("Reembolsos — Rūshī Admin", "Fila de revisão manual de solicitações de reembolso Rūshī.", true),
  component: RefundQueuePage,
});

type RefundStatus = "recebida" | "em_analise" | "aprovada" | "estornada" | "negada";
type EditableRefundStatus = Exclude<RefundStatus, "estornada">;
type RefundFields = { protocol?: string; publicOrderNumber?: string; reason?: string; details?: string; status?: RefundStatus | "contato_whatsapp"; statusMessage?: string | null; refundCompleted?: boolean; refundCompletedAt?: string | null; updatedAt?: string };
type RefundRow = {
  id: string;
  order_id: string;
  created_at: string;
  nome: string;
  email: string;
  whatsapp: string;
  fields: RefundFields | string;
};
const STATUS_OPTIONS: { value: EditableRefundStatus; label: string }[] = [
  { value: "recebida", label: "Recebida" },
  { value: "em_analise", label: "Em análise" },
  { value: "aprovada", label: "Aprovada" },
  { value: "negada", label: "Negada" },
];
const STATUS_LABEL: Record<RefundStatus, string> = {
  recebida: "Recebida", em_analise: "Em análise", aprovada: "Aprovada",
  estornada: "Reembolso efetivado", negada: "Não aprovada",
};
const DAY_MS = 24 * 60 * 60 * 1000;
const REASON_LABEL: Record<string, string> = {
  nao_entregue: "Pedido não entregue", pedido_incorreto: "Pedido incorreto", item_faltando: "Item faltando",
  pedido_cancelado: "Pedido cancelado", outro: "Outro motivo",
};
type Filter = "todas" | "abertas" | RefundStatus;

function safeFields(fields: RefundRow["fields"]): RefundFields {
  if (typeof fields === "string") {
    try { return JSON.parse(fields) as RefundFields; } catch { return {}; }
  }
  return fields ?? {};
}

function RefundQueuePage() {
  const loadFn = useServerFn(getAdminRefundRequests);
  const saveFn = useServerFn(updateAdminRefundRequest);
  const [rows, setRows] = useState<RefundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<Filter>("abertas");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { status: EditableRefundStatus; message: string; refundCompleted: boolean }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await loadFn();
      setRows(data as RefundRow[]);
    } catch {
      setLoadError("Não foi possível carregar as solicitações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [loadFn]);

  useEffect(() => { void load(); }, [load]);

  const enriched = useMemo(() => rows.map((row) => {
    const fields = safeFields(row.fields);
    const savedStatus = fields.status === "contato_whatsapp" ? "em_analise" : fields.status ?? "recebida";
    const refundCompleted = savedStatus !== "negada" && (fields.refundCompleted === true || savedStatus === "estornada");
    const deadlineAt = Date.parse(row.created_at) + 15 * DAY_MS;
    const deadlineReached = Number.isFinite(deadlineAt) && Date.now() >= deadlineAt;
    const status: RefundStatus = refundCompleted && deadlineReached
      ? "estornada"
      : savedStatus === "estornada" ? "aprovada" : savedStatus;
    return { row, fields, status, refundCompleted };
  }), [rows]);
  const counts = useMemo(() => ({
    abertas: enriched.filter(({ status }) => !["estornada", "negada"].includes(status)).length,
    recebida: enriched.filter(({ status }) => status === "recebida").length,
    em_analise: enriched.filter(({ status }) => status === "em_analise").length,
    aprovada: enriched.filter(({ status }) => status === "aprovada").length,
    estornada: enriched.filter(({ status }) => status === "estornada").length,
    negada: enriched.filter(({ status }) => status === "negada").length,
    aprovadas: enriched.filter(({ status }) => status === "aprovada" || status === "estornada").length,
  }), [enriched]);
  const visible = useMemo(() => enriched.filter(({ row, fields, status }) => {
    const matchesFilter = filter === "todas" || filter === "abertas"
      ? filter === "todas" || !["estornada", "negada"].includes(status)
      : status === filter;
    const needle = search.trim().toLocaleLowerCase("pt-BR");
    const matchesSearch = !needle || [row.nome, row.email, row.whatsapp, fields.publicOrderNumber, fields.protocol].some((value) => value?.toLocaleLowerCase("pt-BR").includes(needle));
    return matchesFilter && matchesSearch;
  }), [enriched, filter, search]);

  async function save(row: RefundRow, status: EditableRefundStatus, message: string, refundCompleted: boolean) {
    setSavingId(row.id);
    setSaveErrors((current) => ({ ...current, [row.id]: "" }));
    setSavedId(null);
    try {
      const updated = await saveFn({ data: { id: row.id, status, message: message.trim() || null, refundCompleted } });
      setRows((current) => current.map((item) => item.id === row.id ? { ...item, fields: { ...safeFields(item.fields), ...(updated.fields as object) } } : item));
      setDrafts((current) => ({ ...current, [row.id]: { status, message, refundCompleted } }));
      setSavedId(row.id);
    } catch {
      setSaveErrors((current) => ({ ...current, [row.id]: "Não foi possível registrar a atualização. Tente novamente." }));
    } finally {
      setSavingId(null);
    }
  }

  function draftFor(id: string, current: RefundStatus, message: string | null | undefined, refundCompleted: boolean) {
    return drafts[id] ?? {
      status: current === "estornada" ? "aprovada" : current,
      message: message ?? "",
      refundCompleted,
    };
  }

  return (
    <AdminShell title="Solicitações de reembolso" subtitle="Revisão manual e registro de atendimento">
      <div className="refund-admin mx-auto max-w-7xl">
        <section className="refund-admin-intro">
          <div>
            <span className="refund-admin-kicker"><span /> CENTRAL DE CUIDADO</span>
            <h2>Pedidos que precisam<br className="hidden sm:block" /> de uma resposta.</h2>
            <p>Analise cada caso com contexto. Atualizar o status aqui registra a decisão de suporte — não executa um pagamento.</p>
          </div>
          <div className="refund-admin-summary">
            <div><strong>{loading ? "—" : counts.abertas}</strong><span>em aberto</span></div>
            <div><strong>{loading ? "—" : counts.aprovadas}</strong><span>aprovadas</span></div>
            <div className="refund-admin-summary-stamp"><ShieldCheck size={20} /><span>Acesso<br />restrito</span></div>
          </div>
        </section>

        <div className="refund-admin-toolbar">
          <div className="refund-admin-tabs" role="tablist" aria-label="Filtrar solicitações">
            {([
              ["abertas", "Em aberto", counts.abertas],
              ["todas", "Todas", rows.length],
              ["recebida", "Recebidas", counts.recebida],
              ["em_analise", "Em análise", counts.em_analise],
              ["aprovada", "Aprovadas", counts.aprovada],
              ["estornada", "Estornadas", counts.estornada],
              ["negada", "Não aprovadas", counts.negada],
            ] as [Filter, string, number][]).map(([value, label, count]) => (
              <button key={value} type="button" role="tab" aria-selected={filter === value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)} data-testid={`tab-refunds-${value}`}>
                {label}<span>{loading ? "–" : count}</span>
              </button>
            ))}
          </div>
          <label className="refund-admin-search"><Search size={16} /><input aria-label="Buscar solicitações" data-testid="input-search-refunds" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome, pedido ou protocolo" /><kbd>/</kbd></label>
          <button className="refund-admin-refresh" onClick={() => void load()} disabled={loading} type="button" aria-label="Atualizar fila" data-testid="button-refresh-refunds"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /><span>Atualizar</span></button>
        </div>

        {loadError ? (
          <div className="refund-admin-state refund-admin-error" role="alert" data-testid="error-refunds-load"><AlertCircle size={24} /><h3>Não carregou desta vez</h3><p>{loadError}</p><button onClick={() => void load()} data-testid="button-retry-refunds">Tentar novamente</button></div>
        ) : loading ? (
          <div className="refund-admin-list" aria-label="Carregando solicitações" data-testid="loading-refunds">
            {[0, 1, 2].map((n) => <div className="refund-admin-skeleton" key={n}><div /><div /><div /></div>)}
          </div>
        ) : visible.length === 0 ? (
          <div className="refund-admin-state" data-testid="empty-refunds"><div className="refund-admin-empty-mark"><Check size={24} /></div><h3>{search ? "Nenhum resultado encontrado" : filter === "abertas" ? "Tudo em dia por aqui" : "Nenhuma solicitação ainda"}</h3><p>{search ? "Tente buscar por outro nome, pedido ou protocolo." : filter === "abertas" ? "Novos pedidos de revisão vão aparecer nesta fila." : "Quando alguém enviar um pedido, ele será listado aqui."}</p>{search && <button type="button" onClick={() => setSearch("")} data-testid="button-clear-refund-search">Limpar busca</button>}</div>
        ) : (
          <div className="refund-admin-list" data-testid="list-refund-requests">
            {visible.map(({ row, fields, status, refundCompleted }) => {
              const draft = draftFor(row.id, status, fields.statusMessage, refundCompleted);
              const isOpen = expanded === row.id;
              const statusText = refundCompleted && status !== "estornada"
                ? "Devolução confirmada · aguardando prazo"
                : STATUS_LABEL[status];
              return (
                <article className={`refund-admin-card ${isOpen ? "expanded" : ""}`} key={row.id} data-testid={`card-refund-${row.id}`}>
                  <button className="refund-admin-card-head" type="button" aria-expanded={isOpen} onClick={() => setExpanded(isOpen ? null : row.id)} data-testid={`button-expand-refund-${row.id}`}>
                    <span className={`refund-admin-badge badge-${status}`} data-testid={`status-refund-${row.id}`}><span />{statusText}</span>
                    <span className="refund-admin-customer"><strong data-testid={`text-refund-customer-${row.id}`}>{row.nome || "Cliente"}</strong><small>{REASON_LABEL[fields.reason ?? ""] ?? "Solicitação de reembolso"} <i>·</i> Pedido <span data-testid={`text-refund-order-${row.id}`}>{fields.publicOrderNumber || row.order_id || "—"}</span></small></span>
                    <span className="refund-admin-protocol"><small>PROTOCOLO</small><strong data-testid={`text-refund-protocol-${row.id}`}>{fields.protocol || "—"}</strong></span>
                    <span className="refund-admin-date">{formatAdminDate(row.created_at)}</span>
                    <ChevronDown size={17} className="refund-admin-chevron" />
                  </button>
                  {isOpen && <div className="refund-admin-detail">
                    <div className="refund-admin-customer-grid">
                      <div><small>E-MAIL</small><span>{row.email || "Não informado"}</span></div>
                      <div><small>WHATSAPP</small><span>{row.whatsapp || "Não informado"}</span></div>
                      <div><small>ABERTO EM</small><span>{formatAdminDate(row.created_at, true)}</span></div>
                      {fields.refundCompletedAt && <div><small>DEVOLUÇÃO CONFIRMADA EM</small><span>{formatAdminDate(fields.refundCompletedAt, true)}</span></div>}
                      {fields.updatedAt && <div><small>ÚLTIMA ATUALIZAÇÃO</small><span>{formatAdminDate(fields.updatedAt, true)}</span></div>}
                    </div>
                    <div className="refund-admin-story"><small>RELATO DO CLIENTE</small><p data-testid={`text-refund-details-${row.id}`}>{fields.details || "Nenhum detalhe adicional informado."}</p></div>
                    <div className="refund-admin-edit">
                      <div className="refund-admin-edit-heading"><div><span className="refund-admin-step">REGISTRO DE ATENDIMENTO</span><h3>Atualizar solicitação</h3></div><span><Clock3 size={14} /> Alterações registradas manualmente</span></div>
                      <div className="refund-admin-edit-grid">
                        <label>Status
                          <select value={draft.status} onChange={(event) => {
                            const status = event.target.value as EditableRefundStatus;
                            setDrafts((current) => ({ ...current, [row.id]: { ...draft, status, refundCompleted: status === "negada" ? false : draft.refundCompleted } }));
                          }} data-testid={`select-status-${row.id}`}>
                            {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </label>
                        <label className="refund-admin-message">Mensagem ao cliente <span>Opcional · até 500 caracteres</span>
                          <textarea maxLength={500} value={draft.message} onChange={(event) => setDrafts((current) => ({ ...current, [row.id]: { ...draft, message: event.target.value } }))} placeholder="Escreva uma atualização clara e acolhedora." data-testid={`input-message-${row.id}`} />
                        </label>
                      </div>
                      <label className="refund-completion-check">
                        <input
                          type="checkbox"
                          checked={draft.refundCompleted}
                          disabled={draft.status === "negada"}
                          onChange={(event) => setDrafts((current) => ({
                            ...current,
                            [row.id]: {
                              ...draft,
                              status: event.target.checked ? "aprovada" : draft.status,
                              refundCompleted: event.target.checked,
                            },
                          }))}
                          data-testid={`checkbox-refund-completed-${row.id}`}
                        />
                        <span>
                          <strong>Confirmo que o valor já foi devolvido ao cliente</strong>
                          <small>Marque somente depois da devolução manual. Ao salvar, o pedido será autorizado; o rastreamento mostrará “Reembolso efetivado” ao completar 15 dias.</small>
                        </span>
                      </label>
                      {draft.refundCompleted && <div className="refund-admin-warning" role="note" data-testid={`warning-refund-gateway-${row.id}`}><AlertCircle size={16} /><p><strong>Ao salvar, a confirmação será registrada.</strong> O status público final só será exibido quando o prazo de 15 dias terminar. Esta ação não movimenta valores.</p></div>}
                      {saveErrors[row.id] && <p className="refund-admin-save-error" role="alert" data-testid={`error-save-refund-${row.id}`}>{saveErrors[row.id]}</p>}
                      {savedId === row.id && <p className="refund-admin-save-success" role="status" data-testid={`success-save-refund-${row.id}`}><Check size={15} /> Registro atualizado. Nenhum pagamento foi processado por esta ação.</p>}
                      <div className="refund-admin-edit-actions"><span>O cliente verá o status e esta mensagem no acompanhamento.</span><button type="button" disabled={savingId === row.id} onClick={() => void save(row, draft.status, draft.message, draft.refundCompleted)} data-testid={`button-save-refund-${row.id}`}>{savingId === row.id ? <><LoaderCircle size={16} className="animate-spin" /> Salvando…</> : <>Salvar atualização <ArrowDownUp size={15} /></>}</button></div>
                    </div>
                  </div>}
                </article>
              );
            })}
          </div>
        )}
        <div className="refund-admin-footnote"><ShieldCheck size={15} /><p>Marque a confirmação somente depois da devolução real. O rastreamento libera o status final no 15º dia. Esta tela não realiza pagamentos.</p></div>
      </div>
    </AdminShell>
  );
}

function formatAdminDate(value: string, full = false) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("pt-BR", full ? { dateStyle: "long", timeStyle: "short" } : { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
