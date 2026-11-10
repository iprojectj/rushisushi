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
        const received = (request.headers.get("x-kalangfy-signature") || "").trim().replace(/^sha256=/i, "").toLowerCase();
        const expected = await hmacHex(secret, raw);
        if (!received || !safeEqual(received, expected)) {
          return new Response("Invalid signature", { status: 401 });
        }

        try {
          const body = JSON.parse(raw);
          const charge = extractKalangfyCharge(body);
          const orderId = String(charge.id || charge.charge_id || body.charge_id || "");
          if (!orderId || orderId.length > 200) return new Response("Missing id", { status: 400 });
          // Kalangfy only sends this webhook when a charge is paid.
          const status = charge.status ? mapKalangfyStatus(charge.status) : "paid";
          console.log("[KALANGFY WEBHOOK]", body.event, orderId, status);

          if (status === "paid") {
            const { marcarPedidoPago } = await import("@/lib/order-status.server");
            await marcarPedidoPago(orderId);
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: row } = await supabaseAdmin.from("lead_submissions").select("id, fields").eq("order_id", orderId).maybeSingle();
          const fields: any = row?.fields ?? {};
          const utmifyPayload: any = pendingOrders[orderId] || fields.utmify_payload;
          if (utmifyPayload && !(status === "paid" && fields.utmify_paid_sent)) {
            const payload = { ...utmifyPayload, status, approvedDate: status === "paid" ? nowUtcSqlString() : null };
            const r = await enviarPedidoParaUtmify(payload);
            if (status === "paid" && r?.ok && row) {
              await supabaseAdmin.from("lead_submissions").update({ fields: { ...fields, utmify_paid_sent: true } }).eq("id", row.id);
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
