import { useEffect, useRef, useState, lazy, Suspense, Component, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

// Timezone -> approximate lat/lng of a representative major city.
// Not exhaustive, but covers the majority of real traffic. Unknown TZs fall back to (0,0) and are dropped.
const TZ_COORDS: Record<string, { lat: number; lng: number; city: string }> = {
  "America/Sao_Paulo": { lat: -23.55, lng: -46.63, city: "São Paulo" },
  "America/Bahia": { lat: -12.97, lng: -38.5, city: "Salvador" },
  "America/Fortaleza": { lat: -3.72, lng: -38.54, city: "Fortaleza" },
  "America/Recife": { lat: -8.05, lng: -34.9, city: "Recife" },
  "America/Belem": { lat: -1.46, lng: -48.5, city: "Belém" },
  "America/Manaus": { lat: -3.12, lng: -60.02, city: "Manaus" },
  "America/Cuiaba": { lat: -15.6, lng: -56.1, city: "Cuiabá" },
  "America/Campo_Grande": { lat: -20.44, lng: -54.65, city: "Campo Grande" },
  "America/Porto_Velho": { lat: -8.76, lng: -63.9, city: "Porto Velho" },
  "America/Rio_Branco": { lat: -9.97, lng: -67.8, city: "Rio Branco" },
  "America/Noronha": { lat: -3.85, lng: -32.42, city: "Noronha" },
  "America/Mexico_City": { lat: 19.43, lng: -99.13, city: "CDMX" },
  "America/Monterrey": { lat: 25.68, lng: -100.32, city: "Monterrey" },
  "America/Cancun": { lat: 21.16, lng: -86.85, city: "Cancún" },
  "America/Tijuana": { lat: 32.5, lng: -117.02, city: "Tijuana" },
  "America/Bogota": { lat: 4.71, lng: -74.07, city: "Bogotá" },
  "America/Lima": { lat: -12.05, lng: -77.04, city: "Lima" },
  "America/Santiago": { lat: -33.45, lng: -70.66, city: "Santiago" },
  "America/Buenos_Aires": { lat: -34.6, lng: -58.38, city: "Buenos Aires" },
  "America/Argentina/Buenos_Aires": { lat: -34.6, lng: -58.38, city: "Buenos Aires" },
  "America/Caracas": { lat: 10.5, lng: -66.9, city: "Caracas" },
  "America/New_York": { lat: 40.71, lng: -74.0, city: "New York" },
  "America/Chicago": { lat: 41.88, lng: -87.63, city: "Chicago" },
  "America/Denver": { lat: 39.74, lng: -104.99, city: "Denver" },
  "America/Los_Angeles": { lat: 34.05, lng: -118.24, city: "Los Angeles" },
  "America/Phoenix": { lat: 33.45, lng: -112.07, city: "Phoenix" },
  "America/Toronto": { lat: 43.65, lng: -79.38, city: "Toronto" },
  "America/Vancouver": { lat: 49.28, lng: -123.12, city: "Vancouver" },
  "Europe/London": { lat: 51.5, lng: -0.13, city: "London" },
  "Europe/Lisbon": { lat: 38.72, lng: -9.14, city: "Lisboa" },
  "Europe/Madrid": { lat: 40.42, lng: -3.7, city: "Madrid" },
  "Europe/Paris": { lat: 48.86, lng: 2.35, city: "Paris" },
  "Europe/Berlin": { lat: 52.52, lng: 13.4, city: "Berlin" },
  "Europe/Rome": { lat: 41.9, lng: 12.5, city: "Roma" },
  "Europe/Amsterdam": { lat: 52.37, lng: 4.9, city: "Amsterdam" },
  "Europe/Moscow": { lat: 55.75, lng: 37.62, city: "Moscow" },
  "Africa/Johannesburg": { lat: -26.2, lng: 28.05, city: "Joburg" },
  "Africa/Cairo": { lat: 30.05, lng: 31.24, city: "Cairo" },
  "Africa/Lagos": { lat: 6.52, lng: 3.38, city: "Lagos" },
  "Asia/Tokyo": { lat: 35.68, lng: 139.69, city: "Tokyo" },
  "Asia/Seoul": { lat: 37.57, lng: 126.98, city: "Seoul" },
  "Asia/Shanghai": { lat: 31.23, lng: 121.47, city: "Shanghai" },
  "Asia/Hong_Kong": { lat: 22.32, lng: 114.17, city: "Hong Kong" },
  "Asia/Singapore": { lat: 1.35, lng: 103.82, city: "Singapore" },
  "Asia/Dubai": { lat: 25.2, lng: 55.27, city: "Dubai" },
  "Asia/Kolkata": { lat: 19.08, lng: 72.88, city: "Mumbai" },
  "Australia/Sydney": { lat: -33.87, lng: 151.21, city: "Sydney" },
  "Pacific/Auckland": { lat: -36.85, lng: 174.76, city: "Auckland" },
};

export type PresenceVisitor = {
  key: string;
  tz: string;
  path: string;
  at: number;
  lat: number;
  lng: number;
  city: string;
};

type PresenceSnapshot = {
  visitors: PresenceVisitor[];
  connected: boolean;
};

type PresenceChannel = ReturnType<typeof supabase.channel>;

const presenceListeners = new Set<() => void>();
let presenceSnapshot: PresenceSnapshot = { visitors: [], connected: false };
let presenceChannel: PresenceChannel | null = null;
let presenceStarted = false;
let presencePollId: ReturnType<typeof setInterval> | null = null;

function emitPresenceSnapshot(next: PresenceSnapshot) {
  presenceSnapshot = next;
  presenceListeners.forEach((listener) => listener());
}

function readVisitorsFromChannel(channel: PresenceChannel): PresenceVisitor[] {
  const state = channel.presenceState();
  const list: PresenceVisitor[] = [];

  for (const key of Object.keys(state)) {
    const metas = state[key] as unknown as Array<{
      tz?: string;
      path?: string;
      at?: number;
    }>;

    for (const m of metas) {
      const tz = m.tz ?? "";
      const coord = TZ_COORDS[tz];
      if (!coord) continue;

      list.push({
        key,
        tz,
        path: m.path ?? "/",
        at: m.at ?? Date.now(),
        lat: coord.lat + (Math.random() - 0.5) * 0.6,
        lng: coord.lng + (Math.random() - 0.5) * 0.6,
        city: coord.city,
      });
    }
  }

  return list;
}

function startPresenceSubscription() {
  if (presenceStarted) return;
  presenceStarted = true;

  try {
    const channel = supabase.channel("site-presence", {
      config: {
        presence: {
          key: "admin-monitor-" + Math.random().toString(36).slice(2, 8),
        },
      },
    });
    presenceChannel = channel;

    const rebuild = (connected = presenceSnapshot.connected) => {
      try {
        emitPresenceSnapshot({ connected, visitors: readVisitorsFromChannel(channel) });
      } catch (error) {
        console.warn("[LivePresence] failed to read presence state:", error);
      }
    };

    try {
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") rebuild(true);
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          emitPresenceSnapshot({ connected: false, visitors: presenceSnapshot.visitors });
        }
      });
    } catch (error) {
      console.warn("[LivePresence] presence channel was already subscribed:", error);
    }

    presencePollId = setInterval(() => rebuild(), 2500);
    rebuild();
  } catch (error) {
    console.warn("[LivePresence] failed to start realtime presence:", error);
    if (presencePollId) clearInterval(presencePollId);
    presencePollId = null;
    if (presenceChannel) supabase.removeChannel(presenceChannel);
    presenceChannel = null;
    presenceStarted = false;
    emitPresenceSnapshot({ visitors: [], connected: false });
  }
}

