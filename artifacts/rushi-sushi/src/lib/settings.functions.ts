import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdmin } from "@/lib/admin-auth.functions";

export const getActiveGateway = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", "active_gateway")
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching active gateway:", error);
      return "kalangfy";
    }
    
    let value = data?.value;
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch {
        // ignore
      }
    }
    
    return (value as string) || "kalangfy";
  });

export const setActiveGateway = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .handler(async (ctx: { data: any }) => {
    const gateway = z.enum(["paradise", "gorilla", "azipix", "invictus", "kalangfy"]).parse(ctx.data);
    
    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({ key: "active_gateway", value: gateway });

    if (error) {
      console.error("Error setting active gateway:", error);
      throw error;
    }

    return { success: true, gateway };
  });

// UTMify approval tracking defaults to enabled.

export const UTMIFY_TRACK_PAID_KEY = "utmify_track_paid";

export const getUtmifyTrackPaid = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
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
  .middleware([requireAdmin])
  .inputValidator((input: { enabled: boolean }) => z.object({ enabled: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({ key: UTMIFY_TRACK_PAID_KEY, value: data.enabled });
    if (error) throw error;
    return { enabled: data.enabled };
  });
