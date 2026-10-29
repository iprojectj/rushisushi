import { createFileRoute } from "@tanstack/react-router";
import mxIndexHtml from "../../public/mx/index.html?raw";

export const Route = createFileRoute("/mx/")({
  server: {
    handlers: {
      GET: async () =>
        new Response(mxIndexHtml, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
