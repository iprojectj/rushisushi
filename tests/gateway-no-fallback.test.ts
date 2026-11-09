import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

const pixRoute = readFileSync('src/routes/criar-pix.ts', 'utf8');
const settingsPage = readFileSync('src/routes/_authenticated/admin.settings.tsx', 'utf8');

describe('PIX gateway selection has no automatic fallback', () => {
  it('calls the gateway API only for the gateway chosen in the panel', () => {
    // um único ponto de chamada, e ele usa exatamente o gateway escolhido no painel
    expect(pixRoute.match(/gerarPix\(/g)).toHaveLength(1);
    expect(pixRoute).toContain('await gerarPix(activeGateway)');
    // nenhum gateway fixo ("paradise", "pagbank", ...) é passado como tentativa extra
    expect(pixRoute).not.toMatch(/gerarPix\(\s*["'`]/);
    // e não existe laço tentando gateways um atrás do outro
    expect(pixRoute).not.toMatch(/for\s*\(\s*(const|let)\s+\w+\s+of\s+\w*/i);
    expect(pixRoute).not.toMatch(/const ordem\s*=/);
  });

  it('does not tell the admin that other gateways are tried automatically', () => {
    expect(settingsPage).not.toMatch(/tenta os outros/i);
    expect(settingsPage).toMatch(/nenhum outro gateway/i);
  });
});
