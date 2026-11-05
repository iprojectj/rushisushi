// InvictusPay v2 PIX gateway (server-only). Docs: https://app.invictuspayv2.com.br/docs
export const INVICTUS_API_BASE_URL = "https://api.invictuspayv2.com.br/api/v1";

export function getInvictusHeaders(): Record<string, string> {
  const key = process.env.INVICTUSPAY_V2_API_KEY;
  if (!key) throw new Error("INVICTUSPAY_V2_API_KEY não configurado");
  return { "Content-Type": "application/json", Accept: "application/json", "X-Api-Key": key };
}

/** Responses may wrap the transaction in `data`/`transaction`. */
export function extractInvictusTx(body: any): any {
  return body?.data?.transaction || body?.transaction || body?.data || body;
}

/** Maps InvictusPay status to the site's internal status. */
export function mapInvictusStatus(raw: unknown): "paid" | "failed" | "pending" {
  const s = String(raw || "").toLowerCase();
  if (s === "paid") return "paid";
  if (["failed", "refused", "expired", "cancelled", "canceled", "refunded", "chargeback"].includes(s)) return "failed";
  return "pending";
}
