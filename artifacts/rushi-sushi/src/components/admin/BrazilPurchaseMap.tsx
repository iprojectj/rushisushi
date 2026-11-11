import { useState } from "react";
import states from "./brazil-states.json";
import type { PurchaseCity } from "@/lib/purchase-geography.types";

/** Same projection as brazil-states.json: 10 SVG units/degree, origin -74 lng / 6 lat. */
const project = (lng: number, lat: number) => ({ x: (lng + 74) * 10, y: (6 - lat) * 10 });

export default function BrazilPurchaseMap({ cities }: { cities: PurchaseCity[] }) {
  const max = Math.max(1, ...cities.map((city) => city.count));
  const [hoverId, setHoverId] = useState<string | null>(null);
  const hover = cities.find((city) => city.id === hoverId);

  return (
    <div className="relative">
      <svg viewBox="0 0 430 400" className="h-auto max-h-[420px] w-full" role="img" aria-label="Mapa do Brasil com compras pagas por cidade">
        {(states as { n: string; d: string }[]).map((state) => (
          <path key={state.n} d={state.d} className="fill-muted stroke-border" strokeWidth={0.6}>
            <title>{state.n}</title>
          </path>
        ))}
        {cities.map((city) => {
          const { x, y } = project(city.lng, city.lat);
          const label = `${city.city} - ${city.region_code}: ${city.count} ${city.count === 1 ? "compra paga" : "compras pagas"}`;
          return (
            <g key={city.id} tabIndex={0} aria-label={label}
              onMouseEnter={() => setHoverId(city.id)} onMouseLeave={() => setHoverId(null)}
              onFocus={() => setHoverId(city.id)} onBlur={() => setHoverId(null)}
              onClick={() => setHoverId(city.id)} className="cursor-pointer">
              <title>{label}</title>
              <circle cx={x} cy={y} r={2.5 + Math.sqrt(city.count / max) * 9}
                className="fill-primary/70 stroke-background" strokeWidth={1} />
            </g>
          );
        })}
      </svg>
      {hover && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg border bg-card px-3 py-1.5 text-sm shadow-sm">
          <b>{hover.city} - {hover.region_code}</b> · {hover.count} {hover.count === 1 ? "compra paga" : "compras pagas"}
        </div>
      )}
      {cities.length === 0 && (
        <p className="absolute inset-x-0 bottom-2 text-center text-xs text-muted-foreground">
          Nenhuma compra paga com cidade identificada no período.
        </p>
      )}
    </div>
  );
}
