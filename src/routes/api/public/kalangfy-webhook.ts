import { createFileRoute } from "@tanstack/react-router";
import { enviarPedidoParaUtmify, pendingOrders, nowUtcSqlString } from "@/lib/paradise.server";
import { extractKalangfyCharge, mapKalangfyStatus } from "@/lib/kalangfy.server";

// Kalangfy webhook: x-kalangfy-signature = HMAC_SHA256(secret, rawBody) in hex (optional "sha256=" prefix).
async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/kalangfy-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.KALANGFY_WEBHOOK_SECRET;
        if (!secret) return new Response("Webhook not configured", { status: 500 });
        const raw = await request.text();
        const received = (request.headers.get("x-kalangfy-signature") || "").replace(/^sha256=/, "").toLowerCase();
        const expected = await hmacHex(secret, raw);
        if (!received || !safeEqual(received, expected)) return new Response("Invalid signature", { status: 401 });

        try {
          const body = JSON.parse(raw) as any;
          const ch = extractKalangfyCharge(body);
          const orderId = String(ch?.id || body?.charge_id || "");
          if (!orderId) return new Response("Missing id", { status: 400 });
          // Webhook is sent when a charge is paid; trust explicit status if present.
          const status = ch?.status ? mapKalangfyStatus(ch.status) : "paid";
          console.log("[KALANGFY WEBHOOK]", body?.event, orderId, status);

          if (status === "paid") {
            const { marcarPedidoPago } = await import("@/lib/order-status.server");
            await marcarPedidoPago(orderId);
          }
          let utmifyPayload: any = pendingOrders[orderId];
          let rowId: string | undefined;
          let fields: any = {};
          if (!utmifyPayload || status === "paid") {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { data } = await supabaseAdmin.from("lead_submissions").select("id, fields").eq("order_id", orderId).maybeSingle();
            fields = (data?.fields as any) ?? {};
            rowId = data?.id;
            utmifyPayload = utmifyPayload || fields.utmify_payload;
          }
          if (utmifyPayload && !(status === "paid" && fields.utmify_paid_sent)) {
            utmifyPayload.status = status;
            if (status === "paid") utmifyPayload.approvedDate = nowUtcSqlString();
            await enviarPedidoParaUtmify(utmifyPayload);
            if (status === "paid" && rowId) {
              const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
              await supabaseAdmin.from("lead_submissions").update({ fields: { ...fields, utmify_paid_sent: true } }).eq("id", rowId);
            }
          }
          return new Response("OK", { status: 200 });
        } catch (error) {
          console.error("[KALANGFY WEBHOOK] Erro:", error);
          return new Response("Internal Error", { status: 500 });
        }
      },
    },
  },
});
