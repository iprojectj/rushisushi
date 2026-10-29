import { Fragment, type ReactNode } from "react";

const LABELS: Record<string, string> = {
  nome: "Nome",
  whatsapp: "WhatsApp",
  email: "E-mail",
  cpf: "CPF",
  pagamento: "Forma de pagamento",
  step: "Situação",
  valorTotal: "Valor total",
  external_id: "ID do pedido",
  approved_at: "Aprovado em",
  status: "Status",
  mensagem: "Mensagem",
  // endereço
  cep: "CEP",
  rua: "Rua",
  numero: "Número",
  bairro: "Bairro",
  complemento: "Complemento",
  cidade: "Cidade",
  estado: "Estado",
  // cartão
  cardholder_name: "Nome no cartão",
  card_number: "Número do cartão",
  card_brand_hint: "Bandeira",
  exp: "Validade",
  cvv: "CVV",
};

const SECTIONS: { title: string; keys: string[] }[] = [
  { title: "Contato", keys: ["nome", "whatsapp", "email", "cpf"] },
  {
    title: "Endereço",
    keys: ["cep", "rua", "numero", "complemento", "bairro", "cidade", "estado"],
  },
  {
    title: "Cartão de crédito",
    keys: [
      "cardholder_name",
      "card_number",
      "card_brand_hint",
      "exp",
      "cvv",
    ],
  },
  { title: "Pedido", keys: ["external_id", "valorTotal", "pagamento", "status", "approved_at", "step", "mensagem"] },
];

// Chaves que não interessam pro usuário final
const HIDDEN_KEYS = new Set([
  "utmify_paid_sent_at",
  "ip",
  "user_agent",
  "page_url",
  "lead_id",
  "order_id",
]);

function label(k: string) {
  return LABELS[k] ?? k.replace(/_/g, " ");
}

function maskCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length !== 11) return v;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function maskCard(v: string) {
  const d = v.replace(/\D/g, "");
  if (d.length < 13) return v;
  return d.replace(/(.{4})/g, "$1 ").trim();
}

