import { createFileRoute } from "@tanstack/react-router";
import { PARADISE_API_BASE_URL, getParadiseHeaders } from "@/lib/paradise.server";
import { NEXUS_API_BASE_URL, getNexusHeaders } from "@/lib/nexus.server";

export const Route = createFileRoute("/verificar-status/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const orderId = params.id;
          
          // 1. Tentar descobrir o gateway a partir do banco de dados (lead_submissions)
          let gateway = "paradise";
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { data } = await supabaseAdmin
              .from("lead_submissions")
              .select("fields")
              .eq("order_id", orderId)
              .maybeSingle();
            
            if (data?.fields && (data.fields as any).gateway) {
              gateway = (data.fields as any).gateway;
            }
          } catch (e) {
            console.error("[verificar-status] Erro ao buscar gateway no banco:", e);
          }

          let statusFinal = "pending";

          if (gateway === "nexus") {
            const res = await fetch(`${NEXUS_API_BASE_URL}/orders/${orderId}`, {
              headers: getNexusHeaders(),
            });
            const data: any = await res.json().catch(() => ({}));
            const rawStatus = String(data.status || "").toLowerCase();
            
            if (["paid", "completed", "success", "approved", "paid_out"].includes(rawStatus)) {
              statusFinal = "paid";
            } else if (["canceled", "cancelled", "refused", "expired"].includes(rawStatus)) {
              statusFinal = "failed";
            }
          } else {
            // Paradise Pags
            const res = await fetch(`${PARADISE_API_BASE_URL}/query.php?action=get_transaction&id=${orderId}`, {
              headers: getParadiseHeaders(),
            });
            const data: any = await res.json().catch(() => ({}));
            const rawStatus = String(data.status || "").toLowerCase();

            if (["paid", "completed", "success", "approved"].includes(rawStatus)) {
              statusFinal = "paid";
            } else if (["expired", "cancelled", "refused", "failed"].includes(rawStatus)) {
              statusFinal = "failed";
            }
          }

          return new Response(JSON.stringify({ status: statusFinal }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          console.error("[verificar-status] Erro:", error);
          return new Response(JSON.stringify({ status: "error" }), { status: 500 });
        }
      },
    },
  },
});
