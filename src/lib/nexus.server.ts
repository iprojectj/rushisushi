// Nexus Gateway helpers. Docs: https://nexuspag.com/docs

export const NEXUS_API_BASE_URL = "https://nexuspag.com";

export function getNexusHeaders() {
  // Use a chave nxp_live encontrada no histórico do chat
  const apiKey = process.env.NEXUSPAG_API_KEY || "nxp_live_f922d01154a31d2de0b9edaecb209c39cbfcc7d43234f33aa5efc3c7a2535b4f";
  
  return {
    "x-api-key": apiKey,
    "Content-Type": "application/json",
    "Accept": "application/json"
  };
}

export function limparNomeProdutoNexus(nome: string): string {
  let limpo = nome.replace(/^combo\s*/i, "");
  limpo = limpo.replace(/\s*\([^)]*\)/g, "");
  return limpo.trim();
}
