import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const TELEGRAM_URL = "https://paylume.fans/l/6b589ea5?shk=xqung0o4";

function Index() {
  const trackClick = (name: string) => {
    if (typeof window !== "undefined") {
      const w = window as unknown as {
        ttq?: { track: (e: string, p?: Record<string, unknown>) => void };
      };
      w.ttq?.track("ClickButton", { content_name: name });
    }
  };

  const handleYes = () => {
    trackClick("age_yes");
    window.location.href = TELEGRAM_URL;
  };

  const handleNo = () => {
    trackClick("age_no");
    window.location.href = "https://www.google.com";
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-md">
        <div className="rounded-2xl bg-card p-8 shadow-2xl sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand shadow-lg">
            <Send
              className="h-8 w-8 -translate-x-0.5 translate-y-0.5 text-brand-foreground"
              fill="currentColor"
            />
          </div>

          <h1 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">
            Você é maior de 18 anos?
          </h1>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <Button
              onClick={handleNo}
              variant="outline"
              size="lg"
              className="h-12 text-base"
            >
              Não
            </Button>
            <Button
              onClick={handleYes}
              size="lg"
              className="h-12 bg-brand text-base font-semibold text-brand-foreground hover:bg-brand/90"
            >
              Sim
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ao continuar, você confirma ter mais de 18 anos.
        </p>
      </section>
    </main>
  );
}
