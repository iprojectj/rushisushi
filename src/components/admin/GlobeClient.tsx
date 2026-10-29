import { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import type { PresenceVisitor } from "./LivePresence";

// Client-only. Loaded via React.lazy from LivePresence.
export default function GlobeClient({ visitors }: { visitors: PresenceVisitor[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [size, setSize] = useState({ w: 400, h: 400 });

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setSize({ w: cr.width, h: cr.height });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;
    // slow rotation
    const controls = globeRef.current.controls?.();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.enableZoom = false;
    }
  }, []);

  const points = useMemo(
    () =>
      visitors.map((v) => ({
        lat: v.lat,
        lng: v.lng,
        size: 0.8,
        color: "#22e28a",
        label: v.city,
      })),
    [visitors],
  );

  const rings = useMemo(
    () =>
      visitors.slice(0, 30).map((v) => ({
        lat: v.lat,
        lng: v.lng,
        maxR: 4,
        propagationSpeed: 2,
        repeatPeriod: 1600,
      })),
    [visitors],
  );

  return (
    <div ref={wrapRef} className="h-full w-full">
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor="#22e28a"
        atmosphereAltitude={0.18}
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.02}
        pointRadius="size"
        pointLabel="label"
        ringsData={rings}
        ringColor={() => "rgba(34, 226, 138, 0.7)"}
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
      />
    </div>
  );
}
