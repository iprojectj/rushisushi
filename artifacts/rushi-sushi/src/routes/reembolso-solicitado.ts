import { createFileRoute } from "@tanstack/react-router";
import reembolsoHtml from "../../public/reembolso-solicitado.html?raw";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/reembolso-solicitado")({
  head: () => pageHead("Reembolso solicitado — Rūshī Sushi", "Informações sobre a solicitação de reembolso do seu pedido.", true),
  server: {
    handlers: {
      GET: async () =>
        new Response(reembolsoHtml, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
