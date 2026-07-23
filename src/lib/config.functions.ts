import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Armazenamento em memória no servidor (Edge Runtime)
// Nota: Em serverless, isso reseta quando a instância morre, 
// mas é melhor que localStorage para persistência entre usuários diferentes.
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
    return { success: true, config: serverConfig };
  });
