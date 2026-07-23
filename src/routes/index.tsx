import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const TELEGRAM_URL = "https://paylume.fans/l/6b589ea5?shk=xqung0o4";

function Index() {
  const handleStart = () => {
    window.location.href = TELEGRAM_URL;
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Background with Telegram-like mesh/gradient effect */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div 
          className="h-full w-full" 
          style={{
            background: `radial-gradient(circle at 50% 50%, oklch(0.68 0.15 235 / 0.15) 0%, transparent 70%),
                        radial-gradient(circle at 20% 80%, oklch(0.68 0.15 235 / 0.05) 0%, transparent 50%)`,
            backgroundColor: 'var(--background)'
          }}
        />
      </div>

      <section className="relative z-10 w-full max-w-[360px]">
        <div className="flex flex-col items-center rounded-3xl bg-card/80 p-8 shadow-2xl backdrop-blur-sm sm:p-10 border border-white/5">
          {/* Avatar/Profile Image Section */}
          <div className="relative mb-6">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-brand/20 shadow-xl">
              <img 
                src="https://cdn1.telesco.pe/file/KtFIKE07glpcBYXtgvPq2zzTgCPBx4bvPFnBe__wIyDGQsyUGcOHXI6S9gyn0C2f-W4CuP2Qyud6a4-WmbjpjROKCo8iis7uu97BJM6aJNt79QMPfbt-GkT5UlQD3oHeE9OgWxM2KHXU8QTRxTqBXF9vEeEWSbwrYsOVQczPx5JhDGrvgW_URVJtQzftvQmzfZiJl_RtIvgFp410P8_DOF5yKqPKjxAx_ZQhZLX5w-tvPNyH8n4wXa2XU2uVdKqYk-m4P_3zl9lBpFVFIbQPSGhiXwPAddzfgpbkSkRJLE3Swt4uoxRTBRvExOzmHjc-YUN6ogO2LKLIqFnLlXxcUA.jpg" 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg border-2 border-card">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          {/* Identity Text */}
          <div className="text-center">
            <h1 className="flex items-center justify-center gap-1.5 text-xl font-bold text-foreground">
              Helena Sabrina ✝️
            </h1>
            <p className="mt-1 text-sm font-medium text-brand">
              @helenasabrinabot
            </p>
            <p className="mt-2 text-sm text-muted-foreground/80">
              71 487 monthly users
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleStart}
            size="lg"
            className="mt-8 h-12 w-full bg-brand text-base font-bold text-brand-foreground transition-all duration-300 hover:scale-[1.02] hover:bg-brand/90 active:scale-95 shadow-[0_4px_15px_rgba(59,130,246,0.3)]"
          >
            START BOT
          </Button>

          {/* Footer Text */}
          <div className="mt-8 text-center text-[13px] leading-relaxed text-muted-foreground/70">
            If you have <span className="font-semibold text-foreground">Telegram</span>, you can launch <br />
            <span className="font-semibold text-foreground">Helena Sabrina ✝️</span> right away.
          </div>
        </div>

        {/* Telegram Header-style Branding (Optional/Minimal) */}
        <div className="mt-8 flex items-center justify-center gap-2 opacity-40">
           <Send className="h-4 w-4" fill="currentColor" />
           <span className="text-xs font-medium uppercase tracking-widest">Telegram</span>
        </div>
      </section>
    </main>
  );
}
