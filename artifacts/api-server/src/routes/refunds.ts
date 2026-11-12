import { randomBytes } from "node:crypto";
import { Router, type Request, type Response } from "express";
import {
  CreateRefundRequestBody,
  CreateRefundRequestResponse,
  TrackRefundRequestBody,
  TrackRefundRequestResponse,
} from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router = Router();
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const REQUEST_WINDOW_MS = 10 * 60_000;
const STATUS_WINDOW_MS = 10 * 60_000;

type RefundStatus = "recebida" | "em_analise" | "aprovada" | "estornada" | "negada";
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
    recebida: "Recebemos sua solicitação. Ela ainda será analisada pela equipe.",
    em_analise: "Nossa equipe está analisando sua solicitação.",
    aprovada: "Sua solicitação foi aprovada. O estorno ainda depende de processamento no gateway.",
    estornada: "O estorno foi marcado como concluído pela equipe.",
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
  const orderId = input.orderId.trim();
  const details = input.details.trim();
  if (whatsapp.length < 10 || whatsapp.length > 13 || !name || !details) {
    errorResponse(response, 400, "Confira os dados informados e tente novamente.");
    return;
  }

  try {
    // Accept requests only for a paid order and only from the phone used at checkout.
    const paidOrder = await pool.query<RefundRow>(
      `SELECT id, order_id, nome, email, whatsapp, created_at, fields
       FROM lead_submissions
       WHERE form_type = 'checkout'
         AND order_id = $1
         AND whatsapp = $2
         AND (
           fields->>'payment_status' = 'paid' OR
           fields->>'utmify_paid_sent' = 'true'
         )
       LIMIT 1`,
      [orderId, whatsapp],
    );
    if (!paidOrder.rows[0]) {
      errorResponse(response, 400, "Não foi possível confirmar um pedido pago com esses dados.");
      return;
    }

    const existing = await pool.query<RefundRow>(
      `SELECT id, order_id, nome, email, whatsapp, created_at, fields
       FROM lead_submissions
       WHERE id = $1::uuid AND form_type = 'refund_request'
       LIMIT 1`,
      [input.requestKey],
    );
    if (existing.rows[0]) {
      const row = existing.rows[0];
      if (row.order_id !== orderId || row.whatsapp !== whatsapp || row.email !== email) {
        errorResponse(response, 409, "Não foi possível reutilizar esta solicitação. Atualize a página e tente novamente.");
        return;
      }
      const fields = asRecord(row.fields);
      response.status(201).json(CreateRefundRequestResponse.parse({
        protocol: fields.protocol,
        status: fields.status || "recebida",
        createdAt: row.created_at,
      }));
      return;
    }

    const now = new Date().toISOString();
    const protocol = `RS-${randomBytes(16).toString("hex").toUpperCase()}`;
    const fields = JSON.stringify({
      protocol,
      reason: input.reason,
      details,
      status: "recebida",
      statusMessage: null,
      createdAt: now,
      updatedAt: now,
    });
    const inserted = await pool.query<RefundRow>(
      `INSERT INTO lead_submissions
         (id, form_type, order_id, nome, email, whatsapp, fields)
       VALUES ($1::uuid, 'refund_request', $2, $3, $4, $5, $6::jsonb)
       ON CONFLICT (id) DO NOTHING
       RETURNING id, order_id, nome, email, whatsapp, created_at, fields`,
      [input.requestKey, orderId, name, email, whatsapp, fields],
    );
    if (!inserted.rows[0]) {
      errorResponse(response, 409, "Não foi possível registrar a solicitação. Atualize a página e tente novamente.");
      return;
    }

    const savedFields = asRecord(inserted.rows[0].fields);
    response.status(201).json(CreateRefundRequestResponse.parse({
      protocol: savedFields.protocol,
      status: savedFields.status,
      createdAt: inserted.rows[0].created_at,
    }));
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
  if (!/^RS-[A-F0-9]{32}$/.test(protocol)) {
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
    const status = fields.status;
    const validStatuses = new Set<RefundStatus>(["recebida", "em_analise", "aprovada", "estornada", "negada"]);
    const safeStatus = validStatuses.has(status as RefundStatus) ? status as RefundStatus : "recebida";
    const updatedAt = typeof fields.updatedAt === "string" ? fields.updatedAt : row.created_at;
    response.json(TrackRefundRequestResponse.parse({
      protocol,
      status: safeStatus,
      updatedAt,
      message: statusMessage(safeStatus, fields.statusMessage),
    }));
  } catch (error) {
    request.log.error({ error }, "Failed to track a refund request");
    errorResponse(response, 500, "Não foi possível consultar o protocolo agora.");
  }
});

export default router;
