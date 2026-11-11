import { readOrderLocation } from "./brazil-locations.server.ts";
import type { PurchaseCity, PurchaseGeography } from "./purchase-geography.types";

export interface PurchaseRow {
  id: string;
  order_id: string | null;
  created_at: string | Date;
  fields: Record<string, any>;
}

export function isConfirmedPurchase(fields: Record<string, any>): boolean {
  if (fields.integration_test === true || fields.integration_test === "true") return false;
  // An explicit pending/refunded/failed status overrides any legacy attribution flag.
  return fields.payment_status === "paid" || (!fields.payment_status && fields.utmify_paid_sent === true);
}

function timestamp(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value !== "string" || !value.trim()) return NaN;
  // Legacy UTMify timestamps were stored as UTC without an explicit zone.
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? `${value.replace(" ", "T")}Z` : value;
  return Date.parse(iso);
}

export function aggregatePurchaseGeography(
  rows: PurchaseRow[], start: string, end: string,
): PurchaseGeography {
  const result: PurchaseGeography = { total: 0, unmapped: 0, cities: [], states: [] };
  const seen = new Set<string>();
  const cityCounts = new Map<string, PurchaseCity>();
  const stateCounts = new Map<string, { code: string; name: string; count: number }>();
  const from = timestamp(start), to = timestamp(end);
  if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) throw new Error("Período inválido");
  for (const row of rows) {
    const fields = row.fields ?? {};
    if (!isConfirmedPurchase(fields)) continue;
    const paid = timestamp(fields.paid_at);
    const legacyPaid = timestamp(fields.utmify_payload?.approvedDate);
    const date = Number.isFinite(paid) ? paid : Number.isFinite(legacyPaid) ? legacyPaid : timestamp(row.created_at);
    if (!Number.isFinite(date) || date < from || date > to) continue;
    const key = row.order_id ? `order:${row.order_id}` : `row:${row.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.total++;
    const location = readOrderLocation(fields);
    const stateKey = location.region_code ?? "unknown";
    const state = stateCounts.get(stateKey);
    if (state) state.count++;
    else stateCounts.set(stateKey, { code: stateKey, name: location.region ?? "Não identificado", count: 1 });
    if (!location.municipality_id || location.lat === null || location.lng === null) {
      result.unmapped++;
      continue;
    }
    const cityKey = String(location.municipality_id);
    const city = cityCounts.get(cityKey);
    if (city) city.count++;
    else cityCounts.set(cityKey, {
      id: cityKey, city: location.city!, region: location.region!, region_code: location.region_code!,
      lat: location.lat, lng: location.lng, count: 1,
    });
  }
  result.cities = [...cityCounts.values()].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city, "pt-BR"));
  result.states = [...stateCounts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "pt-BR"));
  return result;
}
