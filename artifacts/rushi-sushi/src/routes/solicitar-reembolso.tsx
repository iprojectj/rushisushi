import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCreateRefundRequest, useTrackRefundRequest } from "@workspace/api-client-react";
import type { RefundRequestInput } from "@workspace/api-client-react";
import { ArrowRight, CircleHelp, Clock3, LockKeyhole, RotateCcw, Utensils } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { resolvePublicOrderNumberForRefund } from "@/lib/public-order-number.functions";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/solicitar-reembolso")({
  head: () => pageHead("Cuidado com seu pedido — Rūshī Sushi", "Peça uma revisão do seu pedido ou consulte o andamento com seu protocolo.", true),
  component: RefundRequestPage,
});

type Reason = RefundRequestInput["reason"];
type Tracked = { protocol: string; status: string; updatedAt: string; message: string | null };

const REASONS: { value: Reason; label: string }[] = [
  { value: "nao_entregue", label: "Meu pedido não chegou" },
  { value: "pedido_incorreto", label: "Recebi um pedido diferente" },
  { value: "item_faltando", label: "Faltou um item" },
  { value: "pedido_cancelado", label: "Meu pedido foi cancelado" },
  { value: "outro", label: "Outro motivo" },
];
const STATUS: Record<string, { label: string; note: string }> = {
  recebida: { label: "Recebida", note: "Seu pedido de ajuda chegou até nossa equipe." },
  em_analise: { label: "Em análise", note: "Estamos conferindo os detalhes com atenção." },
  contato_whatsapp: { label: "Contato pelo WhatsApp", note: "Nossa equipe registrou o contato e está seguindo com sua solicitação." },
  aprovada: { label: "Aprovada", note: "A solicitação foi aprovada. Nossa equipe compartilhará os próximos passos." },
  estornada: { label: "Reembolso efetivado", note: "A equipe confirmou que o valor foi devolvido." },
  negada: { label: "Não aprovada", note: "Nossa equipe concluiu a análise e deixou uma mensagem sobre a decisão." },
};
const EMPTY = { name: "", email: "", whatsapp: "", orderId: "", reason: "" as Reason | "", details: "" };

type OrderPrefill = {
  name: string;
  whatsapp: string;
  orderId: string;
  transactionId: string;
  amount: string;
};

