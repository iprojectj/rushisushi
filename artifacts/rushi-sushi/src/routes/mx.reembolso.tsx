import { createFileRoute } from "@tanstack/react-router";
import mxReembolsoHtml from "../../public/mx/reembolso.html?raw";
import { pageHead } from "@/lib/page-head";
import { publicHtmlResponse } from "@/lib/public-html-response";

export const Route = createFileRoute("/mx/reembolso")({
  head: () => pageHead("Reembolso — Rūshī Sushi México", "Consulta la solicitud de reembolso de tu pedido.", true),
  server: {
    handlers: {
      GET: async () =>
        publicHtmlResponse(mxReembolsoHtml, true),
    },
  },
});
