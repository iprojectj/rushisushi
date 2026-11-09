import { createFileRoute } from "@tanstack/react-router";
import indexHtml from "../../public/index.html?raw";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/")({
  head: () => pageHead("Cardápio — Rūshī Sushi", "Combos, sushi e acompanhamentos para seu pedido Rūshī Sushi."),
  server: {
    handlers: {
      GET: async () =>
        new Response(indexHtml, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
