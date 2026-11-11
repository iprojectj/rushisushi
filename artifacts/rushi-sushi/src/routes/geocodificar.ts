import { createFileRoute } from "@tanstack/react-router";

/**
 * Geocodificação precisa (rua + número) via Google Maps, usada pelo mapa da tela de pagamento.
 * Endpoint público por necessidade (o checkout não exige login), então:
 * - aceita apenas campos curtos de endereço brasileiro (nunca URL arbitrária);
 * - restringe resultados ao Brasil;
 * - guarda em cache na memória para não repetir cobranças do mesmo endereço.
 */
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const cache = new Map<string, { lat: number; lon: number; exact: boolean } | null>();

const field = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, "").trim().slice(0, max) : "";

export const Route = createFileRoute("/geocodificar")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const json = (body: unknown, status = 200) =>
          new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
        try {
          const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
          const rua = field(b.rua, 120);
          const numero = field(b.numero, 12);
          const bairro = field(b.bairro, 80);
          const cidade = field(b.cidade, 80);
          const estado = field(b.estado, 30);
          const cep = field(b.cep, 9).replace(/\D/g, "");
          if (!rua || !cidade) return json({ error: "Endereço incompleto" }, 400);

          const address = [[rua, numero].filter(Boolean).join(", "), bairro, `${cidade}${estado ? " - " + estado : ""}`, cep.length === 8 ? cep.replace(/(\d{5})(\d{3})/, "$1-$2") : "", "Brasil"]
            .filter(Boolean)
            .join(", ");
          const key = address.toLowerCase();
          if (cache.has(key)) return json({ result: cache.get(key) });

          const lovableKey = process.env.LOVABLE_API_KEY;
          const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
          if (!lovableKey || !mapsKey) return json({ error: "Mapa não configurado" }, 503);

          const res = await fetch(
            `${GATEWAY_URL}/maps/api/geocode/json?language=pt-BR&region=br&components=country:BR&address=${encodeURIComponent(address)}`,
            { headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": mapsKey } },
          );
          if (!res.ok) {
            console.error(`Geocode falhou [${res.status}]: ${await res.text()}`);
            return json({ error: "Falha na geocodificação" }, 502);
          }
          const data = (await res.json()) as any;
          const first = data?.results?.[0];
          const loc = first?.geometry?.location;
          const result =
            loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng)
              ? {
                  lat: loc.lat as number,
                  lon: loc.lng as number,
                  exact: ["ROOFTOP", "RANGE_INTERPOLATED"].includes(first.geometry.location_type),
                }
              : null;
          if (cache.size > 2000) cache.clear();
          cache.set(key, result);
          return json({ result });
        } catch (e) {
          console.error("Erro geocodificar:", e);
          return json({ error: "Erro interno" }, 500);
        }
      },
    },
  },
});
