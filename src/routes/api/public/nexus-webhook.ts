import { createFileRoute } from "@tanstack/react-router";
import { enviarPedidoParaUtmify, pendingOrders, nowUtcSqlString } from "@/lib/paradise.server";

export const Route = createFileRoute("/api/public/nexus-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json() as any;
          console.log("[NEXUS WEBHOOK] Recebido:", JSON.stringify(body));

          // Nexus envia o ID do pedido e o status
          const orderId = String(body.id || body.order_id);
          const status = String(body.status || "").toLowerCase();

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
              console.error("[NEXUS WEBHOOK] Erro ao buscar pedido no banco:", e);
            }
          }

          if (utmifyPayload) {
            // Mapeamento de status para Utmify
            let utmifyStatus = "waiting_payment";
            if (["paid", "completed", "success", "approved", "paid_out"].includes(status)) {
              utmifyStatus = "approved";
              utmifyPayload.approvedDate = nowUtcSqlString();
            } else if (["canceled", "cancelled", "refused", "expired"].includes(status)) {
              utmifyStatus = "canceled";
            }
            
            utmifyPayload.status = utmifyStatus;
            await enviarPedidoParaUtmify(utmifyPayload);
          }

          return new Response("OK", { status: 200 });
        } catch (error) {
          console.error("[NEXUS WEBHOOK] Erro processar:", error);
          return new Response("Internal Error", { status: 500 });
        }
      },
    },
  },
});
