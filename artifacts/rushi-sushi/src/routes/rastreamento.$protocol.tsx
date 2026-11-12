import { createFileRoute, Link } from "@tanstack/react-router";
import { useTrackRefundRequest } from "@workspace/api-client-react";
import type { RefundTracking } from "@workspace/api-client-react";
import { ArrowLeft, Check, Clipboard, Clock3, RefreshCw, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { pageHead } from "@/lib/page-head";
import { getRefundProgress } from "@/lib/refund-progress";

const STATUS_LABEL: Record<string, string> = {
  recebida: "Solicitação recebida",
  em_analise: "Em análise pela equipe",
  contato_whatsapp: "Contato pelo WhatsApp",
  aprovada: "Reembolso autorizado",
  estornada: "Reembolso efetivado",
  negada: "Análise concluída",
};

const TRACKING_STEPS = [
  { status: "recebida", label: "Solicitação recebida", description: "Seu pedido de reembolso foi recebido com sucesso." },
  { status: "em_analise", label: "Em análise pela equipe", description: "A equipe está conferindo os dados e o relato enviado." },
  { status: "contato_whatsapp", label: "Contato pelo WhatsApp", description: "A equipe registrou o contato com você pelo WhatsApp." },
  { status: "aprovada", label: "Reembolso autorizado", description: "A equipe autorizou a solicitação e está realizando o procedimento manual." },
  { status: "estornada", label: "Reembolso efetivado", description: "A equipe confirmou que o valor foi devolvido." },
];

const REASON_LABEL: Record<string, string> = {
  nao_entregue: "Pedido não entregue",
  pedido_incorreto: "Pedido incorreto",
  item_faltando: "Item faltando",
  pedido_cancelado: "Pedido cancelado",
  outro: "Outro motivo",
};

const trackingHead = () => {
  const base = pageHead("Acompanhamento do pedido — Rūshī Sushi", "Consulte o andamento da sua solicitação de suporte Rūshī.", true);
  return { ...base, meta: [...base.meta, { name: "referrer", content: "no-referrer" }] };
};

export const Route = createFileRoute("/rastreamento/$protocol")({
  head: trackingHead,
  component: RefundTrackingPage,
});

function RefundTrackingPage() {
  const { protocol: rawProtocol } = Route.useParams();
  const protocol = rawProtocol.toUpperCase();
  const trackRequest = useTrackRefundRequest();
  const [record, setRecord] = useState<RefundTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await trackRequest.mutateAsync({ data: { protocol } });
      setRecord(result);
    } catch (requestError) {
      setRecord(null);
      setError(getApiError(requestError) ?? "Não encontramos este código de acompanhamento.");
    } finally {
      setLoading(false);
    }
  }, [protocol, trackRequest.mutateAsync]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const progress = record
    ? getRefundProgress(record.createdAt, record.deadlineAt, now, record.status)
    : { percent: 5, elapsedDays: 0, remainingDays: 15 };
  const completedStepIndex = record?.status === "negada"
    ? 1
    : TRACKING_STEPS.findIndex((step) => step.status === record?.status);
  const isRefunded = record?.status === "estornada";
  const isRejected = record?.status === "negada";

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(protocol);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="refund-page refund-tracking-page min-h-[100dvh]">
      <header className="refund-header">
        <Link to="/" className="refund-brand" aria-label="Rūshī Sushi — página inicial">
          <img src="/images/logo-rushi-transparente.png" alt="Rūshī Sushi" />
        </Link>
        <div className="refund-header-note"><span className="refund-live-dot" /> Atendimento Rūshī <span className="refund-separator">/</span> Acompanhamento</div>
        <Link className="refund-header-link" to="/solicitar-reembolso"><ArrowLeft size={15} /> Voltar ao suporte</Link>
      </header>

      <section className="refund-tracking-wrap">
        <div className="refund-tracking-heading">
          <p className="refund-eyebrow"><span>ACOMPANHAMENTO DO PEDIDO</span><span className="refund-eyebrow-rule" /></p>
          <h1>Seu reembolso,<br /><em>em acompanhamento.</em></h1>
          <p>Acompanhe o andamento da solicitação e as atualizações feitas pela equipe Rūshī.</p>
        </div>

        {loading ? (
          <div className="refund-tracking-state" role="status" data-testid="loading-refund-tracking">
            <span className="refund-button-loader" />
            <p>Buscando os dados da sua solicitação…</p>
          </div>
        ) : error ? (
          <div className="refund-tracking-state refund-tracking-error" role="alert" data-testid="error-refund-tracking">
            <h2>Não encontramos esse código.</h2>
            <p>{error}</p>
            <Link className="refund-submit refund-tracking-back" to="/solicitar-reembolso">Voltar para o suporte <ArrowLeft size={16} /></Link>
          </div>
        ) : record ? (
          <article className="refund-tracking-card" data-testid="card-refund-tracking">
            <div className="refund-tracking-card-heading">
              <div>
                <p className="refund-eyebrow">CÓDIGO DE ACOMPANHAMENTO</p>
                <div className="refund-tracking-code-row">
                  <h2 data-testid="text-tracking-code">{record.protocol}</h2>
                  <button type="button" onClick={() => void copyCode()} aria-label="Copiar código" data-testid="button-copy-tracking-code">
                    {copied ? <Check size={16} /> : <Clipboard size={16} />} {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>
              <span className={`refund-tracking-status status-${record.status}`} data-testid="status-tracking-request">
                <span /> {STATUS_LABEL[record.status] ?? record.status}
              </span>
            </div>

            <section className="refund-progress-card" aria-label="Progresso do prazo de reembolso">
              <div className="refund-progress-title">
                <div><Clock3 size={17} /><strong>Prazo de reembolso</strong></div>
                <b data-testid="text-tracking-percent">{progress.percent}%</b>
              </div>
              <div className="refund-progress-track" role="progressbar" aria-label="Progresso do prazo de até 15 dias" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}>
                <span style={{ width: `${progress.percent}%` }} />
              </div>
              <div className="refund-progress-caption">
                <span>{progress.elapsedDays} de 15 dias transcorridos</span>
                <strong>
                  {isRefunded
                    ? "Reembolso efetivado"
                    : isRejected
                      ? "Solicitação encerrada"
                      : progress.remainingDays > 0
                        ? (progress.remainingDays === 1 ? "Falta 1 dia" : `Faltam ${progress.remainingDays} dias`)
                        : "Prazo concluído — aguardando confirmação"}
                </strong>
              </div>
              <small className="refund-progress-deadline">Prazo de 15 dias: até {formatDate(record.deadlineAt)}</small>
              <p>A barra começa em 5% e avança diariamente. O status “Reembolso efetivado” só aparece após a equipe confirmar a devolução real do valor.</p>
            </section>

            <div className="refund-tracking-message" role="status" data-testid="text-tracking-message">
              <ShieldCheck size={18} />
              <p>{record.message || "Seu pedido de reembolso foi recebido com sucesso. Ele está em andamento; acompanhe as atualizações por aqui."}</p>
            </div>

            <section className="refund-steps-card" aria-label="Etapas da solicitação">
              <div className="refund-tracking-section-title">
                <span>02</span><div><p className="refund-eyebrow">ANDAMENTO</p><h3>Etapas do reembolso</h3></div>
              </div>
              <ol className="refund-step-list">
                {TRACKING_STEPS.map((step, index) => {
                  const complete = !isRejected && index <= completedStepIndex;
                  const current = !isRefunded && !isRejected && index === completedStepIndex;
                  return (
                    <li className={`refund-step${complete ? " is-complete" : ""}${current ? " is-current" : ""}`} key={step.status} aria-current={current ? "step" : undefined}>
                      <span className="refund-step-marker">{complete ? <Check size={14} /> : index + 1}</span>
                      <div className="refund-step-copy">
                        <strong>{step.label}</strong>
                        <p>{step.description}</p>
                        {current && <small>Etapa atual</small>}
                      </div>
                    </li>
                  );
                })}
              </ol>
              {progress.remainingDays === 0 && !isRefunded && !isRejected && (
                <p className="refund-deadline-note" role="status">O prazo de acompanhamento chegou ao fim. Se a equipe ainda não confirmou a devolução, entre em contato com o atendimento.</p>
              )}
            </section>

            <section className="refund-tracking-details">
              <div className="refund-tracking-section-title">
                <span>03</span><div><p className="refund-eyebrow">DADOS ENVIADOS</p><h3>Confira sua solicitação</h3></div>
              </div>
              <dl className="refund-tracking-grid">
                <div><dt>Nome</dt><dd data-testid="text-tracking-name">{record.customerName || "Não informado"}</dd></div>
                <div><dt>E-mail</dt><dd data-testid="text-tracking-email">{record.email || "Não informado"}</dd></div>
                <div><dt>WhatsApp</dt><dd data-testid="text-tracking-whatsapp">{record.whatsapp || "Não informado"}</dd></div>
                <div><dt>Número do pedido</dt><dd data-testid="text-tracking-order">{record.orderNumber || "Não informado"}</dd></div>
                <div><dt>Motivo</dt><dd data-testid="text-tracking-reason">{record.reason ? REASON_LABEL[record.reason] ?? record.reason : "Não informado"}</dd></div>
                <div><dt>Enviado em</dt><dd data-testid="text-tracking-created-at">{formatDate(record.createdAt)}</dd></div>
              </dl>
              <div className="refund-tracking-story">
                <dt>Relato enviado</dt>
                <dd data-testid="text-tracking-details">{record.details || "Nenhum detalhe adicional informado."}</dd>
              </div>
            </section>

            <footer className="refund-tracking-footer">
              <span>Última atualização: {formatDate(record.updatedAt)}</span>
              <button type="button" onClick={() => void load()} disabled={loading} data-testid="button-refresh-tracking">
                <RefreshCw size={14} /> Atualizar andamento
              </button>
            </footer>
          </article>
        ) : null}

        <p className="refund-tracking-notice">Este acompanhamento é uma página de suporte da Rūshī Sushi. Nenhum pedido de estorno é enviado automaticamente ao Kalangfy.</p>
      </section>

      <footer className="refund-footer"><img src="/images/logo-rushi-transparente.png" alt="" /><span>Rūshī Sushi <i>·</i> A gente se importa com cada pedido.</span></footer>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });
}

function getApiError(error: unknown) {
  if (!error || typeof error !== "object" || !("data" in error)) return null;
  const data = (error as { data?: unknown }).data;
  if (!data || typeof data !== "object" || !("error" in data)) return null;
  const message = (data as { error?: unknown }).error;
  return typeof message === "string" ? message : null;
}
