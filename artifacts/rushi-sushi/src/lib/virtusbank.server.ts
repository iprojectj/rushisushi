// VirtusBank PIX gateway (server-only). Docs: https://docs.virtusbank.co
export const VIRTUSBANK_API_BASE_URL = "https://api.virtusbank.co/v1.0";

export function getVirtusHeaders(): Record<string, string> {
  const key = process.env.VIRTUSBANK_API_KEY;
  if (!key) throw new Error("VIRTUSBANK_API_KEY não configurada");
  return { "Content-Type": "application/json", "x-api-key": key };
}

/** Maps VirtusBank status to the site's internal status. */
export function mapVirtusStatus(raw: unknown): "paid" | "failed" | "pending" {
  const s = String(raw || "").toLowerCase();
  if (s === "completed") return "paid";
  if (["refused", "cancelled", "cancelled_anti_fraud", "failed", "refunded", "chargeback"].includes(s)) return "failed";
  return "pending";
}
