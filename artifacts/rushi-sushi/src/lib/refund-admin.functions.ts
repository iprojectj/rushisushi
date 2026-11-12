import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { queryDb } from "@/lib/db.server";
import { requireAdmin } from "@/lib/admin-auth.functions";

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["recebida", "em_analise", "aprovada", "negada"]),
  message: z.string().max(500).nullable(),
  refundCompleted: z.boolean(),
});

export const getAdminRefundRequests = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => queryDb(
    `SELECT id, order_id, created_at, nome, email, whatsapp, fields
     FROM lead_submissions
     WHERE form_type = 'refund_request'
     ORDER BY created_at DESC
     LIMIT 500`,
  ));

export const updateAdminRefundRequest = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.refundCompleted && data.status !== "aprovada") {
      throw new Error("Marque a solicitação como aprovada antes de confirmar o reembolso efetivado.");
    }
    const now = new Date().toISOString();
    const fields = JSON.stringify({
      status: data.status,
      statusMessage: data.message?.trim() || null,
      refundCompleted: data.refundCompleted,
      updatedAt: now,
    });
    const rows = await queryDb(
      `UPDATE lead_submissions
       SET fields = jsonb_set(
         fields || $1::jsonb,
         '{refundCompletedAt}',
         CASE WHEN $2::boolean
           THEN CASE
             WHEN fields->>'refundCompletedAt' IS NOT NULL THEN fields->'refundCompletedAt'
             ELSE to_jsonb($3::text)
           END
           ELSE 'null'::jsonb
         END,
         true
       )
       WHERE id = $4::uuid AND form_type = 'refund_request'
       RETURNING id, fields`,
      [fields, data.refundCompleted, now, data.id],
    );
    if (!rows[0]) throw new Error("Solicitação de reembolso não encontrada.");
    return rows[0];
  });
