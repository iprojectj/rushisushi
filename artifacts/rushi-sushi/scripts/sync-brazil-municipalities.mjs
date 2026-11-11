import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

// Pinned, MIT-licensed source. This is a development-time import, not a runtime API.
const revision = "503e2f70bbf1b4b7ec0b1f68b09086ccc38fe861";
const base = `https://raw.githubusercontent.com/kelvins/municipios-brasileiros/${revision}`;
async function download(path) {
  const response = await fetch(`${base}/${path}`, { signal: AbortSignal.timeout(30_000) });
  assert.ok(response.ok, `${path}: HTTP ${response.status}`);
  return response.text();
}
const [citiesJson, statesJson, license] = await Promise.all([
  download("json/municipios.json"), download("json/estados.json"), download("LICENSE"),
]);
const states = new Map(JSON.parse(statesJson).map((state) => [state.codigo_uf, state.uf]));
const cities = JSON.parse(citiesJson).map((city) => [
  city.codigo_ibge, city.nome, states.get(city.codigo_uf), city.latitude, city.longitude,
]);
assert.ok(cities.length >= 5500);
assert.ok(cities.every(([id, name, uf, lat, lng]) =>
  Number.isInteger(id) && typeof name === "string" && /^[A-Z]{2}$/.test(uf)
  && Number.isFinite(lat) && Number.isFinite(lng)));
const dir = new URL("../src/data/", import.meta.url);
await mkdir(dir, { recursive: true });
await writeFile(new URL("brazil-municipalities.json", dir), `${JSON.stringify(cities)}\n`);
await writeFile(new URL("brazil-municipalities.LICENSE.txt", dir),
  `Source: https://github.com/kelvins/municipios-brasileiros\nRevision: ${revision}\nFormat: [IBGE municipality code, name, UF, latitude, longitude]\n\n${license}`);
console.log(`Imported ${cities.length} Brazilian municipalities (${states.size} states).`);
