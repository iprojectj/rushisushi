import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/reembolso-solicitado")({
  head: () => pageHead("Reembolso solicitado — Rūshī Sushi", "Informações sobre a solicitação de reembolso do seu pedido.", true),
  server: {
    handlers: {
      GET: async ({ request }) =>
        Response.redirect(new URL("/solicitar-reembolso", request.url), 302),
    },
  },
});
