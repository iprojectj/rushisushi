import { createFileRoute } from "@tanstack/react-router";
import reembolsoHtml from "../../public/reembolso-solicitado.html?raw";

export const Route = createFileRoute("/reembolso-solicitado")({
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