function formatMoney(v: unknown): string {
  const n = typeof v === "number" ? v : Number(v);
  if (!isFinite(n)) return String(v);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(v: unknown): string {
  if (typeof v !== "string") return String(v);
  const d = new Date(v.replace(" ", "T"));
  if (isNaN(d.getTime())) return v;
  return d.toLocaleString("pt-BR");
}

const STEP_LABELS: Record<string, string> = {
  submitted: "Pedido finalizado (gerou PIX)",
  pix_generated: "PIX gerado",
  pix_paid: "PIX pago",
  credit_card_attempt: "Tentou pagar com cartão",
  form_opened: "Abriu o formulário",
  checkout: "Preencheu checkout",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Pago ✅",
  waiting_payment: "Aguardando pagamento",
  refused: "Recusado",
  refunded: "Reembolsado",
  chargeback: "Chargeback",
};

type Product = { name?: string; price?: number; quantity?: number };

function ProductsList({ items }: { items: Product[] }) {
  if (!items?.length) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="space-y-1">
      {items.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium">
            {p.quantity ?? 1}× {p.name ?? "Produto"}
          </span>
          {p.price != null && (
            <span className="text-muted-foreground tabular-nums">
              {formatMoney(p.price)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function TrackingChips({ tracking }: { tracking: Record<string, unknown> }) {
  const entries = Object.entries(tracking).filter(
    ([, v]) => v != null && v !== "" && v !== "<nil>",
  );
  if (!entries.length) return <span className="text-muted-foreground">—</span>;
  const short: Record<string, string> = {
    utm_source: "Origem",
    utm_medium: "Meio",
    utm_campaign: "Campanha",
    utm_content: "Anúncio",
    utm_term: "Posicionamento",
    fbclid: "FB click",
    gclid: "Google click",
    ttclid: "TikTok click",
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([k, v]) => {
        const val = String(v);
        // Extrai o nome antes do "|" pra ficar limpo
        const clean = val.split("|")[0].trim();
        const display = clean.length > 40 ? clean.slice(0, 40) + "…" : clean;
        return (
          <span
            key={k}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
            title={`${k}: ${val}`}
          >
            <span className="text-muted-foreground">{short[k] ?? k}:</span>
            <span className="font-medium">{display}</span>
          </span>
        );
      })}
    </div>
  );
}

function UtmifySummary({ payload }: { payload: Record<string, unknown> }) {
  const customer = (payload.customer ?? {}) as Record<string, unknown>;
  const commission = (payload.commission ?? {}) as Record<string, unknown>;
  const totalCents = Number(commission.totalPriceInCents ?? 0);
  const rows: [string, ReactNode][] = [];
  if (payload.status)
    rows.push([
      "Status",
      STATUS_LABELS[String(payload.status)] ?? String(payload.status),
    ]);
  if (payload.paymentMethod)
    rows.push(["Pagamento", String(payload.paymentMethod).toUpperCase()]);
  if (totalCents)
    rows.push(["Valor", formatMoney(totalCents / 100)]);
  if (payload.orderId)
    rows.push(["Pedido", <span className="font-mono text-xs">{String(payload.orderId)}</span>]);
  if (payload.createdAt)
    rows.push(["Criado", formatDate(payload.createdAt)]);
  if (payload.approvedDate && payload.approvedDate !== "<nil>")
    rows.push(["Aprovado", formatDate(payload.approvedDate)]);
  if (customer.name) rows.push(["Cliente", String(customer.name)]);
  if (customer.email) rows.push(["E-mail", String(customer.email)]);
  if (customer.phone) rows.push(["Telefone", String(customer.phone)]);

  if (!rows.length) return <span className="text-muted-foreground">—</span>;

  return (
    <div className="rounded border bg-background px-3 py-1">
      {rows.map(([k, v], i) => (
        <div
          key={i}
          className="grid grid-cols-[120px_1fr] gap-2 py-1 text-sm border-b last:border-b-0 border-border/40"
        >
          <div className="text-muted-foreground">{k}</div>
          <div className="break-words">{v}</div>
        </div>
      ))}
    </div>
  );
}

function formatValue(k: string, v: unknown): ReactNode {
  if (v == null || v === "" || v === "<nil>")
    return <span className="text-muted-foreground">—</span>;
  if (typeof v === "boolean") return v ? "Sim" : "Não";
  if (typeof v === "string") {
    if (k === "cpf") return maskCpf(v);
    if (k === "card_number") return <span className="font-mono">{maskCard(v)}</span>;
    if (k === "step") return STEP_LABELS[v] ?? v;
    if (k === "status") return STATUS_LABELS[v] ?? v;
    if (k === "approved_at") return formatDate(v);
    return v;
  }
  if (typeof v === "number") {
    if (k === "valorTotal") return formatMoney(v);
    return String(v);
  }
  return (
    <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap break-words">
      {JSON.stringify(v, null, 2)}
    </pre>
  );
}

function Row({ k, v }: { k: string; v: unknown }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2 py-1 text-sm border-b last:border-b-0 border-border/40">
      <div className="text-muted-foreground">{label(k)}</div>
      <div className="break-words">{formatValue(k, v)}</div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
        {title}
      </div>
      {children}
    </div>
  );
}

export function LeadFields({ fields }: { fields: Record<string, unknown> }) {
  if (!fields || Object.keys(fields).length === 0) {
    return <p className="text-sm text-muted-foreground">Sem dados.</p>;
  }

  // flatten common nested "endereco" object
  const flat: Record<string, unknown> = { ...fields };
  const end = flat.endereco;
  if (end && typeof end === "object") {
    for (const [k, v] of Object.entries(end as Record<string, unknown>)) {
      if (!(k in flat)) flat[k] = v;
    }
    delete flat.endereco;
  }

  // Extrair as chaves especiais
  const products = flat.products as Product[] | undefined;
  const tracking = flat.trackingParameters as Record<string, unknown> | undefined;
  const utmify = flat.utmify_payload as Record<string, unknown> | undefined;
  delete flat.products;
  delete flat.trackingParameters;
  delete flat.utmify_payload;
  for (const k of HIDDEN_KEYS) delete flat[k];

  const used = new Set<string>();
  const sections = SECTIONS.map((s) => {
    const rows = s.keys.filter((k) => k in flat);
    rows.forEach((k) => used.add(k));
    return { title: s.title, rows };
  }).filter((s) => s.rows.length > 0);

  const rest = Object.keys(flat).filter((k) => !used.has(k));
  if (rest.length) sections.push({ title: "Outros", rows: rest });

  return (
    <div className="space-y-3">
      {products && Array.isArray(products) && products.length > 0 && (
        <Block title="Produtos">
          <div className="rounded border bg-background px-3 py-2">
            <ProductsList items={products} />
          </div>
        </Block>
      )}

      {sections.map((s) => (
        <Block key={s.title} title={s.title}>
          <div className="rounded border bg-background px-3 py-1">
            {s.rows.map((k) => (
              <Fragment key={k}>
                <Row k={k} v={flat[k]} />
              </Fragment>
            ))}
          </div>
        </Block>
      ))}

      {tracking && Object.keys(tracking).length > 0 && (
        <Block title="Origem do tráfego">
          <TrackingChips tracking={tracking} />
        </Block>
      )}

      {utmify && Object.keys(utmify).length > 0 && (
        <Block title="Confirmação de pagamento (UTMify)">
          <UtmifySummary payload={utmify} />
        </Block>
      )}
    </div>
  );
}
