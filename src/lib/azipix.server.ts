// Azipix PIX gateway (server-only). Docs: https://azipix.mintlify.site/introduction
export const AZIPIX_API_BASE_URL = "https://api.azipix.com/api";

export function getAzipixHeaders(): Record<string, string> {
  // Credencial atual: Key ID (x-api-key) + Secret (x-api-secret). O Secret foi salvo pelo usuário em STRIPE_LIVE_API_KEY.
  const keyId = process.env.AZIPIX_KEY_ID || "pk_live_c8e91abe7ecb0d973232";
  const secret = process.env.AZIPIX_API_SECRET || process.env.STRIPE_LIVE_API_KEY;
  if (!secret) throw new Error("Secret da Azipix não configurado");
  return { "Content-Type": "application/json", Accept: "application/json", "x-api-key": keyId, "x-api-secret": secret };
}

/** Maps Azipix status to the site's internal status. */
export function mapAzipixStatus(raw: unknown): "paid" | "failed" | "pending" {
  const s = String(raw || "").toLowerCase();
  if (s === "paid") return "paid";
  if (["failed", "refunded"].includes(s)) return "failed";
  return "pending"; // pending, disputed
}
