import { createFileRoute } from "@tanstack/react-router";
import refundRequestHtml from "../../public/solicitar-reembolso.html?raw";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/solicitar-reembolso")({
  head: () =>
    pageHead(
      "Solicitar reembolso — Rūshī Sushi",
      "Confira os dados do pedido e as informações para solicitar um reembolso.",
      true,
    ),
  server: {
    handlers: {
      GET: async () =>
        new Response(refundRequestHtml, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
