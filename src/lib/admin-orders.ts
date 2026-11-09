/** Browser-safe helpers to read orders (checkout rows) for the admin panel. */

export interface CheckoutRow {
  id: string;
  lead_id: string | null;
  order_id: string | null;
  created_at: string;
  nome: string | null;
  fields: Record<string, unknown>;
}

export interface OrderProduct {
  name: string;
  price: number;
  quantity: number;
}

export function orderValue(r: CheckoutRow): number {
  const v = Number(r.fields?.valorTotal ?? 0);
  if (isFinite(v) && v > 0) return v;
  const cents = Number(
    (r.fields?.utmify_payload as { commission?: { totalPriceInCents?: number } } | undefined)?.commission
      ?.totalPriceInCents ?? 0,
  );
  return isFinite(cents) ? cents / 100 : 0;
}

/** Paid = confirmed by gateway (payment_status) or legacy UTMify "paid" flag. */
export function isPaid(r: CheckoutRow): boolean {
  return r.fields?.payment_status === "paid" || r.fields?.utmify_paid_sent === true;
}

export function orderProducts(r: CheckoutRow): OrderProduct[] {
  const p = r.fields?.products;
  return Array.isArray(p) ? (p as OrderProduct[]) : [];
}

export function customerName(r: CheckoutRow): string {
  const n =
    r.nome ??
    (r.fields?.utmify_payload as { customer?: { name?: string } } | undefined)?.customer?.name ??
    "";
  return n.trim() || "Cliente";
}

export const GATEWAY_LABELS: Record<string, string> = {
  paradise: "Paradise Pags",
  pagbank: "PagBank",
  gorilla: "GorillaPay",
  azipix: "Azipix",
  invictus: "InvictusPay",
  infinitepay: "InfinitePay",
};

export function gatewayLabel(g: unknown): string {
  const k = String(g ?? "");
  return GATEWAY_LABELS[k] ?? (k || "—");
}

export const fmtBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const fmtPct = (n: number) => `${n.toFixed(1).replace(".", ",")}%`;
