/**
 * Records that an order was paid directly on its checkout row
 * (lead_submissions.fields.payment_status / paid_at), so the admin
 * dashboard can compute real revenue. Idempotent and never throws.
 */
export async function marcarPedidoPago(orderId: string): Promise<void> {
  if (!orderId) return;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("lead_submissions")
      .select("id, fields")
      .eq("order_id", orderId)
      .eq("form_type", "checkout")
      .maybeSingle();
    if (!row) return;
    const fields = (row.fields ?? {}) as Record<string, unknown>;
    if (fields.payment_status === "paid") return;
    await supabaseAdmin
      .from("lead_submissions")
      .update({ fields: { ...fields, payment_status: "paid", paid_at: new Date().toISOString() } })
      .eq("id", row.id);
  } catch (e) {
    console.error("[order-status] falha ao marcar pedido pago:", e);
  }
}