function readOrderPrefill() {
  try {
    const raw = localStorage.getItem("nobre_pix_data");
    const data = raw ? JSON.parse(raw) as Record<string, unknown> : {};
    const text = (...values: unknown[]) => values
      .find((v) => (typeof v === "string" || typeof v === "number") && String(v).trim() !== "")
      ?.toString().trim() ?? "";
    const possiblePublicNumbers = [
      text(data.publicOrderNumber),
      text(data.public_order_number),
      text(data.orderNumber),
      text(data.orderId),
    ];
    const publicOrderNumber = possiblePublicNumbers.find((value) => /^#RS-[0-9]+$/i.test(value))?.toUpperCase() ?? "";
    const prefill = {
      orderId: publicOrderNumber,
      transactionId: text(data.id, data.transactionId, data.transaction_id, data.order_id),
      amount: text(data.amount, data.total, data.valor),
      name: text(data.name, data.nome, data.customerName) || localStorage.getItem("user_cache_nome")?.trim() || "",
      whatsapp: text(data.phone, data.whatsapp, data.telefone, data.customerPhone) || localStorage.getItem("user_cache_zap")?.trim() || "",
    };
    return prefill.orderId || prefill.transactionId || prefill.name || prefill.whatsapp ? prefill : null;
  } catch {
    return null;
  }
}

function RefundRequestPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [order, setOrder] = useState<OrderPrefill | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [orderNumberError, setOrderNumberError] = useState("");
  const [orderNumberLoading, setOrderNumberLoading] = useState(false);
  const [tracked, setTracked] = useState<Tracked | null>(null);
  const [protocol, setProtocol] = useState("");
  const [trackError, setTrackError] = useState("");
  const requestKey = useRef<string | null>(null);
  const create = useCreateRefundRequest();
  const track = useTrackRefundRequest();
  const resolveOrderNumber = useServerFn(resolvePublicOrderNumberForRefund);

  const prefillOrder = useCallback(async () => {
    const found = readOrderPrefill();
    setOrder(found);
    if (!found) return;
    setOrderNumberError("");
    setForm((current) => ({
      ...current,
      name: current.name || found.name,
      whatsapp: current.whatsapp || found.whatsapp,
      orderId: current.orderId || found.orderId,
    }));
    if (found.orderId || !found.transactionId || !found.whatsapp) return;
    setOrderNumberLoading(true);
    try {
      const publicOrderNumber = await resolveOrderNumber({
        data: { transactionId: found.transactionId, whatsapp: found.whatsapp },
      });
      if (!publicOrderNumber) {
        setOrderNumberError("Não localizamos o número deste pedido. Confira o WhatsApp usado no checkout.");
        return;
      }
      setOrder((current) => current?.transactionId === found.transactionId
        ? { ...current, orderId: publicOrderNumber }
        : current);
      setForm((current) => ({ ...current, orderId: current.orderId || publicOrderNumber }));
      try {
        const stored = localStorage.getItem("nobre_pix_data");
        if (stored) {
          const data = JSON.parse(stored) as Record<string, unknown>;
          if (String(data.id ?? data.transactionId ?? "") === found.transactionId) {
            localStorage.setItem("nobre_pix_data", JSON.stringify({ ...data, publicOrderNumber }));
          }
        }
      } catch {
        // The displayed value remains usable if browser storage is unavailable.
      }
    } catch {
      setOrderNumberError("Não conseguimos recuperar o número do pedido. Tente recarregar esta página.");
    } finally {
      setOrderNumberLoading(false);
    }
  }, [resolveOrderNumber]);
  useEffect(() => { void prefillOrder(); }, [prefillOrder]);

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    if (!requestKey.current) requestKey.current = crypto.randomUUID();
    try {
      const result = await create.mutateAsync({
        data: {
          requestKey: requestKey.current,
          name: form.name.trim(),
          email: form.email.trim(),
          whatsapp: form.whatsapp.trim(),
          orderId: form.orderId.trim(),
          reason: form.reason as Reason,
          details: form.details.trim(),
        },
      });
      setSubmitError("");
      await navigate({
        to: "/rastreamento/$protocol",
        params: { protocol: result.protocol },
      });
      requestKey.current = null;
    } catch (error) {
      // Keep the same request key so a retry cannot create a duplicate protocol.
      setSubmitError(errorMessage(error) ?? "Não foi possível enviar agora. Seus dados continuam aqui; tente novamente em instantes.");
    }
  }

  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTrackError("");
    setTracked(null);
    try {
      const result = await track.mutateAsync({ data: { protocol: protocol.trim() } });
      setTracked({ protocol: result.protocol, status: result.status, updatedAt: result.updatedAt, message: result.message });
    } catch (error) {
      setTrackError(errorMessage(error) ?? "Não conseguimos consultar agora. Confira o protocolo e tente novamente.");
    }
  }

  const inputClass = "refund-input";
  return (
    <main className="refund-page min-h-[100dvh]">
      <header className="refund-header">
        <a href="/" className="refund-brand" data-testid="link-rushi-home" aria-label="Rūshī Sushi — página inicial">
          <img src="/images/logo-rushi-transparente.png" alt="Rūshī Sushi" />
        </a>
        <div className="refund-header-note"><span className="refund-live-dot" /> Atendimento Rūshī <span className="refund-separator">/</span> Pedidos</div>
        <a className="refund-header-link" href="#consultar" data-testid="link-consultar-protocolo">Já tenho um protocolo <ArrowRight size={15} /></a>
      </header>

      <section className="refund-hero">
        <div className="refund-hero-copy">
          <p className="refund-eyebrow"><span>SUPORTE AO PEDIDO</span><span className="refund-eyebrow-rule" /></p>
          <h1>Vamos cuidar<br />disso <em>juntos.</em></h1>
          <p className="refund-lede">Sentimos que algo não saiu como deveria. Conte pra gente o que aconteceu — uma pessoa da nossa equipe vai olhar seu caso com atenção.</p>
          {order?.orderId && (
            <div className="refund-order-chip" data-testid="text-prefilled-order">
              <span className="refund-order-mark"><Utensils size={17} /></span>
              <span><small>PEDIDO IDENTIFICADO</small><strong>{order.orderId}</strong></span>
              {order.amount && <b>{formatAmount(order.amount)}</b>}
            </div>
          )}
          <div className="refund-trust-row">
            <span><LockKeyhole size={15} /> Seus dados protegidos</span>
            <span><Clock3 size={15} /> Análise feita por uma pessoa</span>
          </div>
        </div>
      </section>

      <section className="refund-content">
        <div className="refund-form-column">
          <form className="refund-form" onSubmit={submitRequest}>
              <div className="refund-section-heading">
                <div className="refund-step">01</div>
                <div><p className="refund-eyebrow">SOLICITAÇÃO</p><h2>Conte o que aconteceu</h2></div>
              </div>
              <p className="refund-form-intro">Preencha os dados do pedido para que a gente encontre tudo rapidinho.</p>
              {order && <button type="button" className="refund-prefill" onClick={prefillOrder} data-testid="button-find-order">
                <RotateCcw size={15} /> Preencher com dados do meu pedido
              </button>}
              <div className="refund-field-grid">
                <label className="refund-field">Seu nome
                  <input className={inputClass} data-testid="input-refund-name" autoComplete="name" required minLength={2} maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Como podemos te chamar?" />
                </label>
                <label className="refund-field">E-mail
                  <input className={inputClass} data-testid="input-refund-email" type="email" autoComplete="email" required maxLength={200} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="voce@exemplo.com" />
                </label>
                <label className="refund-field">WhatsApp
                  <input className={inputClass} data-testid="input-refund-whatsapp" type="tel" autoComplete="tel" required minLength={10} maxLength={20} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="(11) 99999-9999" />
                </label>
                <label className="refund-field">Número do pedido
                  <input className={inputClass} data-testid="input-refund-order" required maxLength={120} value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} placeholder="Ex.: #RS-2841" />
                  {orderNumberLoading && <span className="refund-field-hint" role="status" data-testid="loading-order-number">Localizando o número do pedido…</span>}
                  {orderNumberError && <span className="refund-error" role="alert" data-testid="error-prefill-order-number">{orderNumberError}</span>}
                </label>
              </div>
              <label className="refund-field">O que aconteceu?
                <select className={inputClass} data-testid="select-refund-reason" required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value as Reason })}>
                  <option value="" disabled>Selecione o motivo</option>
                  {REASONS.map((reason) => <option key={reason.value} value={reason.value}>{reason.label}</option>)}
                </select>
              </label>
              <label className="refund-field">Conte um pouco mais
                <textarea className={`${inputClass} refund-textarea`} data-testid="input-refund-details" required minLength={5} maxLength={1000} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Se puder, conte o que faltou ou o que aconteceu com a entrega." />
                <span className="refund-character-count">{form.details.length}/1000</span>
              </label>
              {submitError && <p className="refund-error" role="alert" data-testid="error-refund-submit">{submitError}</p>}
              <button className="refund-submit" type="submit" disabled={create.isPending} data-testid="button-submit-refund">
                {create.isPending ? <><span className="refund-button-loader" /> Enviando sua solicitação…</> : <>Enviar para análise <ArrowRight size={17} /></>}
              </button>
              <p className="refund-submit-note">Sua solicitação será revisada manualmente. O envio não realiza um estorno automaticamente.</p>
          </form>
        </div>

        <aside className="refund-sidebar">
          <div className="refund-timeline">
            <p className="refund-eyebrow">O QUE ACONTECE AGORA</p>
            <div className="refund-timeline-step"><span>1</span><div><strong>Você conta pra gente</strong><p>Os detalhes ajudam a localizar e entender seu pedido.</p></div></div>
            <div className="refund-timeline-step"><span>2</span><div><strong>A equipe Rūshī revisa</strong><p>Uma pessoa analisa o caso e, se precisar, fala com você.</p></div></div>
            <div className="refund-timeline-step"><span>3</span><div><strong>Você acompanha por aqui</strong><p>Guarde seu protocolo para consultar sempre que quiser.</p></div></div>
          </div>
          <div id="consultar" className="refund-lookup">
            <div className="refund-lookup-title"><span><CircleHelp size={17} /></span><div><p className="refund-eyebrow">JÁ ABRIU UM PEDIDO?</p><h3>Acompanhe por protocolo</h3></div></div>
            <form onSubmit={lookup}>
              <label className="refund-field">Código de acompanhamento
                <input className={inputClass} data-testid="input-track-protocol" required minLength={8} maxLength={40} autoCapitalize="characters" value={protocol} onChange={(e) => setProtocol(e.target.value.toUpperCase())} placeholder="Ex.: NV49IAAC" />
              </label>
              <button type="submit" className="refund-lookup-button" disabled={track.isPending} data-testid="button-track-refund">
                {track.isPending ? "Consultando…" : <>Consultar andamento <ArrowRight size={15} /></>}
              </button>
            </form>
            {trackError && <p className="refund-error" role="alert" data-testid="error-track-refund">{trackError}</p>}
            {track.isError && !trackError && <p className="refund-error" role="alert" data-testid="error-track-service">Não conseguimos consultar agora. Tente novamente em alguns instantes.</p>}
            {tracked && <div className="refund-track-result" role="status" data-testid="status-track-result">
              <div className="refund-track-result-top"><span className={`refund-status-dot status-${tracked.status}`} /><strong>{STATUS[tracked.status]?.label ?? tracked.status}</strong><small>{tracked.protocol}</small></div>
              <p>{tracked.message || STATUS[tracked.status]?.note || "A equipe Rūshī atualizou sua solicitação."}</p>
              <small>Atualizado em {formatDate(tracked.updatedAt)}</small>
            </div>}
          </div>
          <p className="refund-help-note">Precisa de uma mão? <strong>Guarde seu protocolo — nossa equipe responde por aqui.</strong></p>
        </aside>
      </section>
      <footer className="refund-footer"><img src="/images/logo-rushi-transparente.png" alt="" /><span>Rūshī Sushi <i>·</i> A gente se importa com cada pedido.</span></footer>
    </main>
  );
}

function formatAmount(value: string) {
  const numeric = Number(value.replace(/[^\d,.-]/g, "").replace(",", "."));
  return Number.isFinite(numeric) ? numeric.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : value;
}
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
}
function errorMessage(error: unknown) {
  if (!error || typeof error !== "object" || !("data" in error)) return null;
  const data = (error as { data?: unknown }).data;
  if (!data || typeof data !== "object" || !("error" in data)) return null;
  const message = (data as { error?: unknown }).error;
  return typeof message === "string" ? message : null;
}
