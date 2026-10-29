import { createFileRoute } from "@tanstack/react-router";
import obrigadoHtml from "../../public/obrigado.html?raw";

export const Route = createFileRoute("/obrigado")({
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
