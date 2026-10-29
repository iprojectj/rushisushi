// Cooud Gateway helpers (MX). Docs: https://docs.cooud.com/public-doc
// Base URL: https://api.cooud.com/v2
// Auth: Bearer <COOUD_API_KEY>
// Webhook signature: X-Cooud-Signature: t=<epoch>,v1=<hmac_sha256(secret, `${t}.${rawBody}`)>

import { createHmac, timingSafeEqual } from "node:crypto";

export const COOUD_API_URL = "https://api.cooud.com/v2";
export const UTMIFY_API_URL =
  "https://api.utmify.com.br/api-credentials/orders";

// ============ CONFIG DO PRODUTO MX ============
export const MX_PRODUCT = {
  name: "Combo Rushi Sushi México",
  amount_cents: 24900, // 249 MXN
  currency: "MXN" as const,
};

export function getCooudApiKey() {
  return process.env.COOUD_API_KEY || "";
}
export function getCooudWebhookSecret() {
  return process.env.COOUD_WEBHOOK_SECRET || "";
}
export function getUtmifyMxToken() {
  return process.env.UTMIFY_MX_TOKEN || "";
}

// ============ CHECKOUT SESSION ============
export interface CooudCheckoutInput {
  email: string;
  name: string;
  amount_cents?: number;
  productName?: string;
  success_url: string;
  cancel_url: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface CooudCheckoutSession {
  id: string;
  url: string;
  status: string;
  amount: number;
  currency: string;
}

export async function criarCheckoutSession(
  input: CooudCheckoutInput
): Promise<CooudCheckoutSession> {
  const apiKey = getCooudApiKey();
  if (!apiKey) throw new Error("COOUD_API_KEY não configurada");

  const body = {
    ui_mode: "hosted" as const,
    success_url: input.success_url,
    cancel_url: input.cancel_url,
    customer_email: input.email,
    line_items: [
      {
        name: input.productName ?? MX_PRODUCT.name,
        amount: input.amount_cents ?? MX_PRODUCT.amount_cents,
        currency: MX_PRODUCT.currency,
        quantity: 1,
      },
    ],
    metadata: input.metadata ?? {},
  };

  const res = await fetch(`${COOUD_API_URL}/checkout-sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `mx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    },
    body: JSON.stringify(body),
  });

  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[COOUD] Erro ao criar checkout:", res.status, data);
    throw new Error(
      `Cooud checkout falhou (${res.status}): ${data?.error?.message ?? "erro desconhecido"}`
    );
  }

  return {
    id: data.id,
    url: data.url,
    status: data.status,
    amount: data.amount,
    currency: data.currency,
  };
}

// ============ WEBHOOK SIGNATURE ============
export function verificarAssinaturaCooud(
  rawBody: string,
  header: string | null,
  toleranceSec = 300
): boolean {
  const secret = getCooudWebhookSecret();
  if (!secret || !header) return false;

  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, ...rest] = p.trim().split("=");
      return [k, rest.join("=")];
    })
  );
  const t = Number(parts.t);
  const v1 = String(parts.v1 || "");
  if (!t || !v1) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - t) > toleranceSec) return false;

  const expected = createHmac("sha256", secret)
    .update(`${t}.${rawBody}`)
    .digest("hex");

  try {
    const a = Buffer.from(v1, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ============ UTMIFY MX ============
type UtmifyStatus = "waiting_payment" | "paid" | "refused" | "refunded";

export interface UtmifyMxPayload {
  orderId: string;
  platform?: string;
  paymentMethod?: "credit_card" | "pix" | "boleto";
  status: UtmifyStatus;
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
  trackingParameters: {
    src: string | null;
    sck: string | null;
    utm_source: string | null;
    utm_campaign: string | null;
    utm_medium: string | null;
    utm_content: string | null;
    utm_term: string | null;
  };
  commission: {
    totalPriceInCents: number;
    gatewayFeeInCents: number;
    userCommissionInCents: number;
    currency: "MXN";
  };
  isTest?: boolean;
}

export async function enviarUtmifyMx(
  payload: UtmifyMxPayload
): Promise<{ ok: boolean; status: number; body: string }> {
  const token = getUtmifyMxToken();
  if (!token) {
    console.warn("[UTMIFY-MX] Ignorado. Token não configurado.");
    return { ok: false, status: 0, body: "sem token" };
  }

  // Anexar TikTok Pixel Token se disponível (usando o mesmo token global)
  const tiktokToken = "9fd0aa0cceb1fc037e3bfa82fbee3a3eb7720bc1";
  const finalPayload = { 
    ...payload,
    tiktokPixelToken: tiktokToken 
  };

  try {
    const res = await fetch(UTMIFY_API_URL, {
      method: "POST",
      headers: {
        "x-api-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(finalPayload),
    });
    const body = await res.text().catch(() => "");
    if (!res.ok) {
      console.error(`[UTMIFY-MX] ${res.status}:`, body);
      return { ok: false, status: res.status, body };
    }
    console.log(`[UTMIFY-MX] Pedido ${payload.orderId} status=${payload.status}`);
    return { ok: true, status: res.status, body };
  } catch (e: any) {
    console.error("[UTMIFY-MX] Erro:", e?.message ?? e);
    return { ok: false, status: 0, body: String(e?.message ?? e) };
  }
}

export function nowSql() {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}
