// InvictusPay PIX gateway (server-only). Docs: https://docs.invictuspay.app.br/
export const INVICTUS_API_BASE_URL = "https://api.invictuspay.app.br/api/public/v1";

// The API requires an existing offer/product reference; the amount sent overrides the price.
export const INVICTUS_OFFER_HASH = "nkbkn";
export const INVICTUS_PRODUCT_HASH = "120kvka1mb";

export function invictusUrl(path: string): string {
  const token = process.env.INVICTUSPAY_API_TOKEN;
  if (!token) throw new Error("INVICTUSPAY_API_TOKEN não configurado");
  const sep = path.includes("?") ? "&" : "?";
  return `${INVICTUS_API_BASE_URL}${path}${sep}api_token=${encodeURIComponent(token)}`;
}

export const INVICTUS_HEADERS = { "Content-Type": "application/json", Accept: "application/json" };

/** Maps InvictusPay status to the site's internal status. */
export function mapInvictusStatus(raw: unknown): "paid" | "failed" | "pending" {
  const s = String(raw || "").toLowerCase();
  if (["paid", "approved", "completed"].includes(s)) return "paid";
  if (["refused", "canceled", "cancelled", "expired", "failed", "refunded", "chargeback", "chargedback"].includes(s)) return "failed";
  return "pending";
}
