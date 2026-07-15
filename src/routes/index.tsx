import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Send } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const TELEGRAM_URL = "https://telegram.me/milenaonline_bot?start=492a9ebd";

type Step = "age" | "robot" | "ready";

function Index() {
  const [step, setStep] = useState<Step>("age");

  const trackClick = (name: string) => {
    if (typeof window !== "undefined") {
      const w = window as unknown as {
        ttq?: { track: (e: string, p?: Record<string, unknown>) => void };
      };
      w.ttq?.track("ClickButton", { content_name: name });
    }
  };

  const handleAgeYes = () => {
    trackClick("age_yes");
    setStep("robot");
  };

  const handleAgeNo = () => {
    trackClick("age_no");
    window.location.href = "https://www.google.com";
  };

  const handleRobot = () => {
    trackClick("not_robot");
    setStep("ready");
  };

  const handleFinal = () => {
    trackClick("cta_telegram");
    window.location.href = TELEGRAM_URL;
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-md">
        <div className="rounded-2xl bg-card p-8 shadow-xl sm:p-10">
          {/* Telegram logo */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand shadow-lg">
            <Send className="h-8 w-8 -translate-x-0.5 translate-y-0.5 text-brand-foreground" fill="currentColor" />
          </div>

          {step === "age" && (
            <>
              <h1 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">
                Você é maior de 18 anos?
              </h1>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Este conteúdo é destinado apenas para adultos.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <Button
                  onClick={handleAgeNo}
                  variant="outline"
                  size="lg"
                  className="h-12 text-base"
                >
                  Não
                </Button>
                <Button
                  onClick={handleAgeYes}
                  size="lg"
                  className="h-12 bg-brand text-base font-semibold text-brand-foreground hover:bg-brand/90"
                >
                  Sim
                </Button>
              </div>
            </>
          )}

          {step === "robot" && (
            <>
              <h1 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">
                Confirme que você não é um robô
              </h1>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Toque na caixa abaixo para continuar.
              </p>
              <button
                onClick={handleRobot}
                className="mt-8 flex w-full items-center gap-4 rounded-xl border border-border bg-secondary px-5 py-4 text-left transition hover:bg-secondary/70"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded border-2 border-muted-foreground/40 bg-card" />
                <span className="text-sm font-medium text-foreground">
                  Não sou um robô
                </span>
              </button>
            </>
          )}

          {step === "ready" && (
            <>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                <Check className="h-6 w-6 text-brand" />
              </div>
              <h1 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">
                Verificação concluída
              </h1>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Clique abaixo para acessar o Telegram.
              </p>
              <Button
                onClick={handleFinal}
                size="lg"
                className="mt-8 h-12 w-full bg-brand text-base font-semibold text-brand-foreground hover:bg-brand/90"
              >
                <Send className="mr-2 h-5 w-5" fill="currentColor" />
                Acessar Telegram
              </Button>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ao continuar, você confirma ter mais de 18 anos.
        </p>
      </section>
    </main>
  );
}
