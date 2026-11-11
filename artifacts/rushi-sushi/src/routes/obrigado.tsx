import { createFileRoute } from "@tanstack/react-router";
import obrigadoHtml from "../../public/obrigado.html?raw";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/obrigado")({
  head: () => pageHead("Acompanhar pedido — Rūshī Sushi", "Acompanhe o andamento do seu pedido Rūshī Sushi.", true),
  server: {
    handlers: {
      GET: async () =>
        new Response(obrigadoHtml, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
