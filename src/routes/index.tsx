import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { MoreVertical } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const DESTINATION_URL = "https://paylume.fans/l/6b589ea5?shk=xqung0o4";

function Index() {
  useEffect(() => {
    // Redirecionamento automático após um pequeno delay para que a tela informativa seja visível
    const timer = setTimeout(() => {
      window.location.replace(DESTINATION_URL);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0B141B] px-6 text-white font-sans">
      <div className="w-full max-w-[400px] space-y-8 text-center">
        <h1 className="text-xl font-bold tracking-tight">Para abrir o conteúdo exclusivo</h1>

        <div className="relative overflow-hidden rounded-2xl bg-[#17212B] p-6 shadow-xl border border-white/5">
          <div className="space-y-6 text-left">
            {/* Passo 1 */}
            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3390ec] text-xs font-bold">
                1
              </div>
              <div className="flex flex-1 items-center justify-between">
                <p className="text-[15px] font-medium leading-tight">Clique nos três pontinhos</p>
                <div className="rounded-lg bg-[#3390ec]/10 p-1 ring-1 ring-[#3390ec]/30 shadow-[0_0_15px_rgba(51,144,236,0.2)]">
                  <MoreVertical className="h-5 w-5 text-[#3390ec]" />
                </div>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3390ec] text-xs font-bold">
                2
              </div>
              <p className="text-[15px] font-medium leading-tight">Aperte "Abrir no navegador"</p>
            </div>

            {/* Passo 3 */}
            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3390ec] text-xs font-bold">
                3
              </div>
              <p className="text-[14px] text-white/80 leading-snug">
                Depois clique em abrir para ver o conteúdo exclusivo. Vem amor, tô prontinha te esperando 😈
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => window.location.replace(DESTINATION_URL)}
          className="text-[13px] font-medium text-[#3390ec] underline underline-offset-4 hover:text-[#3390ec]/80 transition-colors"
        >
          Se não abrir, toque aqui para iniciar o bot
        </button>
      </div>
    </main>
  );
}
