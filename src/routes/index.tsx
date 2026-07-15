import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Lock, Users, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const TELEGRAM_URL = "https://telegram.me/milenaonline_bot?start=492a9ebd";

function Index() {
  const [onlineCount, setOnlineCount] = useState(127);
  const [spotsLeft, setSpotsLeft] = useState(7);

  useEffect(() => {
    // Simulate a small fluctuation in "online now" count for social proof
    const interval = setInterval(() => {
      setOnlineCount((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(110, Math.min(145, prev + change));
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleCtaClick = () => {
    if (typeof window !== "undefined" && (window as unknown as { ttq?: { track: (event: string, params?: Record<string, unknown>) => void } }).ttq) {
      (window as unknown as { ttq: { track: (event: string, params?: Record<string, unknown>) => void } }).ttq.track("ClickButton", {
        content_name: "cta_telegram",
        content_category: "pre_sell",
      });
    }
    window.location.href = TELEGRAM_URL;
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream px-4 py-12 sm:px-6 lg:px-8">
      {/* Soft decorative background blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-warm/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-rose/10 blur-3xl"
      />

      <section className="relative z-10 w-full max-w-lg">
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-8 shadow-2xl shadow-foreground/5 backdrop-blur-sm sm:p-10">
          {/* Live indicator */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose" />
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {onlineCount} pessoas online agora
            </span>
          </div>

          {/* Avatar */}
          <div className="mx-auto mb-6 h-28 w-28 overflow-hidden rounded-full border-4 border-card shadow-xl ring-2 ring-rose/20">
            <img
              src="/images/milena-avatar.jpg"
              alt="Milena"
              width={112}
              height={112}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Headline */}
          <h1 className="text-center text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
            Acesso Exclusivo Liberado
          </h1>

          <p className="mt-4 text-center text-base leading-relaxed text-muted-foreground">
            Fale direto comigo no Telegram. Conteúdo exclusivo, conversa sem filtro e uma experiência
            bem mais próxima do que você está acostumado.
          </p>

          {/* Value props */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-secondary/60 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose/10 text-rose">
                <MessageCircle className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-secondary-foreground">
                Respostas em tempo real, só nós dois
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-secondary/60 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose/10 text-rose">
                <Lock className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-secondary-foreground">
                Conteúdo privado e fora das redes sociais
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-secondary/60 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose/10 text-rose">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-secondary-foreground">
                Acesso antecipado a novidades exclusivas
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10">
            <Button
              onClick={handleCtaClick}
              size="lg"
              className="group relative w-full whitespace-normal bg-brand px-4 py-6 text-base font-semibold leading-tight text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:bg-brand/90 hover:shadow-xl hover:shadow-brand/30 active:scale-[0.98] sm:py-7 sm:text-lg sm:whitespace-nowrap"
            >
              Falar com a Milena no Telegram
              <ArrowRight className="ml-2 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Clique no botão e você será redirecionado automaticamente para o Telegram.
            </p>
          </div>

          {/* Scarcity / social proof */}
          <div className="mt-8 flex items-center justify-between rounded-2xl border border-border/60 bg-cream/60 px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 text-rose" />
              <span>Vagas limitadas hoje</span>
            </div>
            <div className="text-sm font-semibold text-rose">{spotsLeft} restantes</div>
          </div>
        </div>

        {/* Trust footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground/80">
          Acesso 100% gratuito e discreto. Nada aparece no seu feed público.
        </p>
      </section>
    </main>
  );
}
