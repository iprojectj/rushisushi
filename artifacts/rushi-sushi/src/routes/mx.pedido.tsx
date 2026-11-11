import { createFileRoute } from "@tanstack/react-router";
import mxPedidoHtml from "../../public/mx/pedido.html?raw";
import { pageHead } from "@/lib/page-head";
import { publicHtmlResponse } from "@/lib/public-html-response";

export const Route = createFileRoute("/mx/pedido")({
  head: () => pageHead("Pago — Rūshī Sushi México", "Consulta y finaliza el pago de tu pedido Rūshī Sushi México.", true),
  server: {
    handlers: {
      GET: async () =>
        publicHtmlResponse(mxPedidoHtml, true),
    },
  },
});
