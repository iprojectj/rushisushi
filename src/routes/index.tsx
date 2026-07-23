import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

const DESTINATION_URL = "https://paylume.fans/l/6b589ea5?shk=xqung0o4";

function Index() {
  useEffect(() => {
    // Redirecionamento instantâneo para simular o comportamento da presell de referência
    window.location.replace(DESTINATION_URL);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1E1E1E]">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner simples do Telegram enquanto redireciona */}
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3390ec] border-t-transparent"></div>
        <p className="text-sm font-medium text-white/50">Redirecionando para o Telegram...</p>
      </div>
    </div>
  );
}
