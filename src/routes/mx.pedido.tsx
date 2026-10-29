import { createFileRoute } from "@tanstack/react-router";
import mxPedidoHtml from "../../public/mx/pedido.html?raw";

export const Route = createFileRoute("/mx/pedido")({
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
