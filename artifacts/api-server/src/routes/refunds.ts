import { Router, type Request, type Response } from "express";
import {
  CreateRefundRequestBody,
  CreateRefundRequestResponse,
  TrackRefundRequestBody,
  TrackRefundRequestResponse,
} from "@workspace/api-zod";
import { pool } from "@workspace/db";
import { createUniqueRefundTrackingCode, lockRefundTrackingCodes } from "../lib/refund-tracking";
import { getPublicRefundStatus, type RefundStatus } from "../lib/refund-status";

const router = Router();
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const REQUEST_WINDOW_MS = 10 * 60_000;
const STATUS_WINDOW_MS = 10 * 60_000;

type RefundRow = {
  id: string;
  order_id: string | null;
  nome: string | null;
  email: string | null;
  whatsapp: string | null;
  created_at: Date | string;
  fields: Record<string, unknown>;
};

function clientKey(request: Request, scope: string) {
  const forwarded = request.get("cf-connecting-ip") || request.get("x-forwarded-for")?.split(",")[0].trim();
  return `${scope}:${forwarded || request.ip || "unknown"}`;
}

function allowRequest(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  if (rateLimits.size > 5000) {
    for (const [entryKey, value] of rateLimits) {
      if (value.resetAt <= now) rateLimits.delete(entryKey);
    }
  }
  const current = rateLimits.get(key);
  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= maxRequests) return false;
  current.count += 1;
  return true;
}

function errorResponse(response: Response, status: number, message: string) {
  response.status(status).json({ error: message });
}

