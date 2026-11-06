// GorillaPay PIX gateway (server-only). Docs: https://gorillapay.tech/docs
export const GORILLAPAY_API_BASE_URL = "https://api.gorillapay.tech/v1/external";

export function getGorillaHeaders(): Record<string, string> {
  // A chave foi salva pelo usuário no secret STRIPE_LIVE_API_KEY.
  const key = process.env.GORILLAPAY_API_KEY || process.env.STRIPE_LIVE_API_KEY;
  if (!key) throw new Error("Chave da GorillaPay não configurada");
  return { "Content-Type": "application/json", Accept: "application/json", "X-API-Key": key };
}

/** Maps GorillaPay status to the site's internal status. */
export function mapGorillaStatus(raw: unknown): "paid" | "failed" | "pending" {
  const s = String(raw || "").toLowerCase();
  if (["approved", "paid"].includes(s)) return "paid";
  if (["failed", "refunded", "cancelled", "canceled", "expired"].includes(s)) return "failed";
  return "pending";
}
