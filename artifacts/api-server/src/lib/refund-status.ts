export type RefundStatus = "recebida" | "em_analise" | "aprovada" | "estornada" | "negada";

const VALID_STATUSES = new Set<RefundStatus>([
  "recebida",
  "em_analise",
  "aprovada",
  "estornada",
  "negada",
]);

export function getPublicRefundStatus(
  savedStatus: unknown,
  refundCompleted: boolean,
  deadlineAtMs: number,
  now: number,
): RefundStatus {
  const normalizedStatus = savedStatus === "contato_whatsapp" ? "em_analise" : savedStatus;
  const status = VALID_STATUSES.has(normalizedStatus as RefundStatus)
    ? normalizedStatus as RefundStatus
    : "recebida";
  if (status === "negada") return "negada";
  const confirmed = refundCompleted || status === "estornada";

  if (confirmed && Number.isFinite(deadlineAtMs) && now >= deadlineAtMs) return "estornada";
  return status === "estornada" ? "aprovada" : status;
}
