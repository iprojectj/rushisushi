import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { queryDb } from "@/lib/db.server";
import { requireAdmin } from "@/lib/admin-auth.functions";

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["recebida", "em_analise", "contato_whatsapp", "aprovada", "estornada", "negada"]),
  message: z.string().max(500).nullable(),
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
    const fields = JSON.stringify({
      status: data.status,
      statusMessage: data.message?.trim() || null,
      updatedAt: new Date().toISOString(),
    });
    const rows = await queryDb(
      `UPDATE lead_submissions
       SET fields = fields || $1::jsonb
       WHERE id = $2::uuid AND form_type = 'refund_request'
       RETURNING id, fields`,
      [fields, data.id],
    );
    if (!rows[0]) throw new Error("Solicitação de reembolso não encontrada.");
    return rows[0];
  });
