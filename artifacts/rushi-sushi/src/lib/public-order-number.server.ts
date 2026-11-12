import type postgres from "postgres";
import { getDb } from "@/lib/db.server";

const PUBLIC_ORDER_LOCK_KEY = 5_676_138_261;
const FIRST_PUBLIC_ORDER_NUMBER = 2812;

type CheckoutInsert = {
  nome: string;
  whatsapp: string;
  email: string;
  fields: Record<string, unknown>;
};

type CheckoutRow = {
  id: string;
  fields: Record<string, unknown> | string | null;
};
type NumberTransaction = postgres.TransactionSql;

function parseFields(value: CheckoutRow["fields"]) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return value ?? {};
}

async function lockOrderNumbers(tx: NumberTransaction) {
  await tx.unsafe("SELECT pg_advisory_xact_lock($1::bigint)", [PUBLIC_ORDER_LOCK_KEY]);
}

async function nextPublicOrderNumber(tx: NumberTransaction) {
  const rows = await tx.unsafe(
    `SELECT COALESCE(
       MAX(SUBSTRING(fields->>'public_order_number' FROM 5)::BIGINT),
       $1::BIGINT - 1
     ) + 1 AS next_number
     FROM lead_submissions
     WHERE form_type = 'checkout'
       AND fields->>'public_order_number' ~ '^#RS-[0-9]+$'`,
    [FIRST_PUBLIC_ORDER_NUMBER],
  );
  return `#RS-${String(rows[0]?.next_number ?? FIRST_PUBLIC_ORDER_NUMBER)}`;
}

export async function createCheckoutWithPublicOrderNumber(input: CheckoutInsert) {
  const database = getDb();
  return database.begin(async (tx) => {
    await lockOrderNumbers(tx);
    const publicOrderNumber = await nextPublicOrderNumber(tx);
    const fields = JSON.stringify({
      ...input.fields,
      public_order_number: publicOrderNumber,
    });
    const rows = await tx.unsafe(
      `INSERT INTO lead_submissions
         (form_type, nome, whatsapp, email, fields)
       VALUES ('checkout', $1, $2, $3, $4::jsonb)
       RETURNING id`,
      [input.nome, input.whatsapp, input.email, fields],
    );
    if (!rows[0]?.id) throw new Error("Não foi possível reservar o número do pedido.");
    return { id: String(rows[0].id), publicOrderNumber };
  });
}

export async function attachGatewayTransaction(
  checkoutId: string,
  transactionId: string,
  fields: Record<string, unknown>,
) {
  const database = getDb();
  const rows = await database.unsafe(
    `UPDATE lead_submissions
     SET order_id = $1,
         fields = fields || $2::jsonb
     WHERE id = $3::uuid AND form_type = 'checkout'
     RETURNING id`,
    [transactionId, JSON.stringify(fields), checkoutId],
  );
  if (!rows[0]) throw new Error("Não foi possível vincular a transação ao pedido.");
}

export async function setCheckoutCreationFailure(checkoutId: string) {
  const database = getDb();
  await database.unsafe(
    `UPDATE lead_submissions
     SET fields = fields || $1::jsonb
     WHERE id = $2::uuid AND form_type = 'checkout' AND order_id IS NULL`,
    [JSON.stringify({ payment_creation_status: "failed" }), checkoutId],
  );
}

export async function resolveLegacyPublicOrderNumber(transactionId: string, whatsapp: string) {
  const database = getDb();
  const phone = whatsapp.replace(/\D/g, "");
  if (!transactionId || phone.length < 10 || phone.length > 13) return null;

  return database.begin(async (tx) => {
    await lockOrderNumbers(tx);
    const rows = await tx.unsafe(
      `SELECT id, fields
       FROM lead_submissions
       WHERE form_type = 'checkout'
         AND order_id = $1
         AND whatsapp = $2
       LIMIT 1
       FOR UPDATE`,
      [transactionId, phone],
    );
    const row = rows[0] as unknown as CheckoutRow | undefined;
    if (!row) return null;

    const fields = parseFields(row.fields);
    const existing = fields.public_order_number;
    if (typeof existing === "string" && /^#RS-[0-9]+$/.test(existing)) return existing;

    const publicOrderNumber = await nextPublicOrderNumber(tx);
    await tx.unsafe(
      `UPDATE lead_submissions
       SET fields = fields || $1::jsonb
       WHERE id = $2::uuid`,
      [JSON.stringify({ public_order_number: publicOrderNumber }), row.id],
    );
    return publicOrderNumber;
  });
}
