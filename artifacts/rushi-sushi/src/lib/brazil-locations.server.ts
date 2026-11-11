import municipalities from "../data/brazil-municipalities.json" with { type: "json" };
import type { PurchaseLocation } from "./purchase-geography.types";

const STATES: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará",
  DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão",
  MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará",
  PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte", RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima",
  SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};
const clean = (value: unknown, max = 100) =>
  typeof value === "string" ? value.replace(/[\u0000-\u001f]/g, "").trim().slice(0, max) : "";
const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
type Municipality = [number, string, string, number, number];
const cities = new Map((municipalities as Municipality[]).map((city) =>
  [`${city[2]}:${normalize(city[1])}`, city]));

export function normalizeState(value: unknown): string | null {
  const state = clean(value).replace(/^BR-/i, "");
  if (STATES[state.toUpperCase()]) return state.toUpperCase();
  return Object.keys(STATES).find((uf) => normalize(STATES[uf]) === normalize(state)) ?? null;
}

/** Municipality centroids, never a fabricated fallback to a state capital. */
export function locateMunicipality(cityValue: unknown, stateValue: unknown): PurchaseLocation {
  const uf = normalizeState(stateValue);
  const cityName = clean(cityValue);
  const city = uf ? cities.get(`${uf}:${normalize(cityName)}`) : undefined;
  return {
    municipality_id: city?.[0] ?? null,
    city: city?.[1] ?? (cityName || null),
    region: uf ? STATES[uf] : null,
    region_code: uf,
    lat: city?.[3] ?? null,
    lng: city?.[4] ?? null,
  };
}

export function readOrderLocation(fields: Record<string, any>): PurchaseLocation {
  const value = fields.location ?? fields.endereco ?? fields.address;
  const address = value && typeof value === "object" ? value : {};
  return locateMunicipality(
    address.city ?? address.cidade ?? fields.cidade ?? fields.city,
    address.region_code ?? address.estado ?? address.state ?? address.region ?? fields.estado ?? fields.state,
  );
}

/** Resolve the delivery CEP on the server; checkout city/UF is a validated fallback. */
export async function captureCheckoutLocation(
  body: Record<string, unknown>,
  fetcher: typeof fetch = fetch,
): Promise<PurchaseLocation & { cep: string | null; source: string }> {
  const cep = clean(body.cep, 12).replace(/\D/g, "");
  const fallback = locateMunicipality(body.cidade, body.estado);
  if (cep.length === 8) {
    try {
      const response = await fetcher(`https://viacep.com.br/ws/${cep}/json/`, {
        signal: AbortSignal.timeout(2000),
      });
      if (!response.ok) throw new Error(`CEP lookup HTTP ${response.status}`);
      const address = await response.json();
      const location = locateMunicipality(address.localidade, address.uf);
      if (!address.erro && location.region_code) return { ...location, cep, source: "cep" };
    } catch {
      // Location enrichment must not fail a payment. Preserve unknowns explicitly.
      console.warn("[purchase-location] CEP indisponível; usando cidade/UF informados, se válidos.");
    }
  }
  return { ...fallback, cep: cep.length === 8 ? cep : null, source: fallback.region_code ? "checkout" : "unavailable" };
}
