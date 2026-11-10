// Kalangfy PIX gateway (server-only).
export const KALANGFY_API_BASE_URL = "https://kalangfy.lovable.app/api/public/v1";

export function getKalangfyHeaders(): Record<string, string> {
  const key = process.env.KALANGFY_API_KEY;
  if (!key) throw new Error("Chave da Kalangfy não configurada");
  return { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${key}` };
}

/** Some APIs wrap the charge in `data`/`charge`; accept all shapes. */
export function extractKalangfyCharge(body: any): any {
  return body?.data?.charge ?? body?.charge ?? body?.data ?? body ?? {};
}

export function mapKalangfyStatus(raw: unknown): "paid" | "failed" | "pending" {
  const s = String(raw || "").toLowerCase();
  if (["paid", "approved", "completed", "confirmed", "succeeded"].includes(s)) return "paid";
  if (["failed", "refunded", "cancelled", "canceled", "expired", "refused"].includes(s)) return "failed";
  return "pending";
}
