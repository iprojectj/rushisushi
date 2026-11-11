import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/auth")({
  head: () => pageHead("Acesso administrativo — Rūshī Sushi", "Acesso restrito ao painel administrativo Rūshī Sushi.", true),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const response = await fetch("/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password }),
    });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok || !result.success) {
      toast.error("Login inválido", { description: result.message || "Verifique usuário e senha." });
      return;
    }
    navigate({ to: "/admin/leads" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin — Rūshī Sushi</CardTitle>
          <CardDescription>Acesso restrito</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">Usuário</Label>
              <Input
                id="user"
                autoComplete="username"
                value="admin"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd">Senha</Label>
              <Input
                id="pwd"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
