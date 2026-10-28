import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Novo projeto | Início" },
      { name: "description", content: "Projeto vazio, pronto para um novo começo." },
      { property: "og:title", content: "Novo projeto | Início" },
      { property: "og:description", content: "Projeto vazio, pronto para um novo começo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return <main aria-label="Projeto vazio" className="min-h-screen bg-background" />;
}
