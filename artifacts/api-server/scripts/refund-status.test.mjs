import assert from "node:assert/strict";
import test from "node:test";
import { getPublicRefundStatus } from "../src/lib/refund-status.ts";

const deadline = Date.parse("2026-01-16T12:00:00.000Z");

test("does not show an effective refund before confirmation or before day 15", () => {
  assert.equal(getPublicRefundStatus("aprovada", false, deadline, deadline), "aprovada");
  assert.equal(getPublicRefundStatus("aprovada", true, deadline, deadline - 1), "aprovada");
});

test("shows the refund as effective after confirmation and the 15-day deadline", () => {
  assert.equal(getPublicRefundStatus("aprovada", true, deadline, deadline), "estornada");
});

test("keeps legacy completion records behind the same 15-day rule", () => {
  assert.equal(getPublicRefundStatus("estornada", false, deadline, deadline - 1), "aprovada");
  assert.equal(getPublicRefundStatus("estornada", false, deadline, deadline), "estornada");
  assert.equal(getPublicRefundStatus("contato_whatsapp", false, deadline, deadline - 1), "em_analise");
});

test("does not turn a denied request into a refund", () => {
  assert.equal(getPublicRefundStatus("negada", true, deadline, deadline), "negada");
});
