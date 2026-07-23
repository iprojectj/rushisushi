import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

const DEFAULT_LINK = "https://paylume.fans/l/6b589ea5?utm_source=kwai&utm_campaign=${CAMPAIGN_NAME}|${CAMPAIGN_ID}&utm_medium=${UNIT_NAME}|${UNIT_ID}&utm_content=${CREATIVE_NAME}|${CREATIVE_ID}&utm_term=${PLACEMENT_TYPE}&utm_id=${CLICK_ID}&shk=xqung0o4";

function Admin() {
  const [isExternalActive, setIsExternalActive] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");

  useEffect(() => {
    const savedActive = localStorage.getItem("redirect_external_active") === "true";
    const savedUrl = localStorage.getItem("redirect_external_url") || "";
    setIsExternalActive(savedActive);
    setExternalUrl(savedUrl);
  }, []);

  const handleSave = () => {
    localStorage.setItem("redirect_external_active", isExternalActive.toString());
    localStorage.setItem("redirect_external_url", externalUrl);
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <div className="min-h-screen bg-[#0B141B] text-white p-8 flex flex-col items-center">
      <Card className="w-full max-w-md bg-[#17212B] border-white/10 text-white">
        <CardHeader>
          <CardTitle>Painel de Controle de Redirecionamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="external-mode" className="text-sm font-medium">
              Ativar Redirect Externo
            </Label>
            <Switch
              id="external-mode"
              checked={isExternalActive}
              onCheckedChange={setIsExternalActive}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL de Destino Externa</Label>
            <Input
              id="url"
              placeholder="https://exemplo.com"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              className="bg-[#0B141B] border-white/10"
              disabled={!isExternalActive}
            />
            <p className="text-xs text-muted-foreground">
              Se desativado, o link padrão será usado:
              <br />
              <span className="truncate block opacity-50">{DEFAULT_LINK}</span>
            </p>
          </div>

          <Button onClick={handleSave} className="w-full bg-[#3390ec] hover:bg-[#3390ec]/90">
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
