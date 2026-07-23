import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Armazenamento em memória no servidor (Edge Runtime)
// Nota: Em serverless, isso reseta quando a instância morre.
// Sem Lovable Cloud (supabase), usamos apenas memória volátil.
let serverConfig = {
  isExternalActive: false,
  externalUrl: ""
};

export const getConfig = createServerFn({ method: "GET" })
  .handler(async () => {
    return serverConfig;
  });

export const updateConfig = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    isExternalActive: z.boolean(),
    externalUrl: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    serverConfig = data;
    console.log("Global config updated to:", serverConfig);
    return { success: true, config: serverConfig };
  });
