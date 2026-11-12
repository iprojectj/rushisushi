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
import { KALANGFY_API_BASE_URL, extractKalangfyCharge, getKalangfyHeaders } from "@/lib/kalangfy.server";
import { INVICTUS_API_BASE_URL, extractInvictusTx, getInvictusHeaders } from "@/lib/invictuspay.server";
import { captureCheckoutLocation } from "@/lib/brazil-locations.server";

export const Route = createFileRoute("/criar-pix")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let transactionId = "";
        let checkoutRecord: { id: string; publicOrderNumber: string } | null = null;
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
          let activeGateway = "kalangfy";
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

          let pixCopiaECola: string = "";
          let qrCodeFinal: string = "";

          // Virtus foi removida do painel; se ainda estiver salva, cai na Paradise.
          if (activeGateway === "virtus" || activeGateway === "nexus") activeGateway = "paradise";

          let checkoutLocation: unknown = null;
          try {
            checkoutLocation = await captureCheckoutLocation(body);
          } catch (error) {
            console.warn("[criar-pix] Não foi possível registrar a localização do checkout:", error);
          }
          const { createCheckoutWithPublicOrderNumber } = await import("@/lib/public-order-number.server");
          checkoutRecord = await createCheckoutWithPublicOrderNumber({
            nome: String(nome ?? "").slice(0, 200),
            whatsapp: telefoneLimpo,
            email: emailCliente,
            fields: {
              products,
              valorTotal: valorNumerico,
              gateway: activeGateway,
              location: checkoutLocation,
              payment_creation_status: "pending",
            },
          });

          const gerarPix = async (gw: string): Promise<void> => {
          if (gw === "kalangfy") {
            // Kalangfy - centavos, Bearer token
            const tp: Record<string, string> = {};
            if (trackingParameters && typeof trackingParameters === "object") {
              for (const k of ["utm_source", "utm_campaign", "utm_medium", "utm_content", "utm_term", "src", "sck"]) {
                if (trackingParameters[k]) tp[k] = String(trackingParameters[k]);
              }
            }
            const response = await fetch(`${KALANGFY_API_BASE_URL}/charges`, {
              method: "POST",
              headers: getKalangfyHeaders(),
              body: JSON.stringify({
                amount_cents: valorEmCentavos,
                description: montarDescricaoPedido(products).slice(0, 200) || "Pedido",
                external_reference: reference,
                customer: { name: nome, email: emailCliente, document: cpfCliente, phone: telefoneLimpo },
                ...(Object.keys(tp).length ? { tracking_parameters: tp } : {}),
              }),
            });
            const rawText = await response.text();
            let apiData: any = {};
            try { apiData = JSON.parse(rawText); } catch { apiData = { raw: rawText }; }
            const ch = extractKalangfyCharge(apiData);
            if (!response.ok || !ch?.id) {
              console.error("[KALANGFY] Erro criar PIX:", response.status, rawText);
              throw new Error(`Kalangfy ${response.status}: ${apiData.error?.message || apiData.error || apiData.message || rawText || "Erro desconhecido"}`);
            }
            transactionId = String(ch.id);
            const pix = ch.pix || {};
            pixCopiaECola = pix.copy_paste || pix.qr_code || ch.pix_copy_paste || "";
            const img = String(pix.qr_code_base64 || "");
            qrCodeFinal = img
              ? (img.startsWith("data:") || img.startsWith("http") ? img : `data:image/png;base64,${img}`)
              : pixCopiaECola ? `https://quickchart.io/qr?text=${encodeURIComponent(pixCopiaECola)}&size=300` : "";
          } else if (gw === "invictus") {
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

          // Tentativa única: somente o gateway escolhido no painel (sem fallback).
          try {
            await gerarPix(activeGateway);
          } catch (e: any) {
            console.error(`[criar-pix] falha no gateway ${activeGateway}:`, e?.message || e);
            throw e;
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

          if (!checkoutRecord) throw new Error("Número do pedido não foi reservado.");
          const { attachGatewayTransaction } = await import("@/lib/public-order-number.server");
          await attachGatewayTransaction(checkoutRecord.id, String(transactionId), {
            utmify_payload: payloadUtmify,
            payment_creation_status: "created",
          });

          pendingOrders[String(transactionId)] = payloadUtmify;

          // 3. Notificar Utmify
          await enviarPedidoParaUtmify(payloadUtmify);

          return new Response(JSON.stringify({
            success: true,
            qrCodeData: qrCodeFinal,
            pixCopiaECola,
            transactionId,
            publicOrderNumber: checkoutRecord.publicOrderNumber,
            gateway: activeGateway
          }), { headers: { "Content-Type": "application/json" } });

        } catch (error: any) {
          if (checkoutRecord && !transactionId) {
            try {
              const { setCheckoutCreationFailure } = await import("@/lib/public-order-number.server");
              await setCheckoutCreationFailure(checkoutRecord.id);
            } catch (markError) {
              console.error("[criar-pix] Não foi possível marcar a criação do PIX como falha:", markError);
            }
          }
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
