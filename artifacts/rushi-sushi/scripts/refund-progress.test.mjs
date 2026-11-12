import assert from "node:assert/strict";
import test from "node:test";
import { getRefundProgress } from "../src/lib/refund-progress.ts";

const DAY_MS = 24 * 60 * 60 * 1000;
const createdAt = new Date("2026-01-01T12:00:00.000Z").toISOString();
const deadlineAt = new Date(Date.parse(createdAt) + 15 * DAY_MS).toISOString();
const start = Date.parse(createdAt);

test("starts at 5 percent and increases once per elapsed day", () => {
  assert.equal(getRefundProgress(createdAt, deadlineAt, start, "recebida").percent, 5);
  assert.equal(getRefundProgress(createdAt, deadlineAt, start + DAY_MS, "recebida").percent, 11);
  assert.equal(getRefundProgress(createdAt, deadlineAt, start + 14 * DAY_MS, "recebida").percent, 93);
});

test("reaches 100 percent at the 15-day deadline", () => {
  const progress = getRefundProgress(createdAt, deadlineAt, start + 15 * DAY_MS, "recebida");
  assert.equal(progress.percent, 100);
  assert.equal(progress.elapsedDays, 15);
  assert.equal(progress.remainingDays, 0);
});

test("shows a full progress bar for a refund status confirmed by the team", () => {
  assert.equal(getRefundProgress(createdAt, deadlineAt, start + DAY_MS, "estornada").percent, 100);
});
