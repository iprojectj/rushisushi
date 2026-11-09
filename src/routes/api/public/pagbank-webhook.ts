import { createFileRoute } from "@tanstack/react-router";

// O PagBank avisa mudanças do pedido aqui. Não confiamos no corpo recebido:
// apenas extraímos o ID e reconsultamos o status oficial na API do PagBank
// (via /verificar-status), que marca como pago e notifica a UTMify uma única vez.
export const Route = createFileRoute("/api/public/pagbank-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body: any = await request.json().catch(() => ({}));
          const id = String(body?.id || "");
          if (/^ORDE_[A-Za-z0-9-]{10,80}$/.test(id)) {
            const origin = new URL(request.url).origin;
            await fetch(`${origin}/verificar-status/${encodeURIComponent(id)}`).catch(() => null);
          }
        } catch (e) {
          console.error("[pagbank-webhook]", e);
        }
        return new Response("ok");
      },
    },
  },
});
