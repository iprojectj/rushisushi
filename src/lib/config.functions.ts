import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Armazenamento em memória no servidor (Edge Runtime)
// Nota: Em serverless, isso reseta quando a instância morre.
// Com Lovable Cloud, usaremos o banco de dados.
let serverConfig = {
  isExternalActive: false,
  externalUrl: ""
};

export const getConfig = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      const { data, error } = await supabaseAdmin
        .from('site_config')
        .select('*')
        .eq('key', 'traffic_config')
        .single();
      
      if (data) {
        return data.value;
      }
    } catch (e) {
      console.error("Supabase not available or error:", e);
    }
    return serverConfig;
  });

export const updateConfig = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    isExternalActive: z.boolean(),
    externalUrl: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    serverConfig = data;
    
    try {
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      const { error } = await supabaseAdmin
        .from('site_config')
        .upsert({ 
          key: 'traffic_config', 
          value: data,
          updated_at: new Error().toISOString() // Force update timestamp
        }, { onConflict: 'key' });
      
      if (error) console.error("Supabase upsert error:", error);
    } catch (e) {
      console.error("Supabase not available or error during update:", e);
    }
    
    return { success: true, config: serverConfig };
  });
