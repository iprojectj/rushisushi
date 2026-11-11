import assert from "node:assert/strict";
import test from "node:test";
import { aggregatePurchaseGeography, isConfirmedPurchase } from "../src/lib/purchase-geography.server.ts";
import { captureCheckoutLocation, locateMunicipality, normalizeState, readOrderLocation } from "../src/lib/brazil-locations.server.ts";
import municipalities from "../src/data/brazil-municipalities.json" with { type: "json" };

const start = "2026-11-11T00:00:00.000Z", end = "2026-11-11T23:59:59.999Z";
const row = (id, fields = {}, orderId = id) => ({
  id, order_id: orderId, created_at: "2026-11-11T12:00:00.000Z",
  fields: { payment_status: "paid", location: { city: "Curitiba", region_code: "PR" }, ...fields },
});

test("the municipal dataset covers all UFs with unique, valid coordinates", () => {
  assert.equal(new Set(municipalities.map((city) => city[2])).size, 27);
  assert.ok(municipalities.length >= 5570);
  assert.equal(new Set(municipalities.map((city) => city[0])).size, municipalities.length);
  for (const [, name, uf, lat, lng] of municipalities) {
    // Includes Fernando de Noronha, east of the mainland.
    assert.ok(lat >= -34 && lat <= 6 && lng >= -74 && lng <= -32, `${name}/${uf}`);
    assert.equal(locateMunicipality(name, uf).lat, lat);
  }
});

test("Curitiba is placed in Paraná, with canonical names and no IP dependence", () => {
  const location = locateMunicipality(" curitiba ", "Parana");
  assert.equal(location.city, "Curitiba");
  assert.equal(location.region_code, "PR");
  assert.equal(location.region, "Paraná");
  assert.ok(location.lat < -25.3 && location.lat > -25.5);
  assert.ok(location.lng < -49.2 && location.lng > -49.4);
  assert.equal(normalizeState("BR-PR"), "PR");
  assert.notEqual(locateMunicipality("Bom Jesus", "PI").municipality_id,
    locateMunicipality("Bom Jesus", "RS").municipality_id);
});

test("two paid purchases in Curitiba create one city marker and Paraná count 2", () => {
  const data = aggregatePurchaseGeography([
    row("one"), row("two"),
    row("pending", { payment_status: "pending" }),
    row("visitor", { payment_status: undefined, max_step: 6 }),
    row("failed", { payment_status: "failed", utmify_paid_sent: true }),
    row("refunded", { payment_status: "refunded", utmify_paid_sent: true }),
    row("test", { integration_test: true }),
  ], start, end);
  assert.equal(data.total, 2);
  assert.equal(data.cities.length, 1);
  assert.equal(data.cities[0].city, "Curitiba");
  assert.equal(data.cities[0].count, 2);
  assert.deepEqual(data.states, [{ code: "PR", name: "Paraná", count: 2 }]);
});

test("duplicate confirmations count once, distinct orders by the same buyer count separately", () => {
  const data = aggregatePurchaseGeography([row("1", {}, "same"), row("2", {}, "same"), row("3")], start, end);
  assert.equal(data.total, 2);
  assert.equal(data.cities[0].count, 2);
});

test("the selected period uses confirmation time, not the visitor or checkout time", () => {
  const priorCheckout = row("prior", { paid_at: "2026-11-11T00:00:00.000Z" });
  priorCheckout.created_at = "2026-11-09T08:00:00.000Z";
  const data = aggregatePurchaseGeography([
    priorCheckout,
    row("later", { paid_at: "2026-11-12T00:00:00.000Z" }),
    row("end", { paid_at: end }),
  ], start, end);
  assert.equal(data.total, 2);
  assert.throws(() => aggregatePurchaseGeography([], end, start), /Período inválido/);
});

test("legacy paid orders and address field names remain supported", () => {
  const data = aggregatePurchaseGeography([row("legacy", {
    payment_status: undefined, utmify_paid_sent: true, location: undefined,
    endereco: { cidade: "Sao Paulo", estado: "são paulo" },
    utmify_payload: { approvedDate: "2026-11-11 12:00:00" },
  })], start, end);
  assert.equal(data.total, 1);
  assert.equal(data.cities[0].city, "São Paulo");
  assert.equal(data.states[0].code, "SP");
  assert.equal(isConfirmedPurchase({ integration_test: "true", payment_status: "paid" }), false);
});

test("missing city stays unmapped, and missing UF is counted as unidentified", () => {
  const data = aggregatePurchaseGeography([
    row("unknown", { location: undefined }),
    row("state-only", { location: { region_code: "PR" } }),
    row("not-a-city", { location: { city: "does not exist", region_code: "PR", lat: 0, lng: 0 } }),
  ], start, end);
  assert.equal(data.total, 3);
  assert.equal(data.unmapped, 3);
  assert.deepEqual(data.cities, []);
  assert.deepEqual(data.states, [
    { code: "PR", name: "Paraná", count: 2 },
    { code: "unknown", name: "Não identificado", count: 1 },
  ]);
  assert.equal(data.states.reduce((sum, state) => sum + state.count, 0), data.total);
  assert.equal(readOrderLocation({ location: { lat: 0, lng: 0 } }).lat, null);
});

test("the server uses the delivery CEP result over stale browser city values", async () => {
  let requested;
  const location = await captureCheckoutLocation({ cep: "80010-000", cidade: "São Paulo", estado: "SP" }, async (url) => {
    requested = url;
    return Response.json({ localidade: "Curitiba", uf: "PR" });
  });
  assert.equal(requested, "https://viacep.com.br/ws/80010000/json/");
  assert.equal(location.city, "Curitiba");
  assert.equal(location.source, "cep");
  assert.equal(location.cep, "80010000");
});

test("CEP failure cannot fail a payment, and unavailable locations are not fabricated", async (context) => {
  context.mock.method(console, "warn", () => {});
  const fallback = await captureCheckoutLocation({ cep: "80010000", cidade: "Curitiba", estado: "PR" },
    async () => { throw new Error("network unavailable"); });
  assert.equal(fallback.region_code, "PR");
  assert.equal(fallback.source, "checkout");
  const unknown = await captureCheckoutLocation({}, async () => { throw new Error("must not fetch"); });
  assert.equal(unknown.source, "unavailable");
  assert.equal(unknown.city, null);
  assert.equal(unknown.lat, null);
});
