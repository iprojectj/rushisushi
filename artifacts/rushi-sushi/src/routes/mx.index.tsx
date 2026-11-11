import { createFileRoute } from "@tanstack/react-router";
import mxIndexHtml from "../../public/mx/index.html?raw";
import { pageHead } from "@/lib/page-head";
import { publicHtmlResponse } from "@/lib/public-html-response";

export const Route = createFileRoute("/mx/")({
  head: () => pageHead("Menú — Rūshī Sushi México", "Sushi fresco, combos y acompañamientos de Rūshī Sushi México."),
  server: {
    handlers: {
      GET: async () =>
        publicHtmlResponse(mxIndexHtml, true),
    },
  },
});