export function usePresence() {
  const [snapshot, setSnapshot] = useState<PresenceSnapshot>(presenceSnapshot);

  useEffect(() => {
    const update = () => setSnapshot(presenceSnapshot);
    presenceListeners.add(update);
    startPresenceSubscription();
    update();
    return () => {
      presenceListeners.delete(update);
    };
  }, []);

  return snapshot;
}

export function LivePresenceBadge({ inline = false }: { inline?: boolean }) {
  const { visitors, connected } = usePresence();
  const count = visitors.length;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--secondary)]/50 px-3 py-2",
        inline && "py-1.5",
      )}
    >
      <span className="relative flex h-2.5 w-2.5">
        {connected && count > 0 && (
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75 pulse-dot"
            style={{ background: "var(--primary)" }}
          />
        )}
        <span
          className="relative inline-flex h-2.5 w-2.5 rounded-full"
          style={{ background: connected ? "var(--primary)" : "var(--muted-foreground)" }}
        />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] leading-none">
          Ao vivo agora
        </p>
        <p className="mt-0.5 text-lg font-bold tabular-nums leading-none">
          {count}
          <span className="ml-1 text-[10px] font-normal text-[var(--muted-foreground)]">
            {count === 1 ? "visitante" : "visitantes"}
          </span>
        </p>
      </div>
      <Radio className="h-4 w-4 text-[var(--primary)]" />
    </div>
  );
}

// Client-only globe (react-globe.gl uses WebGL / window)
const GlobeClient = lazy(() => import("./GlobeClient"));

export function LiveGlobeCard() {
  const { visitors, connected } = usePresence();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative overflow-hidden rounded-2xl glass p-4 md:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
            Presença global
          </p>
          <h3 className="mt-1 text-xl font-bold md:text-2xl">
            {visitors.length}{" "}
            <span className="text-sm font-normal text-[var(--muted-foreground)]">
              {visitors.length === 1 ? "pessoa navegando" : "pessoas navegando"}
            </span>
          </h3>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {connected ? "Sincronizado em tempo real" : "Conectando..."}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] pulse-dot" />
          Live
        </div>
      </div>

      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black md:aspect-[16/10]">
        {mounted ? (
          <GlobeErrorBoundary fallback={<GlobeSkeleton />}>
            <Suspense fallback={<GlobeSkeleton />}>
              <GlobeClient visitors={visitors} />
            </Suspense>
          </GlobeErrorBoundary>
        ) : (
          <GlobeSkeleton />
        )}
      </div>

      {visitors.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {Array.from(new Set(visitors.map((v) => v.city)))
            .slice(0, 10)
            .map((city) => {
              const n = visitors.filter((v) => v.city === city).length;
              return (
                <span
                  key={city}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--secondary)]/40 px-2.5 py-1 text-xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                  {city}
                  <span className="text-[var(--muted-foreground)]">· {n}</span>
                </span>
              );
            })}
        </div>
      )}
    </div>
  );
}

function GlobeSkeleton() {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="text-xs text-[var(--muted-foreground)]">Carregando globo 3D...</div>
    </div>
  );
}

class GlobeErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: unknown) {
    console.warn("[LiveGlobe] failed to render, falling back:", err);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