function allowedOrigin(request: Request) {
  const origin = request.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host.toLowerCase();
    const requestHost = (
      request.get("x-forwarded-host")?.split(",")[0].trim() ||
      request.get("host") ||
      ""
    ).toLowerCase();
    return originHost === requestHost ||
      originHost === "rushisushi.delivery" ||
      originHost === "www.rushisushi.delivery" ||
      originHost.endsWith(".replit.dev") ||
      originHost.endsWith(".replit.app") ||
      originHost.startsWith("localhost:");
  } catch {
    return false;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function statusMessage(status: RefundStatus, message: unknown) {
  if (typeof message === "string" && message.trim()) return message.trim().slice(0, 500);
  const defaults: Record<RefundStatus, string> = {
    recebida: "Seu pedido de reembolso foi recebido com sucesso. Ele está em andamento; acompanhe as atualizações por aqui.",
    em_analise: "Nossa equipe está analisando sua solicitação.",
    aprovada: "Sua solicitação foi autorizada. A equipe está realizando o reembolso manual.",
    estornada: "Reembolso efetivado. A equipe confirmou a devolução do valor.",
    negada: "A equipe concluiu a análise e não aprovou a solicitação.",
  };
  return defaults[status];
}

router.post("/refund-requests", async (request, response) => {
  if (!allowedOrigin(request)) {
    errorResponse(response, 403, "Origem não autorizada.");
    return;
  }
  if (!allowRequest(clientKey(request, "refund-create"), 8, REQUEST_WINDOW_MS)) {
    errorResponse(response, 429, "Muitas tentativas. Aguarde alguns minutos e tente novamente.");
    return;
  }

  const parsed = CreateRefundRequestBody.safeParse(request.body);
  if (!parsed.success) {
    errorResponse(response, 400, "Confira os dados informados e tente novamente.");
    return;
  }

  const input = parsed.data;
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const whatsapp = input.whatsapp.replace(/\D/g, "");
  const publicOrderNumber = input.orderId.trim().toUpperCase();
  const details = input.details.trim();
  if (
    whatsapp.length < 10 ||
    whatsapp.length > 13 ||
    !name ||
    !details ||
    !/^#RS-[0-9]+$/.test(publicOrderNumber)
  ) {
    errorResponse(response, 400, "Confira os dados informados e tente novamente.");
    return;
  }

  try {
    // Accept requests only for a paid order and only from the phone used at checkout.
    const paidOrder = await pool.query<RefundRow>(
      `SELECT id, order_id, nome, email, whatsapp, created_at, fields
       FROM lead_submissions
       WHERE form_type = 'checkout'
         AND fields->>'public_order_number' = $1
         AND whatsapp = $2
         AND (
           fields->>'payment_status' = 'paid' OR
           fields->>'utmify_paid_sent' = 'true'
         )
       LIMIT 1`,
      [publicOrderNumber, whatsapp],
    );
    if (!paidOrder.rows[0]) {
      errorResponse(response, 400, "Não foi possível confirmar um pedido pago com esses dados.");
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await lockRefundTrackingCodes(client);
      const existing = await client.query<RefundRow>(
        `SELECT id, order_id, nome, email, whatsapp, created_at, fields
         FROM lead_submissions
         WHERE id = $1::uuid AND form_type = 'refund_request'
         LIMIT 1
         FOR UPDATE`,
        [input.requestKey],
      );
      if (existing.rows[0]) {
        const row = existing.rows[0];
        const fields = asRecord(row.fields);
        if (
          row.order_id !== paidOrder.rows[0].order_id ||
          row.whatsapp !== whatsapp ||
          row.email !== email ||
          fields.publicOrderNumber !== publicOrderNumber
        ) {
          await client.query("ROLLBACK");
          errorResponse(response, 409, "Não foi possível reutilizar esta solicitação. Atualize a página e tente novamente.");
          return;
        }
        await client.query("COMMIT");
        response.status(201).json(CreateRefundRequestResponse.parse({
          protocol: fields.protocol,
          status: fields.status || "recebida",
          createdAt: row.created_at,
        }));
        return;
      }

      const protocol = await createUniqueRefundTrackingCode(client);
      const now = new Date().toISOString();
      const fields = JSON.stringify({
        protocol,
        reason: input.reason,
        details,
        publicOrderNumber,
        status: "recebida",
        statusMessage: null,
        refundCompleted: false,
        refundCompletedAt: null,
        createdAt: now,
        updatedAt: now,
      });
      const inserted = await client.query<RefundRow>(
        `INSERT INTO lead_submissions
           (id, form_type, order_id, nome, email, whatsapp, fields)
         VALUES ($1::uuid, 'refund_request', $2, $3, $4, $5, $6::jsonb)
         ON CONFLICT (id) DO NOTHING
         RETURNING id, order_id, nome, email, whatsapp, created_at, fields`,
        [input.requestKey, paidOrder.rows[0].order_id, name, email, whatsapp, fields],
      );
      if (!inserted.rows[0]) {
        await client.query("ROLLBACK");
        errorResponse(response, 409, "Não foi possível registrar a solicitação. Atualize a página e tente novamente.");
        return;
      }

      await client.query("COMMIT");
      const savedFields = asRecord(inserted.rows[0].fields);
      response.status(201).json(CreateRefundRequestResponse.parse({
        protocol: savedFields.protocol,
        status: savedFields.status,
        createdAt: inserted.rows[0].created_at,
      }));
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    request.log.error({ error }, "Failed to register a refund request");
    errorResponse(response, 500, "Não foi possível registrar sua solicitação agora.");
  }
});

router.post("/refund-requests/track", async (request, response) => {
  if (!allowedOrigin(request)) {
    errorResponse(response, 403, "Origem não autorizada.");
    return;
  }
  if (!allowRequest(clientKey(request, "refund-track"), 30, STATUS_WINDOW_MS)) {
    errorResponse(response, 429, "Muitas consultas. Aguarde alguns minutos e tente novamente.");
    return;
  }

  const parsed = TrackRefundRequestBody.safeParse(request.body);
  if (!parsed.success) {
    errorResponse(response, 400, "Informe um protocolo válido.");
    return;
  }
  const protocol = parsed.data.protocol.trim().toUpperCase();
  if (!/^(?:[A-Z0-9]{8}|RS-[A-F0-9]{32})$/.test(protocol)) {
    errorResponse(response, 404, "Não encontramos uma solicitação com esse protocolo.");
    return;
  }

  try {
    const result = await pool.query<RefundRow>(
      `SELECT id, order_id, nome, email, whatsapp, created_at, fields
       FROM lead_submissions
       WHERE form_type = 'refund_request'
         AND fields->>'protocol' = $1
       LIMIT 1`,
      [protocol],
    );
    const row = result.rows[0];
    if (!row) {
      errorResponse(response, 404, "Não encontramos uma solicitação com esse protocolo.");
      return;
    }

    const fields = asRecord(row.fields);
    const updatedAt = typeof fields.updatedAt === "string" ? fields.updatedAt : row.created_at;
    const createdAt = row.created_at;
    const createdTime = new Date(createdAt).getTime();
    const deadlineAt = new Date((Number.isFinite(createdTime) ? createdTime : Date.now()) + 15 * 24 * 60 * 60 * 1000);
    const refundCompleted = fields.status !== "negada" &&
      (fields.refundCompleted === true || fields.status === "estornada");
    const deadlineReached = Date.now() >= deadlineAt.getTime();
    const safeStatus = getPublicRefundStatus(fields.status, refundCompleted, deadlineAt.getTime(), Date.now());
    const message = refundCompleted && !deadlineReached
      ? "A equipe confirmou a devolução do valor. O status final será atualizado no acompanhamento ao fim do prazo de 15 dias."
      : safeStatus === "estornada"
        ? statusMessage("estornada", null)
        : statusMessage(safeStatus, fields.statusMessage);
    response.set("Cache-Control", "private, no-store");
    response.set("Referrer-Policy", "no-referrer");
    response.json(TrackRefundRequestResponse.parse({
      protocol,
      status: safeStatus,
      createdAt,
      deadlineAt,
      updatedAt,
      message,
      refundCompleted,
      customerName: row.nome,
      email: row.email,
      whatsapp: row.whatsapp,
      orderNumber: typeof fields.publicOrderNumber === "string" ? fields.publicOrderNumber : null,
      reason: typeof fields.reason === "string" ? fields.reason : null,
      details: typeof fields.details === "string" ? fields.details : null,
    }));
  } catch (error) {
    request.log.error({ error }, "Failed to track a refund request");
    errorResponse(response, 500, "Não foi possível consultar o protocolo agora.");
  }
});

export default router;
