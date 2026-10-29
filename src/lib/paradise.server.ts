// Paradise Gateway helpers. Docs: https://multi.paradisepags.com/documentation

export const PARADISE_API_BASE_URL = "https://multi.paradisepags.com/api/v1";
export const UTMIFY_API_URL = "https://api.utmify.com.br/api-credentials/orders";

// Chaves e IDs fornecidos
export const PARADISE_ACCOUNT_ID = "4838";
export const PARADISE_PRODUCT_HASH = "prod_d9f9e0dcba8c763c";

// Rate limit map
const rateLimit = new Map<string, { count: number; lastReset: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const state = rateLimit.get(key) || { count: 0, lastReset: now };

  if (now - state.lastReset > windowMs) {
    state.count = 0;
    state.lastReset = now;
  }

  state.count++;
  rateLimit.set(key, state);

  return {
    allowed: state.count <= limit,
    retryAfterSec: Math.ceil(Math.max(0, (state.lastReset + windowMs - now) / 1000)),
  };
}

export function getParadiseHeaders() {
  const apiKey = process.env.PARADISE_API_KEY || "sk_786bdaeb9a5c572a3e54b82a51b6462eb637f216822e12c11bcdf3c24dc066ce";
  return {
    "X-API-Key": apiKey,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
}

export function getUtmifyToken() {
  return process.env.UTMIFY_API_TOKEN || "tmcdkonbNfRHBFdD6BbzBs1fIONvwpwN3Lk8";
}

export function getTiktokPixelToken() {
  return "9fd0aa0cceb1fc037e3bfa82fbee3a3eb7720bc1";
}

// Reutilizando lógica de normalização da Utmify do arquivo anterior
type UtmifyPaymentMethod = "credit_card" | "boleto" | "pix" | "paypal" | "free_price";
type UtmifyStatus = "waiting_payment" | "paid" | "refused" | "refunded" | "chargedback";

interface UtmifyPayload {
  orderId: string;
  platform: string;
  paymentMethod: UtmifyPaymentMethod;
  status: UtmifyStatus | "pending" | "failed";
  createdAt: string;
  approvedDate: string | null;
  refundedAt: string | null;
  customer: {
    name: string;
    email: string;
    phone: string | null;
    document: string | null;
    country?: string;
    ip?: string | null;
  };
  products: Array<{
    id: string;
    name: string;
    planId: string | null;
    planName: string | null;
    quantity: number;
    priceInCents: number;
  }>;
  trackingParameters: any;
  commission: {
    totalPriceInCents: number;
    gatewayFeeInCents: number;
    userCommissionInCents: number;
    currency?: string;
  };
}

function normalizeUtmifyStatus(status: unknown): UtmifyStatus {
  const normalized = String(status || "").toLowerCase();
  if (["paid", "success", "completed", "approved"].includes(normalized)) return "paid";
  if (normalized === "refunded") return "refunded";
  if (["chargedback", "chargeback"].includes(normalized)) return "chargedback";
  if (["failed", "refused", "denied"].includes(normalized)) return "refused";
  return "waiting_payment";
}

function normalizeUtmifyPayload(payload: UtmifyPayload): any {
  const customer = { ...(payload?.customer ?? {}) };
  const rawIp = String(customer.ip || "").split(",")[0].trim();
  
  return {
    orderId: String(payload.orderId),
    platform: payload.platform || "RushiSushi",
    paymentMethod: payload.paymentMethod || "pix",
    status: normalizeUtmifyStatus(payload.status),
    createdAt: payload.createdAt,
    approvedDate: payload.approvedDate ?? null,
    refundedAt: payload.refundedAt ?? null,
    customer: {
      name: customer.name || "Cliente Rushi Sushi",
      email: customer.email,
      phone: customer.phone ? String(customer.phone).replace(/\D/g, "") : null,
      document: customer.document ? String(customer.document).replace(/\D/g, "") : null,
      country: customer.country || "BR",
      ip: rawIp || "127.0.0.1",
    },
    products: payload.products,
    trackingParameters: payload.trackingParameters,
    commission: {
      totalPriceInCents: Number(payload.commission.totalPriceInCents),
      gatewayFeeInCents: 0,
      userCommissionInCents: Number(payload.commission.totalPriceInCents),
      currency: "BRL",
    },
  };
}

export const pendingOrders: Record<string, any> = {};

export async function enviarPedidoParaUtmify(payload: UtmifyPayload): Promise<any> {
  const token = getUtmifyToken();
  if (!token) return { ok: false, body: "Token não configurado" };
  const payloadFinal = normalizeUtmifyPayload(payload);
  
  // Anexar TikTok Pixel Token se disponível
  const tiktokToken = getTiktokPixelToken();
  if (tiktokToken) {
    payloadFinal.tiktokPixelToken = tiktokToken;
  }

  try {
    const res = await fetch(UTMIFY_API_URL, {
      method: "POST",
      headers: { "x-api-token": token, "Content-Type": "application/json" },
      body: JSON.stringify(payloadFinal),
    });
    return { ok: res.ok, status: res.status, body: await res.text().catch(() => "") };
  } catch (error: any) {
    return { ok: false, body: error?.message ?? String(error) };
  }
}

export function nowUtcSqlString() {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

export function gerarEmailRandomico() {
  return `cliente.${Date.now()}.${Math.floor(Math.random() * 9999)}@rushisushi.site`;
}

export function gerarCpfValido(): string {
  const rand = (n: number) => Math.floor(Math.random() * n);
  const n = Array.from({ length: 9 }, () => rand(10));
  const calcDv = (base: number[]) => {
    const soma = base.reduce((acc, val, idx) => acc + val * (base.length + 1 - idx), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  const dv1 = calcDv(n);
  const dv2 = calcDv([...n, dv1]);
  return [...n, dv1, dv2].join("");
}

export function limparNomeProduto(nome: string): string {
  // Remove prefixo "Combo" (case insensitive, opcionalmente com espaço)
  let limpo = nome.replace(/^combo\s*/i, "");
  // Remove informações entre parênteses
  limpo = limpo.replace(/\s*\([^)]*\)/g, "");
  return limpo.trim();
}

export function montarDescricaoPedido(products: any[] | undefined): string {
  if (!products || products.length === 0) return "Pedido Rushi Sushi";
  const names = products.map(p => limparNomeProduto(p.name)).join(", ");
  return names.length > 180 ? names.substring(0, 177) + "..." : names;
}