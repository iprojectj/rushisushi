import { createFileRoute } from "@tanstack/react-router";
import {
  enviarUtmifyMx,
  MX_PRODUCT,
  nowSql,
  verificarAssinaturaCooud,
} from "@/lib/cooud.server";

export const Route = createFileRoute("/api/public/cooud-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-cooud-signature");

        if (!verificarAssinaturaCooud(rawBody, signature)) {
          console.warn("[COOUD-WEBHOOK] assinatura inválida");
          return new Response("Invalid signature", { status: 401 });
        }

        let event: any;
        try {
          event = JSON.parse(rawBody);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        const type: string = event?.type ?? "";
        const data: any = event?.data ?? {};
        console.log(`[COOUD-WEBHOOK] ${type} order=${data?.id}`);

        try {
          const { supabaseAdmin } = await import(
            "@/integrations/supabase/client.server"
          );

          // Idempotência: se já processamos este event.id, ignora
          const eventId = String(event?.id ?? "");
          if (eventId) {
            const { data: existing } = await supabaseAdmin
              .from("lead_submissions")
              .select("id")
              .eq("form_type", "pago_mx")
              .eq("order_id", eventId)
              .maybeSingle();
            if (existing) {
              return new Response("ok (dup)", { status: 200 });
            }
          }

          const email = String(data?.email ?? "").toLowerCase();
          const name = String(data?.customer_name ?? "Cliente MX");
          const totalCents = Number(data?.total_amount ?? MX_PRODUCT.amount_cents);
          const currency = String(data?.currency ?? MX_PRODUCT.currency);
          const refunded = Number(data?.refunded_amount ?? 0);

          // Tenta casar com o lead checkout_mx pelo email mais recente
          let checkoutFields: any = null;
          try {
            const { data: match } = await supabaseAdmin
              .from("lead_submissions")
              .select("id, fields")
              .eq("form_type", "checkout_mx")
              .contains("fields", { customer: { email } })
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            checkoutFields = (match?.fields as any) ?? null;
          } catch {
            checkoutFields = null;
          }

          const utm = checkoutFields?.utm ?? {};
          const orderIdForUtmify =
            checkoutFields?.cooud_session_id ?? String(data?.id ?? eventId);

          // Grava evento de pagamento
          await supabaseAdmin.from("lead_submissions").insert({
            form_type: "pago_mx",
            order_id: eventId || String(data?.id ?? ""),
            fields: {
              event_type: type,
              cooud_order_id: data?.id,
              cooud_session_id: checkoutFields?.cooud_session_id ?? null,
              email,
              name,
              total_amount_cents: totalCents,
              currency,
              refunded_amount_cents: refunded,
              raw: data,
              received_at: nowSql(),
            },
          });

          // Notifica UTMify MX
          if (type === "order.paid" || type === "order.refunded") {
            const status =
              type === "order.paid"
                ? "paid"
                : refunded >= totalCents
                  ? "refunded"
                  : "refunded";

            void enviarUtmifyMx({
              orderId: orderIdForUtmify,
              platform: "RushiSushiMX",
              paymentMethod: "credit_card",
              status,
              createdAt: checkoutFields?.created_at ?? nowSql(),
              approvedDate: status === "paid" ? nowSql() : null,
              refundedAt: status === "refunded" ? nowSql() : null,
              customer: {
                name: checkoutFields?.customer?.name ?? name,
                email,
                phone: checkoutFields?.customer?.phone ?? null,
                document: null,
                country: "MX",
                ip: checkoutFields?.ip ?? "127.0.0.1",
              },
              products: [
                {
                  id: "combo-mx-1",
                  name: MX_PRODUCT.name,
                  planId: null,
                  planName: null,
                  quantity: 1,
                  priceInCents: totalCents,
                },
              ],
              trackingParameters: {
                src: utm.src ?? null,
                sck: utm.sck ?? null,
                utm_source: utm.utm_source ?? null,
                utm_campaign: utm.utm_campaign ?? null,
                utm_medium: utm.utm_medium ?? null,
                utm_content: utm.utm_content ?? null,
                utm_term: utm.utm_term ?? null,
              },
              commission: {
                totalPriceInCents: totalCents,
                gatewayFeeInCents: Number(data?.fee_amount ?? 0),
                userCommissionInCents: Number(
                  data?.net_amount ?? totalCents - Number(data?.fee_amount ?? 0)
                ),
                currency: "MXN",
              },
            });
          }
        } catch (e: any) {
          console.error("[COOUD-WEBHOOK] erro processando:", e?.message ?? e);
          // Retornamos 200 pra não ficar em loop de retry por erro nosso
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
