import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { getConfig, updateConfig } from "@/lib/config.functions";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

const DEFAULT_LINK = "https://paylume.fans/l/6b589ea5?utm_source=kwai&utm_campaign=${CAMPAIGN_NAME}|${CAMPAIGN_ID}&utm_medium=${UNIT_NAME}|${UNIT_ID}&utm_content=${CREATIVE_NAME}|${CREATIVE_ID}&utm_term=${PLACEMENT_TYPE}&utm_id=${CLICK_ID}&shk=xqung0o4";

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  
  const [isExternalActive, setIsExternalActive] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getConfig();
        setIsExternalActive(config.isExternalActive);
        setExternalUrl(config.externalUrl);
      } catch (error) {
        console.error("Failed to load server config:", error);
        // Fallback para local
        const savedActive = localStorage.getItem("redirect_external_active") === "true";
        const savedUrl = localStorage.getItem("redirect_external_url") || "";
        setIsExternalActive(savedActive);
        setExternalUrl(savedUrl);
      }
    };

    loadConfig();
    
    const authSession = localStorage.getItem("admin_auth_session");
    if (authSession === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === "admin@admin.admin" && password === "adminSelmaelias1!") {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth_session", "true");
      toast.success("Login realizado com sucesso!");
    } else {
      toast.error("Credenciais inválidas");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_auth_session");
    toast.info("Sessão encerrada");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Salva no Servidor (Persistente entre sessões)
      await updateConfig({
        data: {
          isExternalActive,
          externalUrl
        }
      });

      // Salva no LocalStorage (Redundância/Fallback)
      localStorage.setItem("redirect_external_active", isExternalActive.toString());
      localStorage.setItem("redirect_external_url", externalUrl);
      
      toast.success("Configurações aplicadas globalmente!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Erro ao salvar no servidor. Salvo apenas localmente.");
      
      // Fallback local se o servidor falhar
      localStorage.setItem("redirect_external_active", isExternalActive.toString());
      localStorage.setItem("redirect_external_url", externalUrl);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B141B] text-white p-8 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md bg-[#17212B] border-white/10 text-white shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-[#3390ec]/10 p-3 rounded-full w-fit mb-2">
              <Lock className="h-6 w-6 text-[#3390ec]" />
            </div>
            <CardTitle className="text-xl">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Login</Label>
                <Input
                  id="email"
                  type="email"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="bg-[#0B141B] border-white/10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#0B141B] border-white/10"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#3390ec] hover:bg-[#3390ec]/90 font-bold mt-2">
                Entrar no Painel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B141B] text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold text-white/60">Painel Administrativo</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/40 hover:text-white">
          Sair
        </Button>
      </div>

      <Card className="w-full max-w-md bg-[#17212B] border-white/10 text-white shadow-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Configuração de Tráfego</CardTitle>
            {isExternalActive ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex gap-1 items-center px-2 py-0.5">
                <CheckCircle2 className="h-3 w-3" /> ATIVO
              </Badge>
            ) : (
              <Badge variant="outline" className="text-white/40 border-white/10 flex gap-1 items-center px-2 py-0.5">
                PADRÃO
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B141B]/50 border border-white/5">
            <div className="space-y-0.5">
              <Label htmlFor="external-mode" className="text-sm font-bold">
                Modo Externo
              </Label>
              <p className="text-xs text-white/40">Sobrescrever link padrão</p>
            </div>
            <Switch
              id="external-mode"
              checked={isExternalActive}
              onCheckedChange={setIsExternalActive}
              className="data-[state=checked]:bg-green-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="url" className="text-sm font-medium">Link de Redirecionamento</Label>
              {!isExternalActive && (
                <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Usando Padrão</span>
              )}
            </div>
            
            <div className="relative">
              <Input
                id="url"
                placeholder="https://sua-url-aqui.com"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className={`bg-[#0B141B] border-white/10 transition-all ${!isExternalActive ? 'opacity-40 grayscale' : 'border-blue-500/50 ring-1 ring-blue-500/20'}`}
                disabled={!isExternalActive}
              />
            </div>
            
            <div className="p-3 rounded-lg bg-black/20 border border-white/5 space-y-1">
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-tighter flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Link Atual em Produção:
              </p>
              <p className="text-xs break-all text-white/60 leading-relaxed italic">
                {isExternalActive ? (externalUrl || "Nenhum link configurado") : DEFAULT_LINK}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`w-full font-bold h-12 transition-all shadow-lg ${isSaving ? 'bg-white/10' : 'bg-[#3390ec] hover:bg-[#3390ec]/90 hover:scale-[1.02] active:scale-[0.98]'}`}
          >
            {isSaving ? "Aplicando..." : "Salvar e Ativar"}
          </Button>
        </CardFooter>
      </Card>
      
      <p className="mt-6 text-[11px] text-white/20 uppercase tracking-[0.2em] font-medium">
        Sistema de Controle v2.0
      </p>
    </div>
  );
}
