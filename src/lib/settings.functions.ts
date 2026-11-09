import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getActiveGateway = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", "active_gateway")
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching active gateway:", error);
      return "paradise";
    }
    
    let value = data?.value;
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch {
        // ignore
      }
    }
    
    return (value as string) || "paradise";
  });

export const setActiveGateway = createServerFn({ method: "POST" })
  .handler(async (ctx: { data: any }) => {
    const gateway = z.enum(["paradise", "pagbank", "gorilla", "azipix", "invictus", "infinitepay"]).parse(ctx.data);
    
    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({ key: "active_gateway", value: JSON.stringify(gateway) });

    if (error) {
      console.error("Error setting active gateway:", error);
      throw error;
    }

    return { success: true, gateway };
  });

// ---------------------------------------------------------------------------
// UTMify: liga/desliga do envio de vendas APROVADAS (status "paid").
// Quando desligado, pedidos continuam sendo enviados como pendentes, mas a
// confirmação de pagamento não é repassada à UTMify. Padrão: ligado.
// ---------------------------------------------------------------------------
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const UTMIFY_TRACK_PAID_KEY = "utmify_track_paid";

export const getUtmifyTrackPaid = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", UTMIFY_TRACK_PAID_KEY)
      .maybeSingle();
    let value: unknown = data?.value;
    if (typeof value === "string") {
      try { value = JSON.parse(value); } catch { /* ignore */ }
    }
    return value !== false;
  });

export const setUtmifyTrackPaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { enabled: boolean }) => z.object({ enabled: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Acesso negado");
    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({ key: UTMIFY_TRACK_PAID_KEY, value: JSON.stringify(data.enabled) });
    if (error) throw error;
    return { enabled: data.enabled };
  });
