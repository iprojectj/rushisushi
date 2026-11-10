import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";

interface Pt { lat: number | null; lng: number | null; city: string | null; region: string | null; id: string }
interface Agg { lat: number; lng: number; label: string; count: number }

/** Groups sessions by rounded coordinate so same-city visitors stack into one bigger dot. */
function group(list: Pt[]): Agg[] {
  const m = new Map<string, Agg>();
  for (const s of list) {
    if (s.lat == null || s.lng == null) continue;
    const k = `${s.lat.toFixed(1)},${s.lng.toFixed(1)}`;
    const cur = m.get(k);
    if (cur) cur.count++;
    else m.set(k, { lat: s.lat, lng: s.lng, label: [s.city, s.region].filter(Boolean).join(" - ") || "Desconhecido", count: 1 });
  }
  return [...m.values()];
}

export default function VisitorGlobe({ rows, live }: { rows: Pt[]; live: Pt[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const globe = useRef<GlobeMethods | undefined>(undefined);
  const [w, setW] = useState(600);
  const points = useMemo(() => group(rows), [rows]);
  const rings = useMemo(() => group(live), [live]);
  const max = Math.max(1, ...points.map((p) => p.count));

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const g = globe.current;
    if (!g) return;
    g.pointOfView({ lat: -15, lng: -50, altitude: 1.8 }, 0);
    const c = g.controls();
    c.autoRotate = true;
    c.autoRotateSpeed = 0.35;
  }, []);

  return (
    <div ref={wrap} className="relative overflow-hidden rounded-xl bg-muted/40">
      <Globe
        ref={globe}
        width={w}
        height={380}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
        atmosphereColor="#e11d48"
        atmosphereAltitude={0.15}
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => "#f59e0b"}
        pointAltitude={(d) => 0.01 + ((d as Agg).count / max) * 0.25}
        pointRadius={(d) => 0.25 + ((d as Agg).count / max) * 0.6}
        pointLabel={(d) => `${(d as Agg).label}: ${(d as Agg).count} visita(s)`}
        ringsData={rings}
        ringLat="lat"
        ringLng="lng"
        ringColor={() => (t: number) => `rgba(225,29,72,${1 - t})`}
        ringMaxRadius={4}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1200}
      />
      {points.length === 0 && (
        <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-muted-foreground">
          Os pontos aparecem conforme novas visitas chegam.
        </p>
      )}
    </div>
  );
}
