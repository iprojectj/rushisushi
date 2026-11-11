import { createFileRoute } from "@tanstack/react-router";
import pedidoHtml from "../../public/pedido.html?raw";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/pedido")({
  head: () => pageHead("Pagamento — Rūshī Sushi", "Confira seu pedido e o pagamento PIX da Rūshī Sushi.", true),
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
