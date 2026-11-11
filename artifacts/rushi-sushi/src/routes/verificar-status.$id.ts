import { createFileRoute } from "@tanstack/react-router";
import { PARADISE_API_BASE_URL, getParadiseHeaders } from "@/lib/paradise.server";
import { VIRTUSBANK_API_BASE_URL, getVirtusHeaders, mapVirtusStatus } from "@/lib/virtusbank.server";
import { INVICTUS_API_BASE_URL, extractInvictusTx, getInvictusHeaders, mapInvictusStatus } from "@/lib/invictuspay.server";
import { AZIPIX_API_BASE_URL, getAzipixHeaders, mapAzipixStatus } from "@/lib/azipix.server";
import { KALANGFY_API_BASE_URL, extractKalangfyCharge, getKalangfyHeaders, mapKalangfyStatus } from "@/lib/kalangfy.server";
import { GORILLAPAY_API_BASE_URL, getGorillaHeaders, mapGorillaStatus } from "@/lib/gorillapay.server";

export const Route = createFileRoute("/verificar-status/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const orderId = params.id;
          
          // 1. Tentar descobrir o gateway a partir do banco de dados (lead_submissions)
          let gateway: string;
          {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { data, error } = await supabaseAdmin
              .from("lead_submissions")
              .select("fields")
              .eq("order_id", orderId)
              .eq("form_type", "checkout")
              .maybeSingle();
            if (error) throw error;
            if (!data) {
              return Response.json({ status: "not_found" }, { status: 404 });
            }
            gateway = data.fields?.gateway;
            if (!gateway) throw new Error("Pedido sem gateway registrado.");
          }

          let statusFinal = "pending";

          if (gateway === "kalangfy") {
            const res = await fetch(`${KALANGFY_API_BASE_URL}/charges/${encodeURIComponent(orderId)}`, {
              headers: getKalangfyHeaders(),
            });
            if (!res.ok) throw new Error(`Kalangfy: falha ao consultar status (${res.status}).`);
            const data: any = await res.json().catch(() => ({}));
            const charge = extractKalangfyCharge(data);
            if (!charge?.status) throw new Error("Kalangfy: resposta sem status da cobrança.");
            statusFinal = mapKalangfyStatus(charge.status);
          } else if (gateway === "invictus") {
            const res = await fetch(`${INVICTUS_API_BASE_URL}/transactions/${encodeURIComponent(orderId)}`, {
              headers: getInvictusHeaders(),
            });
            const data: any = await res.json().catch(() => ({}));
            statusFinal = mapInvictusStatus(extractInvictusTx(data)?.status);
          } else if (gateway === "gorilla") {
            const res = await fetch(`${GORILLAPAY_API_BASE_URL}/charges/${encodeURIComponent(orderId)}`, {
              headers: getGorillaHeaders(),
            });
            const data: any = await res.json().catch(() => ({}));
            statusFinal = mapGorillaStatus(data?.data?.status);
          } else if (gateway === "azipix") {
            const res = await fetch(`${AZIPIX_API_BASE_URL}/transactions/${encodeURIComponent(orderId)}`, {
              headers: getAzipixHeaders(),
            });
            const data: any = await res.json().catch(() => ({}));
            statusFinal = mapAzipixStatus(data?.status);
          } else if (gateway === "virtus") {
            const res = await fetch(`${VIRTUSBANK_API_BASE_URL}/Billing/${encodeURIComponent(orderId)}/Status`, {
              headers: getVirtusHeaders(),
            });
            const data: any = await res.json().catch(() => ({}));
            statusFinal = mapVirtusStatus(data.result);
          } else if (gateway === "nexus") {
            // Nexus foi removido do site; pedidos antigos ficam como pendentes.
            statusFinal = "pending";
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

          // Envia venda paga para a UTMify uma única vez (cobre gateways sem webhook, ex.: InvictusPay)
          if (statusFinal === "paid") {
            const { marcarPedidoPago } = await import("@/lib/order-status.server");
            await marcarPedidoPago(orderId);
            try {
              const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
              const { data: row } = await supabaseAdmin
                .from("lead_submissions")
                .select("id, fields")
                .eq("order_id", orderId)
                .maybeSingle();
              const fields: any = row?.fields ?? {};
              if (row && fields.utmify_payload && !fields.utmify_paid_sent) {
                const { enviarPedidoParaUtmify, nowUtcSqlString } = await import("@/lib/paradise.server");
                const payload = { ...fields.utmify_payload, status: "paid", approvedDate: nowUtcSqlString() };
                const r = await enviarPedidoParaUtmify(payload);
                if (r?.ok) {
                  await supabaseAdmin
                    .from("lead_submissions")
                    .update({ fields: { ...fields, utmify_paid_sent: true } })
                    .eq("id", row.id);
                }
              }
            } catch (e) {
              console.error("[verificar-status] Erro UTMify:", e);
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
