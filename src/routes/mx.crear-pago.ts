import { createFileRoute } from "@tanstack/react-router";
import {
  criarCheckoutSession,
  enviarUtmifyMx,
  MX_PRODUCT,
  nowSql,
} from "@/lib/cooud.server";

interface CrearPagoBody {
  name?: string;
  email?: string;
  phone?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  src?: string;
  sck?: string;
}

export const Route = createFileRoute("/mx/crear-pago")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body: CrearPagoBody = await request.json().catch(() => ({}));
          const email = String(body.email || "").trim().toLowerCase();
          const name = String(body.name || "Cliente MX").trim();
          const phone = String(body.phone || "").trim() || null;

          if (!email || !email.includes("@")) {
            return new Response(
              JSON.stringify({ ok: false, error: "email inválido" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const url = new URL(request.url);
          const origin = url.origin;

          const rushiOrderId = `mx_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`;

          const session = await criarCheckoutSession({
            email,
            name,
            success_url: `${origin}/mx/gracias?oid=${rushiOrderId}`,
            cancel_url: `${origin}/mx/pedido?canceled=1`,
            metadata: {
              rushi_order_id: rushiOrderId,
              customer_name: name,
              customer_phone: phone ?? "",
              utm_source: body.utm_source ?? "",
              utm_medium: body.utm_medium ?? "",
              utm_campaign: body.utm_campaign ?? "",
              utm_content: body.utm_content ?? "",
              utm_term: body.utm_term ?? "",
              src: body.src ?? "",
              sck: body.sck ?? "",
            },
          });

          // Salva lead pendente
          try {
            const { supabaseAdmin } = await import(
              "@/integrations/supabase/client.server"
            );
            const ip =
              request.headers.get("cf-connecting-ip") ??
              request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
              null;

            await supabaseAdmin.from("lead_submissions").insert({
              form_type: "checkout_mx",
              order_id: session.id,
              fields: {
                rushi_order_id: rushiOrderId,
                cooud_session_id: session.id,
                customer: { name, email, phone },
                amount_cents: MX_PRODUCT.amount_cents,
                currency: MX_PRODUCT.currency,
                utm: {
                  utm_source: body.utm_source ?? null,
                  utm_medium: body.utm_medium ?? null,
                  utm_campaign: body.utm_campaign ?? null,
                  utm_content: body.utm_content ?? null,
                  utm_term: body.utm_term ?? null,
                  src: body.src ?? null,
                  sck: body.sck ?? null,
                },
                ip,
                created_at: nowSql(),
              },
            });
          } catch (e: any) {
            console.error("[MX] Falha ao salvar lead:", e?.message ?? e);
          }

          // UTMify MX: registra waiting_payment
          void enviarUtmifyMx({
            orderId: session.id,
            platform: "RushiSushiMX",
            paymentMethod: "credit_card",
            status: "waiting_payment",
            createdAt: nowSql(),
            approvedDate: null,
            refundedAt: null,
            customer: {
              name,
              email,
              phone,
              document: null,
              country: "MX",
              ip:
                request.headers.get("cf-connecting-ip") ??
                request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
                "127.0.0.1",
            },
            products: [
              {
                id: "combo-mx-1",
                name: MX_PRODUCT.name,
                planId: null,
                planName: null,
                quantity: 1,
                priceInCents: MX_PRODUCT.amount_cents,
              },
            ],
            trackingParameters: {
              src: body.src ?? null,
              sck: body.sck ?? null,
              utm_source: body.utm_source ?? null,
              utm_campaign: body.utm_campaign ?? null,
              utm_medium: body.utm_medium ?? null,
              utm_content: body.utm_content ?? null,
              utm_term: body.utm_term ?? null,
            },
            commission: {
              totalPriceInCents: MX_PRODUCT.amount_cents,
              gatewayFeeInCents: 0,
              userCommissionInCents: MX_PRODUCT.amount_cents,
              currency: "MXN",
            },
          });

          return new Response(
            JSON.stringify({
              ok: true,
              checkout_url: session.url,
              session_id: session.id,
              rushi_order_id: rushiOrderId,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (e: any) {
          console.error("[MX crear-pago] erro:", e?.message ?? e);
          return new Response(
            JSON.stringify({ ok: false, error: String(e?.message ?? e) }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
