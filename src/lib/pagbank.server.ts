// PagBank Orders API v4 — PIX transparente (server-only).
// Docs: https://developer.pagbank.com.br/reference/criar-pedido
export const PAGBANK_API_BASE_URL = "https://api.pagseguro.com";

export function getPagBankHeaders(): Record<string, string> {
  const token = process.env.PAGBANK_TOKEN;
  if (!token) throw new Error("Token do PagBank não configurado");
  return { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` };
}

/** Pedido PagBank é pago quando alguma cobrança está PAID. */
export function mapPagBankOrder(order: any): "paid" | "failed" | "pending" {
  const charges: any[] = Array.isArray(order?.charges) ? order.charges : [];
  if (charges.some((c) => String(c?.status).toUpperCase() === "PAID")) return "paid";
  if (charges.some((c) => ["DECLINED", "CANCELED"].includes(String(c?.status).toUpperCase()))) return "failed";
  const exp = order?.qr_codes?.[0]?.expiration_date;
  if (exp && Date.parse(exp) < Date.now()) return "failed";
  return "pending";
}
