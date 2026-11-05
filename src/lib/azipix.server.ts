// Azipix PIX gateway (server-only). Docs: https://azipix.mintlify.site/introduction
export const AZIPIX_API_BASE_URL = "https://api.azipix.com/api";

export function getAzipixHeaders(): Record<string, string> {
  const key = process.env.AZIPIX_API_KEY;
  if (!key) throw new Error("AZIPIX_API_KEY não configurado");
  return { "Content-Type": "application/json", Accept: "application/json", "x-api-key": key };
}

/** Maps Azipix status to the site's internal status. */
export function mapAzipixStatus(raw: unknown): "paid" | "failed" | "pending" {
  const s = String(raw || "").toLowerCase();
  if (s === "paid") return "paid";
  if (["failed", "refunded"].includes(s)) return "failed";
  return "pending"; // pending, disputed
}
