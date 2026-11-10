import { useMemo, useState } from "react";
import states from "./brazil-states.json";

interface Pt { lat: number | null; lng: number | null; city: string | null; region: string | null; id: string }
interface Agg { x: number; y: number; label: string; count: number; live: boolean }

/** Same projection used to build brazil-states.json: 10 SVG units per degree, origin at lng -74 / lat 6. */
const proj = (lng: number, lat: number) => ({ x: (lng + 74) * 10, y: (6 - lat) * 10 });

function group(rows: Pt[], live: Pt[]): Agg[] {
  const liveIds = new Set(live.map((l) => l.id));
  const m = new Map<string, Agg>();
  for (const s of rows) {
    if (s.lat == null || s.lng == null) continue;
    const k = `${s.lat.toFixed(1)},${s.lng.toFixed(1)}`;
    const cur = m.get(k);
    const isLive = liveIds.has(s.id);
    if (cur) { cur.count++; cur.live ||= isLive; }
    else m.set(k, { ...proj(s.lng, s.lat), label: [s.city, s.region].filter(Boolean).join(" - ") || "Desconhecido", count: 1, live: isLive });
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}

export default function BrazilVisitorMap({ rows, live }: { rows: Pt[]; live: Pt[] }) {
  const dots = useMemo(() => group(rows, live), [rows, live]);
  const max = Math.max(1, ...dots.map((d) => d.count));
  const [hover, setHover] = useState<Agg | null>(null);

  return (
    <div className="relative">
      <svg viewBox="0 0 400 400" className="h-auto max-h-[420px] w-full" role="img" aria-label="Mapa do Brasil com a localização dos visitantes">
        {(states as { n: string; d: string }[]).map((s) => (
          <path key={s.n} d={s.d} className="fill-muted stroke-border" strokeWidth={0.6}>
            <title>{s.n}</title>
          </path>
        ))}
        {dots.map((d) => {
          const r = 2.5 + Math.sqrt(d.count / max) * 9;
          return (
            <g key={`${d.x},${d.y}`} onMouseEnter={() => setHover(d)} onMouseLeave={() => setHover(null)} className="cursor-pointer">
              {d.live && (
                <circle cx={d.x} cy={d.y} r={r} className="fill-primary/40">
                  <animate attributeName="r" from={r} to={r + 10} dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.8" to="0" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={d.x} cy={d.y} r={r} className="fill-primary/70 stroke-background" strokeWidth={1} />
            </g>
          );
        })}
      </svg>
      {hover && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg border bg-card px-3 py-1.5 text-sm shadow-sm">
          <b>{hover.label}</b> · {hover.count} visita(s){hover.live && " · online agora"}
        </div>
      )}
      {dots.length === 0 && (
        <p className="absolute inset-x-0 bottom-2 text-center text-xs text-muted-foreground">As bolinhas aparecem conforme novas visitas chegam.</p>
      )}
    </div>
  );
}
