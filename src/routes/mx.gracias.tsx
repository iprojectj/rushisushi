import { createFileRoute } from "@tanstack/react-router";
import mxGraciasHtml from "../../public/mx/gracias.html?raw";

export const Route = createFileRoute("/mx/gracias")({
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
