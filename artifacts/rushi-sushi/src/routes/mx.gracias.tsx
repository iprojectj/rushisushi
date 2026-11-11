import { createFileRoute } from "@tanstack/react-router";
import mxGraciasHtml from "../../public/mx/gracias.html?raw";
import { pageHead } from "@/lib/page-head";
import { publicHtmlResponse } from "@/lib/public-html-response";

export const Route = createFileRoute("/mx/gracias")({
  head: () => pageHead("Seguimiento — Rūshī Sushi México", "Sigue el estado de tu pedido Rūshī Sushi México.", true),
  server: {
    handlers: {
      GET: async () =>
        publicHtmlResponse(mxGraciasHtml, true),
    },
  },
});
