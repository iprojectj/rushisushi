import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { resolveLegacyPublicOrderNumber } from "@/lib/public-order-number.server";

const resolveSchema = z.object({
  transactionId: z.string().trim().min(1).max(120),
  whatsapp: z.string().trim().min(10).max(20),
});

export const resolvePublicOrderNumberForRefund = createServerFn({ method: "POST" })
  .validator((input: unknown) => resolveSchema.parse(input))
  .handler(async ({ data }) =>
    resolveLegacyPublicOrderNumber(data.transactionId, data.whatsapp),
  );
