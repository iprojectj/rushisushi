import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// InfinitePay webhook. InfinitePay does not sign its calls, so the payload is
// never trusted: we only record the transaction ids it sends and then ask
// InfinitePay itself (via /verificar-status -> payment_check) whether it was paid.
const schema = z.object({
  order_nsu: z.string().min(1).max(100),
  transaction_nsu: z.string().max(200).optional(),
  invoice_slug: z.string().max(200).optional(),
});

export const Route = createFileRoute("/api/public/infinitepay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof schema>;
        try {
          body = schema.parse(await request.json());
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: row } = await supabaseAdmin
            .from("lead_submissions")
            .select("id, fields")
            .eq("order_id", body.order_nsu)
            .eq("form_type", "checkout")
            .maybeSingle();
          const fields = (row?.fields ?? {}) as Record<string, any>;
          if (!row || fields.gateway !== "infinitepay") return new Response("Unknown order", { status: 200 });

          const info = fields.infinitepay ?? {};
          await supabaseAdmin
            .from("lead_submissions")
            .update({
              fields: {
                ...fields,
                infinitepay: {
                  ...info,
                  transaction_nsu: body.transaction_nsu ?? info.transaction_nsu,
                  slug: body.invoice_slug ?? info.slug,
                },
              },
            })
            .eq("id", row.id);

          const origin = new URL(request.url).origin;
          const res = await fetch(`${origin}/verificar-status/${encodeURIComponent(body.order_nsu)}`);
          const status = (await res.json().catch(() => ({}))) as { status?: string };
          // 400 makes InfinitePay retry later if the payment isn't confirmed yet.
          return new Response(status.status === "paid" ? "ok" : "not confirmed", { status: status.status === "paid" ? 200 : 400 });
        } catch (e) {
          console.error("[infinitepay-webhook] erro:", e);
          return new Response("error", { status: 400 });
        }
      },
    },
  },
});
