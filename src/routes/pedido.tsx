import { createFileRoute } from "@tanstack/react-router";
import pedidoHtml from "../../public/pedido.html?raw";

export const Route = createFileRoute("/pedido")({
  server: {
    handlers: {
      GET: async () =>
        new Response(pedidoHtml, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
