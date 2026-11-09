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
import { AZIPIX_API_BASE_URL, getAzipixHeaders } from "@/lib/azipix.server";
import { GORILLAPAY_API_BASE_URL, getGorillaHeaders } from "@/lib/gorillapay.server";
import { INVICTUS_API_BASE_URL, extractInvictusTx, getInvictusHeaders } from "@/lib/invictuspay.server";

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
              let parsed: unknown = val;
              if (typeof val === "string") { try { parsed = JSON.parse(val); } catch { parsed = val; } }
              if (typeof parsed === "string") activeGateway = parsed;
            }
          } catch (e) {
            console.error("[criar-pix] Erro ao buscar gateway ativo:", e);
          }

          let transactionId: string = "";
          let pixCopiaECola: string = "";
          let qrCodeFinal: string = "";

          // Virtus foi removida do painel; se ainda estiver salva, cai na Paradise.
          if (activeGateway === "virtus" || activeGateway === "nexus") activeGateway = "paradise";

          const gerarPix = async (gw: string): Promise<void> => {
          if (gw === "invictus") {
            // InvictusPay v2 - centavos, item aberto (description), header X-Api-Key
            const response = await fetch(`${INVICTUS_API_BASE_URL}/transactions`, {
              method: "POST",
              headers: getInvictusHeaders(),
              body: JSON.stringify({
                amount: valorEmCentavos,
                paymentMethod: "pix",
                customer: { name: nome, email: emailCliente, document: cpfCliente, phone: telefoneLimpo },
                items: [{ description: montarDescricaoPedido(products).slice(0, 120) || "Pedido", quantity: 1, amount: valorEmCentavos, externalRef: reference }],
                pix: { expirationInSeconds: 3600 },
              }),
            });
            const rawText = await response.text();
            let apiData: any = {};
            try { apiData = JSON.parse(rawText); } catch { apiData = { raw: rawText }; }
            const tx = extractInvictusTx(apiData);
            if (!response.ok || !tx?.id) {
              console.error("[INVICTUS] Erro criar PIX:", response.status, rawText);
              throw new Error(`InvictusPay ${response.status}: ${apiData.message || rawText || "Erro desconhecido"}`);
            }
            transactionId = String(tx.id);
            const pix = tx.pix || {};
            pixCopiaECola = pix.qrcode || pix.qr_code || pix.copy_paste || pix.copyPaste || pix.emv || pix.code || tx.pix_code || tx.pixCode || "";
            const img = pix.qrcode_image || pix.qr_code_base64 || pix.qrCodeBase64 || pix.image || tx.qr_code_base64 || "";
            qrCodeFinal = img
              ? (String(img).startsWith("data:") || String(img).startsWith("http") ? img : `data:image/png;base64,${img}`)
              : pixCopiaECola ? `https://quickchart.io/qr?text=${encodeURIComponent(pixCopiaECola)}&size=300` : "";
          } else if (gw === "azipix") {
            // Azipix - centavos
            const response = await fetch(`${AZIPIX_API_BASE_URL}/transactions/charge`, {
              method: "POST",
              headers: { ...getAzipixHeaders(), "X-Idempotency-Key": crypto.randomUUID() },
              body: JSON.stringify({
                amountCents: valorEmCentavos,
                paymentMethod: "pix",
                description: montarDescricaoPedido(products).slice(0, 200),
                customer: { name: nome, email: emailCliente, document: cpfCliente, phone: telefoneLimpo },
              }),
            });
            const rawText = await response.text();
            let apiData: any = {};
            try { apiData = JSON.parse(rawText); } catch { apiData = { raw: rawText }; }
            if (!response.ok || !apiData.id) {
              console.error("[AZIPIX] Erro criar PIX:", response.status, rawText);
              throw new Error(`Azipix ${response.status}: ${apiData.message || apiData.error || rawText || "Erro desconhecido"}`);
            }
            transactionId = apiData.id;
            pixCopiaECola = apiData.pixCode || "";
            const img = apiData.pixQrCode || "";
            // Azipix às vezes devolve um link externo no lugar da imagem; nesse caso geramos o QR pelo código.
            qrCodeFinal = String(img).startsWith("data:image") && !String(img).includes("http")
              ? img
              : pixCopiaECola ? `https://quickchart.io/qr?text=${encodeURIComponent(pixCopiaECola)}&size=300` : "";
          } else if (gw === "gorilla") {
            // GorillaPay - centavos
            const response = await fetch(`${GORILLAPAY_API_BASE_URL}/charges`, {
              method: "POST",
              headers: { ...getGorillaHeaders(), "Idempotency-Key": crypto.randomUUID() },
              body: JSON.stringify({
                amount: valorEmCentavos,
                payment_method: "pix",
                description: montarDescricaoPedido(products).slice(0, 200),
                customer: { name: nome, email: emailCliente, document: cpfCliente, phone: telefoneLimpo },
              }),
            });
            const rawText = await response.text();
            let apiData: any = {};
            try { apiData = JSON.parse(rawText); } catch { apiData = { raw: rawText }; }
            const tx = apiData.data || {};
            if (!response.ok || apiData.success === false || !tx.id) {
              console.error("[GORILLAPAY] Erro criar PIX:", response.status, rawText);
              throw new Error(`GorillaPay ${response.status}: ${apiData.error?.message || rawText || "Erro desconhecido"}`);
            }
            transactionId = String(tx.id);
            pixCopiaECola = tx.pix_copy_paste || "";
            const img = String(tx.pix_qr_code || "");
            qrCodeFinal = img && !img.startsWith("http")
              ? (img.startsWith("data:") ? img : `data:image/png;base64,${img}`)
              : pixCopiaECola ? `https://quickchart.io/qr?text=${encodeURIComponent(pixCopiaECola)}&size=300` : "";
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
          if (!transactionId) throw new Error(`${gw}: resposta sem ID de transação`);
          };

          // Tenta o gateway ativo; se falhar, usa os outros como reserva automática
          const ordem = [activeGateway, ...["paradise", "gorilla", "azipix", "invictus"].filter((g) => g !== activeGateway)];
          const erros: string[] = [];
          for (const gw of ordem) {
            try {
              transactionId = ""; pixCopiaECola = ""; qrCodeFinal = "";
              await gerarPix(gw);
              if (gw !== activeGateway) console.warn(`[criar-pix] ${activeGateway} falhou; PIX gerado via reserva ${gw}`);
              activeGateway = gw;
              erros.length = 0;
              break;
            } catch (e: any) {
              console.error(`[criar-pix] falha no gateway ${gw}:`, e?.message || e);
              erros.push(e?.message || String(e));
            }
          }
          if (erros.length) throw new Error(erros.join(" | "));

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
              name: limparNomeProduto(p.name),
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
