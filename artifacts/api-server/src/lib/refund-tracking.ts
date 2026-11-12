import { randomBytes } from "node:crypto";

type RefundTrackingClient = {
  query(queryText: string, values?: any[]): Promise<{ rows: any[] }>;
};

const TRACKING_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const TRACKING_CODE_LOCK_KEY = 5_676_138_262;

function makeTrackingCode() {
  let code = "";
  while (code.length < 8) {
    for (const byte of randomBytes(16)) {
      // 252 is the largest multiple of 36 below 256, so every symbol is equally likely.
      if (byte >= 252) continue;
      code += TRACKING_CODE_ALPHABET[byte % TRACKING_CODE_ALPHABET.length];
      if (code.length === 8) break;
    }
  }
  return code;
}

export async function lockRefundTrackingCodes(client: RefundTrackingClient) {
  await client.query("SELECT pg_advisory_xact_lock($1::bigint)", [TRACKING_CODE_LOCK_KEY]);
}

/**
 * Call after lockRefundTrackingCodes inside the same transaction.
 */
export async function createUniqueRefundTrackingCode(client: RefundTrackingClient) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = makeTrackingCode();
    const collision = await client.query(
      `SELECT EXISTS (
         SELECT 1
         FROM lead_submissions
         WHERE form_type = 'refund_request'
           AND fields->>'protocol' = $1
       ) AS exists`,
      [code],
    );
    if (!(collision.rows[0] as { exists?: boolean } | undefined)?.exists) return code;
  }

  throw new Error("Could not allocate a unique refund tracking code.");
}
