import { createFileRoute } from "@tanstack/react-router";
import { checkRateLimit } from "@/lib/paradise.server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonOnlyDigits(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).replace(/\D/g, "");
  return s.length ? s : null;
}

export const Route = createFileRoute("/api/public/lead-submit")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: CORS_HEADERS }),
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as any;
          const form_type = String(body?.form_type ?? "").trim().slice(0, 60);
          if (!form_type) {
            return new Response(
              JSON.stringify({ success: false, message: "form_type obrigatório" }),
              { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
            );
          }

          // ===== Rate limit anti-flood (folga generosa p/ não afetar lead real) =====
          // Lead real dispara ~5-8 eventos em toda a jornada. Limites bem acima disso.
          const ipHeaderRL =
            request.headers.get("cf-connecting-ip") ||
            request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            "unknown";
          const waRL = jsonOnlyDigits(body?.whatsapp);
          const limIp = checkRateLimit(`lead:ip:${ipHeaderRL}`, 80, 10 * 60_000);
          const limWa = waRL
            ? checkRateLimit(`lead:wa:${waRL}`, 60, 10 * 60_000)
            : { allowed: true, retryAfterSec: 0 };
          if (!limIp.allowed || !limWa.allowed) {
            const retry = Math.max(limIp.retryAfterSec, limWa.retryAfterSec);
            console.warn(
              `[RATE-LIMIT] Bloqueado lead-submit ip=${ipHeaderRL} wa=${waRL} retry=${retry}s`
            );
            // Devolve 200 "silencioso" pro cliente real nunca ver erro; bot só é ignorado.
            return new Response(
              JSON.stringify({ success: true, throttled: true }),
              { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
            );
          }


          const nome = body?.nome ? String(body.nome).slice(0, 200) : null;
          const whatsapp = jsonOnlyDigits(body?.whatsapp);
          const email = body?.email ? String(body.email).slice(0, 200) : null;
          const order_id = body?.order_id ? String(body.order_id).slice(0, 120) : null;
          const fields =
            body?.fields && typeof body.fields === "object" ? body.fields : {};
          const page_url = body?.page_url ? String(body.page_url).slice(0, 500) : null;
          const user_agent = request.headers.get("user-agent")?.slice(0, 500) ?? null;
          const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
            request.headers.get("cf-connecting-ip") ??
            null;

          const { supabaseAdmin } = await import(
            "@/integrations/supabase/client.server"
          );

          // Upsert lead by whatsapp
          let leadId: string | null = null;
          if (whatsapp) {
            const { data: existing } = await supabaseAdmin
              .from("leads")
              .select("id, nome, email")
              .eq("whatsapp", whatsapp)
              .maybeSingle();
            if (existing) {
              leadId = existing.id;
              await supabaseAdmin
                .from("leads")
                .update({
                  last_seen_at: new Date().toISOString(),
                  nome: nome ?? existing.nome,
                  email: email ?? existing.email,
                })
                .eq("id", leadId);
            } else {
              const { data: inserted } = await supabaseAdmin
                .from("leads")
                .insert({ whatsapp, nome, email })
                .select("id")
                .single();
              leadId = inserted?.id ?? null;
            }
          }

          const { error } = await supabaseAdmin.from("lead_submissions").insert({
            lead_id: leadId,
            form_type,
            order_id,
            nome,
            whatsapp,
            email,
            fields,
            page_url,
            user_agent,
            ip,
          });
          if (error) throw error;

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        } catch (e: any) {
          console.error("lead-submit erro:", e?.message ?? e);
          return new Response(
            JSON.stringify({ success: false, message: "Erro ao registrar." }),
            { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
          );
        }
      },
    },
  },
});
