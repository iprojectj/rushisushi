import { createFileRoute } from "@tanstack/react-router";
import { enviarPedidoParaUtmify, pendingOrders, nowUtcSqlString } from "@/lib/paradise.server";
import { mapAzipixStatus } from "@/lib/azipix.server";

// Azipix webhook. Every call is signed: X-Azipix-Signature = "sha256=" + HMAC_SHA256(secret, timestamp + "." + rawBody).
// The secret was saved under STRIPE_WEBHOOK_SECRET; AZIPIX_WEBHOOK_SECRET is accepted too.

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

export const Route = createFileRoute("/api/public/azipix-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.AZIPIX_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) return new Response("Webhook not configured", { status: 500 });

        const raw = await request.text();
        const timestamp = request.headers.get("x-azipix-timestamp") || "";
        const received = (request.headers.get("x-azipix-signature") || "").replace(/^sha256=/, "");
        const expected = await hmacHex(secret, `${timestamp}.${raw}`);
        const fresh = Math.abs(Date.now() / 1000 - Number(timestamp)) < 300;
        if (!received || !fresh || !safeEqual(received, expected)) {
          return new Response("Invalid signature", { status: 401 });
        }

        try {
          const body = JSON.parse(raw) as { event?: string; data?: { id?: string; status?: string } };
          const orderId = String(body.data?.id || "");
          if (!orderId) return new Response("Missing id", { status: 400 });
          const status = mapAzipixStatus(body.data?.status);
          console.log("[AZIPIX WEBHOOK]", body.event, orderId, status);

          let utmifyPayload: any = pendingOrders[orderId];
          if (!utmifyPayload) {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { data } = await supabaseAdmin.from("lead_submissions").select("fields").eq("order_id", orderId).maybeSingle();
            utmifyPayload = (data?.fields as any)?.utmify_payload;
          }
          if (utmifyPayload) {
            utmifyPayload.status = status;
            if (status === "paid") utmifyPayload.approvedDate = nowUtcSqlString();
            await enviarPedidoParaUtmify(utmifyPayload);
          }
          return new Response("OK", { status: 200 });
        } catch (error) {
          console.error("[AZIPIX WEBHOOK] Erro:", error);
          return new Response("Internal Error", { status: 500 });
        }
      },
    },
  },
});
