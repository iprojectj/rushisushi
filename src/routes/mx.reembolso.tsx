import { createFileRoute } from "@tanstack/react-router";
import mxReembolsoHtml from "../../public/mx/reembolso.html?raw";

export const Route = createFileRoute("/mx/reembolso")({
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
