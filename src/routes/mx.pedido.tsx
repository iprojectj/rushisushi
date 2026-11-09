import { createFileRoute } from "@tanstack/react-router";
import mxPedidoHtml from "../../public/mx/pedido.html?raw";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/mx/pedido")({
  head: () => pageHead("Pago — Rūshī Sushi México", "Consulta y finaliza el pago de tu pedido Rūshī Sushi México.", true),
  server: {
    handlers: {
      GET: async () =>
        new Response(mxPedidoHtml, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
