import { createFileRoute } from "@tanstack/react-router";
import {
  PARADISE_API_BASE_URL,
  enviarPedidoParaUtmify,
  gerarCpfValido,
  gerarEmailRandomico,
  getParadiseHeaders,
  limparNomeProduto,
  montarDescricaoPedido,
  nowUtcSqlString,
  pendingOrders,
} from "@/lib/paradise.server";
import { getNexusHeaders, NEXUS_API_BASE_URL, limparNomeProdutoNexus } from "@/lib/nexus.server";

export const Route = createFileRoute("/criar-pix")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as any;
          const { valorTotal, nome, whatsapp, products, trackingParameters = {} } = body;

          const valorNumerico = Number.parseFloat(String(valorTotal).replace(",", "."));
          const valorEmCentavos = Math.max(100, Math.round(valorNumerico * 100));

          const emailCliente = gerarEmailRandomico();
          const cpfCliente = gerarCpfValido();
          const telefoneLimpo = String(whatsapp).replace(/\D/g, "");
          const reference = `rushi-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

          // 1. Identificar gateway ativo
          let activeGateway = "paradise";
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { data } = await supabaseAdmin
              .from("app_settings")
              .select("value")
              .eq("key", "active_gateway")
              .maybeSingle();
            if (data?.value) {
              const val = data.value;
              activeGateway = typeof val === 'string' ? JSON.parse(val) : val;
            }
          } catch (e) {
            console.error("[criar-pix] Erro ao buscar gateway ativo:", e);
          }

          let transactionId: string = "";
          let pixCopiaECola: string = "";
          let qrCodeFinal: string = "";

          if (activeGateway === "nexus") {
            // Lógica NEXUS PAG - amount em REAIS (decimal), não centavos
            const payloadNexus = {
              amount: Number(valorNumerico.toFixed(2)),
              description: montarDescricaoPedido(products),
              external_id: reference,
              customer: {
                name: nome,
                email: emailCliente,
                document: cpfCliente,
                phone: telefoneLimpo,
              },
              payment_method: "pix",
              items: Array.isArray(products) ? products.map(p => ({
                name: limparNomeProdutoNexus(p.name),
                price: Number(Number(p.price).toFixed(2)),
                quantity: p.quantity || 1
              })) : []
            };


            console.log("[NEXUS] Enviando payload:", JSON.stringify(payloadNexus));
            const response = await fetch(`${NEXUS_API_BASE_URL}/api/pix/create`, {
              method: "POST",
              headers: getNexusHeaders(),
              body: JSON.stringify(payloadNexus),
            });

            const rawText = await response.text();
            let apiData: any = {};
            try { apiData = JSON.parse(rawText); } catch { apiData = { raw: rawText }; }

            if (!response.ok) {
              console.error("[NEXUS] Erro criar PIX:", response.status, rawText);
              throw new Error(`Nexus ${response.status}: ${apiData.message || rawText || "Erro desconhecido"}`);
            }

            const tx = apiData.transaction || apiData;
            transactionId = tx.id || tx.txid;
            pixCopiaECola = tx.pix_copia_cola || tx.pix?.qrcode || tx.qr_code || "";
            qrCodeFinal = tx.qr_code_base64 || tx.pix?.qrcode_image || (pixCopiaECola
              ? `https://quickchart.io/qr?text=${encodeURIComponent(pixCopiaECola)}&size=300`
              : "");

          } else {
            // Lógica PARADISE PAGS (Default)
            const payloadParadise: any = {
              amount: valorEmCentavos,
              description: montarDescricaoPedido(products),
              reference: reference,
              productHash: "prod_d9f9e0dcba8c763c",
              offer_link: "https://rushisushi.delivery",
              customer: {
                name: nome,
                email: emailCliente,
                phone: telefoneLimpo,
                document: cpfCliente,
              },
            };

            // Adicionar tracking
            if (trackingParameters && typeof trackingParameters === "object") {
              const utmKeys = ["utm_source", "utm_campaign", "utm_medium", "utm_content", "utm_term", "src", "sck"] as const;
              const tracking: any = {};
              let hasTracking = false;
              for (const k of utmKeys) {
                if (trackingParameters[k]) {
                  tracking[k] = String(trackingParameters[k]);
                  hasTracking = true;
                }
              }
              if (hasTracking) payloadParadise.tracking = tracking;
            }

            console.log("[PARADISE] Enviando payload:", JSON.stringify(payloadParadise));
            const response = await fetch(`${PARADISE_API_BASE_URL}/transaction.php`, {
              method: "POST",
              headers: getParadiseHeaders(),
              body: JSON.stringify(payloadParadise),
            });

            const rawText = await response.text();
            let apiData: any = {};
            try { apiData = JSON.parse(rawText); } catch { apiData = { raw: rawText }; }

            if (!response.ok || apiData.status !== "success") {
              console.error("[PARADISE] Erro criar PIX:", response.status, rawText);
              throw new Error(`Paradise ${response.status}: ${apiData.message || rawText || "Erro desconhecido"}`);
            }

            transactionId = apiData.transaction_id || apiData.id;
            pixCopiaECola = apiData.qr_code || "";
            qrCodeFinal = apiData.qr_code_base64 || (pixCopiaECola 
              ? `https://quickchart.io/qr?text=${encodeURIComponent(pixCopiaECola)}&size=300` 
              : "");
          }

          // 2. Preparar Utmify
          const payloadUtmify = {
            orderId: String(transactionId),
            platform: "RushiSushi",
            paymentMethod: "pix" as const,
            status: "waiting_payment" as const,
            createdAt: nowUtcSqlString(),
            approvedDate: null,
            refundedAt: null,
            customer: {
              name: nome,
              email: emailCliente,
              phone: telefoneLimpo,
              document: cpfCliente,
              ip: request.headers.get("cf-connecting-ip") || "127.0.0.1",
            },
            products: Array.isArray(products) ? products.map((p: any) => ({
              id: p.id || "SKU",
              name: activeGateway === "nexus" ? limparNomeProdutoNexus(p.name) : limparNomeProduto(p.name),
              planId: null,
              planName: null,
              quantity: p.quantity || 1,
              priceInCents: Math.round(p.price * 100),
            })) : [],
            trackingParameters,
            commission: {
              totalPriceInCents: valorEmCentavos,
              gatewayFeeInCents: 0,
              userCommissionInCents: valorEmCentavos,
            },
          };

          pendingOrders[String(transactionId)] = payloadUtmify;

          // 3. Persistir Lead
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            await supabaseAdmin.from("lead_submissions").insert({
              form_type: "checkout",
              order_id: String(transactionId),
              nome,
              whatsapp: telefoneLimpo,
              email: emailCliente,
              fields: { 
                products, 
                valorTotal: valorNumerico, 
                utmify_payload: payloadUtmify, 
                gateway: activeGateway 
              },
            });
          } catch (e) { console.error("Supabase Error:", e); }

          // 4. Notificar Utmify
          await enviarPedidoParaUtmify(payloadUtmify);

          return new Response(JSON.stringify({
            success: true,
            qrCodeData: qrCodeFinal,
            pixCopiaECola,
            transactionId,
            gateway: activeGateway
          }), { headers: { "Content-Type": "application/json" } });

        } catch (error: any) {
          console.error("[criar-pix] fatal:", error);
          const errorMessage = error?.message || String(error);
          return new Response(JSON.stringify({ 
            success: false, 
            message: errorMessage
          }), { 
            status: 200,
            headers: { "Content-Type": "application/json" } 
          });
        }
      },
    },
  },
});
