import { createFileRoute } from "@tanstack/react-router";
import { checkRateLimit } from "@/lib/paradise.server";

/** Anonymous visitor heartbeat. Accepts only small, sanitized fields; never returns data. */
const clip = (v: unknown, n: number) => (typeof v === "string" && v ? v.slice(0, n) : null);

export const Route = createFileRoute("/api/public/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const b = JSON.parse((await request.text()).slice(0, 2000) || "{}");
          const sid = clip(b.sid, 40);
          if (!sid || !/^[a-z0-9]+$/i.test(sid)) return new Response(null, { status: 204 });
          if (!checkRateLimit(`trk:${sid}`, 30, 60_000).allowed) return new Response(null, { status: 204 });
          const step = Math.max(1, Math.min(6, Number(b.step) || 1));
          const city = clip(request.headers.get("cf-ipcity"), 60);
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const now = new Date().toISOString();
          const { data: cur } = await supabaseAdmin
            .from("site_sessions").select("max_step,pageviews").eq("id", sid).maybeSingle();
          if (cur) {
            await supabaseAdmin.from("site_sessions").update({
              last_seen: now, path: clip(b.path, 120),
              max_step: Math.max(cur.max_step, step),
              pageviews: cur.pageviews + (b.pv ? 1 : 0),
            }).eq("id", sid);
          } else {
            await supabaseAdmin.from("site_sessions").insert({
              id: sid, path: clip(b.path, 120), max_step: step,
              utm_source: clip(b.us, 60), utm_campaign: clip(b.uc, 120),
              device: b.d === "mobile" ? "mobile" : "desktop", city,
            });
          }
        } catch (e) {
          console.error("[track]", e);
        }
        return new Response(null, { status: 204 });
      },
    },
  },
});
