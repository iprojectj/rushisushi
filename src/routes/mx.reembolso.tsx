import { createFileRoute } from "@tanstack/react-router";
import mxReembolsoHtml from "../../public/mx/reembolso.html?raw";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/mx/reembolso")({
  head: () => pageHead("Reembolso — Rūshī Sushi México", "Consulta la solicitud de reembolso de tu pedido.", true),
  server: {
    handlers: {
      GET: async () =>
        new Response(mxReembolsoHtml, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
