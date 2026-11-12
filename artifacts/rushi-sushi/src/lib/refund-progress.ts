const DAY_MS = 24 * 60 * 60 * 1000;
const WAITING_WINDOW_DAYS = 15;

export function getRefundProgress(
  createdAt: string,
  deadlineAt: string,
  now: number,
  status: string,
) {
  const createdAtMs = new Date(createdAt).getTime();
  const deadlineAtMs = new Date(deadlineAt).getTime();
  const elapsedMs = Number.isFinite(createdAtMs) ? Math.max(0, now - createdAtMs) : 0;
  const elapsedDays = Math.min(WAITING_WINDOW_DAYS, Math.floor(elapsedMs / DAY_MS));
  const calculatedPercent = Math.min(
    100,
    5 + Math.floor((elapsedDays / WAITING_WINDOW_DAYS) * 95),
  );
  const remainingDays = Number.isFinite(deadlineAtMs)
    ? Math.max(0, Math.ceil((deadlineAtMs - now) / DAY_MS))
    : Math.max(0, WAITING_WINDOW_DAYS - elapsedDays);

  return {
    percent: status === "estornada" ? 100 : calculatedPercent,
    elapsedDays,
    remainingDays,
  };
}
