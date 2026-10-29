import { createFileRoute } from "@tanstack/react-router";
import { enviarPedidoParaUtmify, pendingOrders, nowUtcSqlString } from "@/lib/paradise.server";

export const Route = createFileRoute("/api/public/paradise-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json() as any;
          console.log("[PARADISE WEBHOOK] Recebido:", JSON.stringify(body));

          const { transaction_id, status } = body;
          const orderId = String(transaction_id || body.id);

          if (!orderId) return new Response("Missing order ID", { status: 400 });

          let utmifyPayload = pendingOrders[orderId];

          if (!utmifyPayload) {
            try {
              const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
              const { data } = await supabaseAdmin
                .from("lead_submissions")
                .select("fields")
                .eq("order_id", orderId)
                .single();
              
              const fields = data?.fields as any;
              if (fields?.utmify_payload) {
                utmifyPayload = fields.utmify_payload;
              }
            } catch (e) {
              console.error("[PARADISE WEBHOOK] Erro ao buscar pedido no banco:", e);
            }
          }

          if (utmifyPayload) {
            utmifyPayload.status = status;
            if (["paid", "completed", "success", "approved"].includes(String(status).toLowerCase())) {
              utmifyPayload.approvedDate = nowUtcSqlString();
            }
            await enviarPedidoParaUtmify(utmifyPayload);
          }

          return new Response("OK", { status: 200 });
        } catch (error) {
          console.error("[PARADISE WEBHOOK] Erro processar:", error);
          return new Response("Internal Error", { status: 500 });
        }
      },
    },
  },
});