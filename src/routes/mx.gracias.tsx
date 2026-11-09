import { createFileRoute } from "@tanstack/react-router";
import mxGraciasHtml from "../../public/mx/gracias.html?raw";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/mx/gracias")({
  head: () => pageHead("Seguimiento — Rūshī Sushi México", "Sigue el estado de tu pedido Rūshī Sushi México.", true),
  server: {
    handlers: {
      GET: async () =>
        new Response(mxGraciasHtml, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
