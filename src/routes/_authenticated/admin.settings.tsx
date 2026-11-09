import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, CreditCard, Send } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/page-head";
import { GATEWAY_LABELS } from "@/lib/admin-orders";
import {
  getActiveGateway,
  setActiveGateway,
  getUtmifyTrackPaid,
  setUtmifyTrackPaid,
} from "@/lib/settings.functions";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => pageHead("Configurações — Rūshī Admin", "Configurações de pagamentos e rastreamento da Rūshī Sushi.", true),
  component: SettingsPage,
});

function SettingsPage() {
  const getGatewayFn = useServerFn(getActiveGateway);
  const setGatewayFn = useServerFn(setActiveGateway);
  const getTrackFn = useServerFn(getUtmifyTrackPaid);
  const setTrackFn = useServerFn(setUtmifyTrackPaid);

  const [gateway, setGateway] = useState<string | null>(null);
  const [savingGateway, setSavingGateway] = useState<string | null>(null);
  const [track, setTrack] = useState<boolean | null>(null);
  const [savingTrack, setSavingTrack] = useState(false);

  useEffect(() => {
    getGatewayFn().then(setGateway).catch(() => toast.error("Não foi possível ler o gateway ativo"));
    getTrackFn().then(setTrack).catch(() => toast.error("Não foi possível ler a configuração da UTMify"));
  }, [getGatewayFn, getTrackFn]);

  async function chooseGateway(g: string) {
    if (g === gateway || savingGateway) return;
    setSavingGateway(g);
    try {
      await setGatewayFn({ data: g } as never);
      setGateway(g);
      toast.success(`Gateway alterado para ${GATEWAY_LABELS[g]}`);
    } catch {
      toast.error("Erro ao alterar gateway");
    } finally {
      setSavingGateway(null);
    }
  }

  async function toggleTrack(enabled: boolean) {
    setSavingTrack(true);
    try {
      const r = await setTrackFn({ data: { enabled } });
      setTrack(r.enabled);
      toast.success(r.enabled ? "UTMify ligada: vendas serão enviadas" : "UTMify desligada: nenhuma venda será enviada");
    } catch {
      toast.error("Erro ao salvar configuração da UTMify");
    } finally {
      setSavingTrack(false);
    }
  }

  return (
    <AdminShell title="Configurações" subtitle="Pagamentos e integrações do site">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <header className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary"><CreditCard className="h-5 w-5" /></div>
            <div>
              <h2 className="font-semibold">Gateway de pagamento PIX</h2>
              <p className="text-xs text-muted-foreground">Escolha quem gera os novos PIX. Pedidos já criados não mudam.</p>
            </div>
          </header>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.entries(GATEWAY_LABELS).map(([key, label]) => {
              const active = gateway === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => chooseGateway(key)}
                  disabled={gateway === null || savingGateway !== null}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted",
                  )}
                >
                  <div>
                    <p className="font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      {savingGateway === key ? "Ativando..." : active ? "Em uso agora" : "Clique para usar"}
                    </p>
                  </div>
                  {active && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Se o gateway escolhido falhar, o site tenta os outros automaticamente.
          </p>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary"><Send className="h-5 w-5" /></div>
              <div>
                <h2 className="font-semibold">UTMify — enviar vendas</h2>
                <p className="text-xs text-muted-foreground">
                  {track === null
                    ? "Carregando..."
                    : track
                      ? "Ligado: vendas pendentes e pagas são enviadas à UTMify."
                      : "Desligado: nenhuma venda é enviada (nem pendente, nem paga). Este painel continua registrando tudo."}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={track ? "default" : "secondary"}>{track === null ? "..." : track ? "Ligado" : "Desligado"}</Badge>
              <Switch
                aria-label="Enviar vendas para a UTMify"
                checked={track ?? false}
                disabled={track === null || savingTrack}
                onCheckedChange={toggleTrack}
              />
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
